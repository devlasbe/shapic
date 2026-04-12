import { app, BrowserWindow, shell, protocol, net, Menu, nativeImage } from "electron";
import { join } from "path";
import { pathToFileURL } from "node:url";
import { registerAllIpcHandlers } from "./ipc/index.js";

app.name = "Shapic";

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Shapic",
    icon: join(__dirname, "../../resources/icon.png"),
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 12, y: 14 },
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (!app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
};

app.whenReady().then(() => {
  // file:// 프로토콜로 로컬 이미지 접근 허용
  protocol.handle("local-file", (request) => {
    const filePath = decodeURIComponent(request.url.replace("local-file://", ""));
    return net.fetch(pathToFileURL(filePath).href);
  });

  // 앱 아이콘 경로
  const iconPath = join(__dirname, "../../resources/icon.png");

  // macOS dock 아이콘 설정 (dev 모드에서도 적용)
  if (process.platform === "darwin") {
    app.dock?.setIcon(nativeImage.createFromPath(iconPath));
  }

  // macOS About 패널 설정
  app.setAboutPanelOptions({
    applicationName: "Shapic",
    applicationVersion: app.getVersion(),
    copyright: "Copyright © 2026 lasbe",
    credits: "devlasbe@gmail.com\nhttps://lasbe.kr",
    website: "https://lasbe.kr",
  });

  // macOS 앱 메뉴 구성
  if (process.platform === "darwin") {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: app.name,
        submenu: [
          { role: "about" },
          { type: "separator" },
          { role: "services" },
          { type: "separator" },
          { role: "hide" },
          { role: "hideOthers" },
          { role: "unhide" },
          { type: "separator" },
          { role: "quit" },
        ],
      },
      {
        label: "Edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
        ],
      },
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "forceReload" },
          { role: "toggleDevTools" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { type: "separator" },
          { role: "togglefullscreen" },
        ],
      },
      {
        label: "Window",
        submenu: [{ role: "minimize" }, { role: "zoom" }, { type: "separator" }, { role: "front" }],
      },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  registerAllIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

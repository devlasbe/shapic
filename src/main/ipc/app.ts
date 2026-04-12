import { app, ipcMain } from 'electron'

export const registerAppHandlers = () => {
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })
}

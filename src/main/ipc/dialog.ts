import { ipcMain, dialog, BrowserWindow } from 'electron'
import { SUPPORTED_EXTENSIONS } from '../../shared/constants.js'

export const registerDialogHandlers = () => {
  ipcMain.handle('dialog:openFile', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return null

    const result = await dialog.showOpenDialog(window, {
      title: '이미지 선택',
      filters: [
        { name: 'Images', extensions: SUPPORTED_EXTENSIONS }
      ],
      properties: ['openFile', 'multiSelections']
    })

    if (result.canceled) return null
    return result.filePaths
  })

  ipcMain.handle('dialog:openFolder', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return null

    const result = await dialog.showOpenDialog(window, {
      title: '출력 폴더 선택',
      properties: ['openDirectory', 'createDirectory']
    })

    if (result.canceled) return null
    return result.filePaths[0]
  })
}

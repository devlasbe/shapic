import { ipcMain, dialog, BrowserWindow } from 'electron'
import { SUPPORTED_EXTENSIONS } from '../../shared/constants.js'
import { AppError, ERROR_CODES } from '../../shared/errors.js'

export const registerDialogHandlers = () => {
  ipcMain.handle('dialog:openFile', async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) return null

      const result = await dialog.showOpenDialog(window, {
        title: '이미지 선택',
        filters: [{ name: 'Images', extensions: SUPPORTED_EXTENSIONS }],
        properties: ['openFile', 'multiSelections']
      })

      if (result.canceled) return null
      return result.filePaths
    } catch (err) {
      if (err instanceof AppError) throw err
      throw new AppError(ERROR_CODES.DIALOG_OPEN_FILE_FAILED)
    }
  })

  ipcMain.handle('dialog:openFolder', async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) return null

      const result = await dialog.showOpenDialog(window, {
        title: '출력 폴더 선택',
        properties: ['openDirectory', 'createDirectory']
      })

      if (result.canceled) return null
      return result.filePaths[0]
    } catch (err) {
      if (err instanceof AppError) throw err
      throw new AppError(ERROR_CODES.DIALOG_OPEN_FOLDER_FAILED)
    }
  })
}

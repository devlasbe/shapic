import { ipcMain } from 'electron'
import {
  getCustomPresets,
  saveCustomPreset,
  updateCustomPreset,
  deleteCustomPreset
} from '../services/preset-store.js'
import { AppError, ERROR_CODES } from '../../shared/errors.js'

export const registerPresetHandlers = () => {
  ipcMain.handle('preset:list', async () => {
    try {
      return getCustomPresets()
    } catch (err) {
      if (err instanceof AppError) throw err
      throw new AppError(ERROR_CODES.PRESET_LIST_FAILED)
    }
  })

  ipcMain.handle('preset:save', async (_event, preset: {
    name: string
    category: string
    width: number
    height: number | null
    format: 'jpeg' | 'webp'
    quality: number
    description: string
  }) => {
    try {
      return saveCustomPreset(preset)
    } catch (err) {
      if (err instanceof AppError) throw err
      throw new AppError(ERROR_CODES.PRESET_SAVE_FAILED)
    }
  })

  ipcMain.handle('preset:update', async (_event, id: string, input: Record<string, unknown>) => {
    try {
      return updateCustomPreset(id, input)
    } catch (err) {
      if (err instanceof AppError) throw err
      throw new AppError(ERROR_CODES.PRESET_SAVE_FAILED)
    }
  })

  ipcMain.handle('preset:delete', async (_event, id: string) => {
    try {
      deleteCustomPreset(id)
    } catch (err) {
      if (err instanceof AppError) throw err
      throw new AppError(ERROR_CODES.PRESET_DELETE_FAILED)
    }
  })
}

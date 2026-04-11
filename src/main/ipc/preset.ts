import { ipcMain } from 'electron'
import {
  getCustomPresets,
  saveCustomPreset,
  updateCustomPreset,
  deleteCustomPreset
} from '../services/preset-store.js'

export const registerPresetHandlers = () => {
  ipcMain.handle('preset:list', async () => {
    return getCustomPresets()
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
    return saveCustomPreset(preset)
  })

  ipcMain.handle('preset:update', async (_event, id: string, input: Record<string, unknown>) => {
    return updateCustomPreset(id, input)
  })

  ipcMain.handle('preset:delete', async (_event, id: string) => {
    deleteCustomPreset(id)
  })
}

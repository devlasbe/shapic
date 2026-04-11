import { ipcMain, BrowserWindow } from 'electron'
import { loadImageMetadata, processBatch, generatePreview } from '../services/image-processor.js'
import { getCustomPresets } from '../services/preset-store.js'
import { BUILT_IN_PRESET_MAP } from '../../shared/presets.js'
import type { PresetLookupType, ResizeModeType, OutputFormatType, FrameStyleType } from '../../shared/types.js'

const findPreset = (presetId: string | null): PresetLookupType | null => {
  if (!presetId) return null
  if (BUILT_IN_PRESET_MAP[presetId]) return BUILT_IN_PRESET_MAP[presetId]
  const custom = getCustomPresets().find((p) => p.id === presetId)
  if (custom) return { id: custom.id, width: custom.width, height: custom.height, format: custom.format as OutputFormatType, quality: custom.quality }
  return null
}

export const registerImageHandlers = () => {
  ipcMain.handle('image:load', async (_event, filePaths: string[]) => {
    const results = await Promise.all(filePaths.map((fp) => loadImageMetadata(fp)))
    return results
  })

  ipcMain.handle('image:process', async (event, options: {
    images: { id: string; path: string; name: string }[]
    outputDir: string
    presetId: string | null
    resizeMode: ResizeModeType
    output: { format: OutputFormatType; quality: number }
    frame: FrameStyleType
    concurrency?: number
  }) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) throw new Error('No window found')

    const preset = findPreset(options.presetId)

    await processBatch(
      {
        images: options.images,
        outputDir: options.outputDir,
        preset,
        resizeMode: options.resizeMode,
        output: options.output,
        frameStyle: options.frame,
        concurrency: options.concurrency
      },
      window.webContents
    )
  })

  ipcMain.handle('image:preview', async (_event, request: {
    imagePath: string
    presetId: string | null
    resizeMode: ResizeModeType
    outputFormat: OutputFormatType
    quality: number
    frameStyle: FrameStyleType
  }) => {
    const preset = findPreset(request.presetId)
    return generatePreview(
      request.imagePath,
      preset,
      request.resizeMode,
      request.outputFormat,
      request.quality,
      request.frameStyle
    )
  })
}

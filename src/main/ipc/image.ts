import { ipcMain, BrowserWindow } from 'electron'
import { ImageProcessor } from '../services/image-processor.js'
import { PresetStore } from '../services/preset-store.js'
import { BUILT_IN_PRESET_MAP } from '../../shared/presets.js'
import type { PresetLookupType, ResizeModeType, OutputFormatType, FrameStyleType } from '../../shared/types.js'
import { AppError, ERROR_CODES } from '../../shared/errors.js'

const findPreset = (presetId: string | null): PresetLookupType | null => {
  if (!presetId) return null
  if (BUILT_IN_PRESET_MAP[presetId]) return BUILT_IN_PRESET_MAP[presetId]
  const custom = PresetStore.getAll().find((p) => p.id === presetId)
  if (custom)
    return {
      id: custom.id,
      width: custom.width,
      height: custom.height,
      format: custom.format as OutputFormatType,
      quality: custom.quality
    }
  return null
}

export const registerImageHandlers = () => {
  ipcMain.handle('image:load', async (_event, filePaths: string[]) => {
    try {
      const results = await Promise.all(filePaths.map((fp) => ImageProcessor.loadMetadata(fp)))
      return results
    } catch (err) {
      if (err instanceof AppError) throw err
      throw new AppError(ERROR_CODES.IMAGE_LOAD_FAILED)
    }
  })

  ipcMain.handle(
    'image:process',
    async (
      event,
      options: {
        images: { id: string; path: string; name: string }[]
        outputDir: string
        presetId: string | null
        resizeMode: ResizeModeType
        output: { format: OutputFormatType; quality: number }
        frame: FrameStyleType
        concurrency?: number
      }
    ) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new AppError(ERROR_CODES.APP_WINDOW_LOOKUP_FAILED)

      const preset = findPreset(options.presetId)

      await ImageProcessor.processBatch(
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
    }
  )

  ipcMain.handle(
    'image:preview',
    async (
      _event,
      request: {
        imagePath: string
        presetId: string | null
        resizeMode: ResizeModeType
        outputFormat: OutputFormatType
        quality: number
        frameStyle: FrameStyleType
      }
    ) => {
      const preset = findPreset(request.presetId)
      return ImageProcessor.generatePreview(
        request.imagePath,
        preset,
        request.resizeMode,
        request.outputFormat,
        request.quality,
        request.frameStyle
      )
    }
  )
}

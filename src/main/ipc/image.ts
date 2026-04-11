import { ipcMain, BrowserWindow } from 'electron'
import { loadImageMetadata, processBatch, generatePreview } from '../services/image-processor.js'
import { getCustomPresets } from '../services/preset-store.js'

type PresetLookupType = {
  id: string
  width: number
  height: number | null
  format: 'jpeg' | 'webp'
  quality: number
}

// 내장 프리셋을 main process에서도 참조 (renderer의 defaults.ts와 동일)
const BUILT_IN_PRESET_MAP: Record<string, PresetLookupType> = {
  'ig-feed-square': { id: 'ig-feed-square', width: 1080, height: 1080, format: 'jpeg', quality: 85 },
  'ig-feed-portrait': { id: 'ig-feed-portrait', width: 1080, height: 1350, format: 'jpeg', quality: 85 },
  'ig-feed-landscape': { id: 'ig-feed-landscape', width: 1080, height: 566, format: 'jpeg', quality: 85 },
  'ig-story': { id: 'ig-story', width: 1080, height: 1920, format: 'jpeg', quality: 85 },
  'ig-profile': { id: 'ig-profile', width: 320, height: 320, format: 'jpeg', quality: 90 },
  'ig-carousel': { id: 'ig-carousel', width: 1080, height: 1350, format: 'jpeg', quality: 85 },
  'fb-post-link': { id: 'fb-post-link', width: 1200, height: 630, format: 'jpeg', quality: 80 },
  'fb-post-photo': { id: 'fb-post-photo', width: 1200, height: 1200, format: 'jpeg', quality: 80 },
  'fb-post-portrait': { id: 'fb-post-portrait', width: 1080, height: 1350, format: 'jpeg', quality: 80 },
  'fb-cover': { id: 'fb-cover', width: 851, height: 315, format: 'jpeg', quality: 85 },
  'fb-event': { id: 'fb-event', width: 1920, height: 1005, format: 'jpeg', quality: 85 },
  'fb-profile': { id: 'fb-profile', width: 400, height: 400, format: 'jpeg', quality: 90 },
  'tw-post': { id: 'tw-post', width: 1600, height: 900, format: 'jpeg', quality: 85 },
  'tw-post-alt': { id: 'tw-post-alt', width: 1200, height: 675, format: 'jpeg', quality: 85 },
  'tw-header': { id: 'tw-header', width: 1500, height: 500, format: 'jpeg', quality: 85 },
  'tw-profile': { id: 'tw-profile', width: 800, height: 800, format: 'jpeg', quality: 90 },
  'yt-thumbnail': { id: 'yt-thumbnail', width: 1280, height: 720, format: 'jpeg', quality: 90 },
  'yt-thumbnail-hd': { id: 'yt-thumbnail-hd', width: 1920, height: 1080, format: 'jpeg', quality: 90 },
  'yt-banner': { id: 'yt-banner', width: 2560, height: 1440, format: 'jpeg', quality: 85 },
  'yt-shorts': { id: 'yt-shorts', width: 1080, height: 1920, format: 'jpeg', quality: 85 },
  'yt-profile': { id: 'yt-profile', width: 800, height: 800, format: 'jpeg', quality: 90 },
  'tt-cover': { id: 'tt-cover', width: 1080, height: 1920, format: 'jpeg', quality: 85 },
  'tt-profile': { id: 'tt-profile', width: 200, height: 200, format: 'jpeg', quality: 90 },
  'li-post-landscape': { id: 'li-post-landscape', width: 1200, height: 627, format: 'jpeg', quality: 80 },
  'li-post-square': { id: 'li-post-square', width: 1080, height: 1080, format: 'jpeg', quality: 80 },
  'li-profile-banner': { id: 'li-profile-banner', width: 1584, height: 396, format: 'jpeg', quality: 85 },
  'li-company-banner': { id: 'li-company-banner', width: 1128, height: 191, format: 'jpeg', quality: 85 },
  'li-profile': { id: 'li-profile', width: 400, height: 400, format: 'jpeg', quality: 90 },
  'web-standard': { id: 'web-standard', width: 1920, height: null, format: 'webp', quality: 80 },
  'web-retina': { id: 'web-retina', width: 3840, height: null, format: 'webp', quality: 75 },
  'print-a4': { id: 'print-a4', width: 3508, height: 2480, format: 'jpeg', quality: 95 },
  'print-card': { id: 'print-card', width: 1050, height: 600, format: 'jpeg', quality: 95 }
}

const findPreset = (presetId: string | null): PresetLookupType | null => {
  if (!presetId) return null
  if (BUILT_IN_PRESET_MAP[presetId]) return BUILT_IN_PRESET_MAP[presetId]
  const custom = getCustomPresets().find((p) => p.id === presetId)
  if (custom) return { id: custom.id, width: custom.width, height: custom.height, format: custom.format as 'jpeg' | 'webp', quality: custom.quality }
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
    resizeMode: { kind: string; [key: string]: unknown }
    output: { format: 'jpeg' | 'webp'; quality: number }
    frame: string
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
        resizeMode: options.resizeMode as any,
        output: options.output,
        frameStyle: options.frame as any,
        concurrency: options.concurrency
      },
      window.webContents
    )
  })

  ipcMain.handle('image:preview', async (_event, request: {
    imagePath: string
    presetId: string | null
    resizeMode: { kind: string; [key: string]: unknown }
    outputFormat: 'jpeg' | 'webp'
    quality: number
    frameStyle: string
  }) => {
    const preset = findPreset(request.presetId)
    return generatePreview(
      request.imagePath,
      preset,
      request.resizeMode as any,
      request.outputFormat,
      request.quality,
      request.frameStyle as any
    )
  })
}

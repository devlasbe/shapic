import { SUPPORTED_EXTENSIONS } from '../../../shared/constants.js'
import type { ImageFileType } from '../types'
import { showErrorToast, parseIpcError } from './toast'
import { ERROR_CODES, ERROR_MESSAGES } from '../../../shared/errors'

export async function processFiles(filePaths: string[]): Promise<ImageFileType[]> {
  if (filePaths.length === 0) return []
  try {
    const loaded = await window.api.image.load(filePaths)
    return loaded.map((info) => ({
      ...info,
      id: crypto.randomUUID(),
      status: 'idle' as const,
      previewDataUrl: null,
      outputSize: null,
      outputPath: null,
      errorMessage: null
    }))
  } catch (err) {
    const message = parseIpcError(err, ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_FAILED])
    showErrorToast(message)
    return []
  }
}

export function filterImageFiles(files: File[]): string[] {
  const extPattern = new RegExp(`\\.(${SUPPORTED_EXTENSIONS.join('|')})$`, 'i')
  return files.filter((f) => extPattern.test(f.name)).map((f) => window.api.file.getPathForFile(f))
}

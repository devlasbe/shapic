import { SUPPORTED_EXTENSIONS } from '../../../shared/constants.js'
import type { ImageFileType } from '../types'

export async function processFiles(filePaths: string[]): Promise<ImageFileType[]> {
  if (filePaths.length === 0) return []
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
}

export function filterImageFiles(files: File[]): string[] {
  const extPattern = new RegExp(`\\.(${SUPPORTED_EXTENSIONS.join('|')})$`, 'i')
  return files
    .filter((f) => extPattern.test(f.name))
    .map((f) => window.api.file.getPathForFile(f))
}

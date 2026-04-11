/// <reference types="vite/client" />

import type {
  LoadedImageType,
  BatchProcessOptionsType,
  ProcessingProgressType,
  BatchResultType,
  PresetType,
  CustomPresetInputType,
  PreviewRequestType,
  PreviewResultType
} from './types'

type ShapicApiType = {
  image: {
    load: (filePaths: string[]) => Promise<LoadedImageType[]>
    process: (options: BatchProcessOptionsType) => Promise<void>
    preview: (request: PreviewRequestType) => Promise<PreviewResultType>
    onProgress: (callback: (progress: ProcessingProgressType) => void) => () => void
    onComplete: (callback: (result: BatchResultType) => void) => () => void
  }
  preset: {
    list: () => Promise<PresetType[]>
    save: (preset: CustomPresetInputType) => Promise<PresetType>
    delete: (id: string) => Promise<void>
  }
  dialog: {
    openFile: () => Promise<string[] | null>
    openFolder: () => Promise<string | null>
  }
}

declare global {
  interface Window {
    api: ShapicApiType
  }
}

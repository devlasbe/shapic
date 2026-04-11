import type { ImageFileType, PresetType } from '../types/index.js'
import { BUILT_IN_PRESETS } from '../presets/defaults.js'

type AppStateSlice = {
  images: ImageFileType[]
  selectedImageId: string | null
  options: { presetId: string | null }
  customPresets: PresetType[]
}

export const selectSelectedImage = (state: AppStateSlice): ImageFileType | null =>
  state.images.find((img) => img.id === state.selectedImageId) ?? null

export const selectImageCount = (state: AppStateSlice): number => state.images.length

export const selectIsAllDone = (state: AppStateSlice): boolean =>
  state.images.length > 0 && state.images.every((img) => img.status === 'done')

export const selectCurrentPreset = (state: AppStateSlice): PresetType | null => {
  if (!state.options.presetId) return null
  return (
    [...BUILT_IN_PRESETS, ...state.customPresets].find((p) => p.id === state.options.presetId) ??
    null
  )
}

export const selectHasImages = (state: AppStateSlice): boolean => state.images.length > 0

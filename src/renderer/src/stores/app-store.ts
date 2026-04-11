import { create } from 'zustand'
import type {
  ImageFileType,
  ImageStatusType,
  ProcessingOptionsType,
  ProgressType,
  PresetType,
  ResizeModeType
} from '../types/index.js'

type AppStateType = {
  images: ImageFileType[]
  selectedImageId: string | null
  options: ProcessingOptionsType
  progress: ProgressType
  customPresets: PresetType[]

  addImages: (files: ImageFileType[]) => void
  removeImage: (id: string) => void
  clearImages: () => void
  selectImage: (id: string | null) => void

  updateImageStatus: (id: string, status: ImageStatusType) => void
  updateImageResult: (id: string, result: { outputSize: number; outputPath: string }) => void
  updateImageError: (id: string, errorMessage: string) => void
  updateImagePreview: (id: string, previewDataUrl: string) => void

  setOption: <K extends keyof ProcessingOptionsType>(key: K, value: ProcessingOptionsType[K]) => void
  setResizeMode: (mode: ResizeModeType) => void

  setProgress: (partial: Partial<ProgressType>) => void
  resetProgress: () => void

  setCustomPresets: (presets: PresetType[]) => void
  addCustomPreset: (preset: PresetType) => void
  deleteCustomPreset: (id: string) => void
}

const initialOptions: ProcessingOptionsType = {
  presetId: null,
  resizeMode: { kind: 'preset-fit', fit: 'cover' },
  outputFormat: 'jpeg',
  quality: 100,
  frameStyle: 'none',
  outputFolder: ''
}

const initialProgress: ProgressType = {
  isProcessing: false,
  currentFileName: '',
  currentIndex: 0,
  totalCount: 0,
  overallPercent: 0
}

export const useAppStore = create<AppStateType>((set) => ({
  images: [],
  selectedImageId: null,
  options: initialOptions,
  progress: initialProgress,
  customPresets: [],

  addImages: (files) =>
    set((state) => ({
      images: [...state.images, ...files],
      selectedImageId: state.selectedImageId ?? files[0]?.id ?? null
    })),

  removeImage: (id) =>
    set((state) => {
      const filtered = state.images.filter((img) => img.id !== id)
      const selectedId =
        state.selectedImageId === id ? (filtered[0]?.id ?? null) : state.selectedImageId
      return { images: filtered, selectedImageId: selectedId }
    }),

  clearImages: () => set({ images: [], selectedImageId: null }),

  selectImage: (id) => set({ selectedImageId: id }),

  updateImageStatus: (id, status) =>
    set((state) => ({
      images: state.images.map((img) => (img.id === id ? { ...img, status } : img))
    })),

  updateImageResult: (id, result) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...result, status: 'done' as const } : img
      )
    })),

  updateImageError: (id, errorMessage) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, errorMessage, status: 'error' as const } : img
      )
    })),

  updateImagePreview: (id, previewDataUrl) =>
    set((state) => ({
      images: state.images.map((img) => (img.id === id ? { ...img, previewDataUrl } : img))
    })),

  setOption: (key, value) =>
    set((state) => ({
      options: { ...state.options, [key]: value }
    })),

  setResizeMode: (mode) =>
    set((state) => ({
      options: { ...state.options, resizeMode: mode }
    })),

  setProgress: (partial) =>
    set((state) => ({
      progress: { ...state.progress, ...partial }
    })),

  resetProgress: () => set({ progress: initialProgress }),

  setCustomPresets: (presets) => set({ customPresets: presets }),

  addCustomPreset: (preset) =>
    set((state) => ({
      customPresets: [...state.customPresets, preset]
    })),

  deleteCustomPreset: (id) =>
    set((state) => ({
      customPresets: state.customPresets.filter((p) => p.id !== id)
    }))
}))

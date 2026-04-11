// --- 공유 타입 re-export ---

export type {
  OutputFormatType,
  FrameStyleType,
  ResizeFitType,
  PresetCategoryType,
  ResizeModeType,
  ExifDataType,
  PresetType,
  PresetLookupType
} from '../../../shared/types.js'

import type {
  ExifDataType,
  ResizeModeType,
  OutputFormatType,
  FrameStyleType,
  PresetType
} from '../../../shared/types.js'

// --- 상태 타입 (renderer 전용) ---

export type ImageStatusType = 'idle' | 'processing' | 'done' | 'error'

// --- 이미지 파일 ---

export type ImageFileType = {
  id: string
  name: string
  path: string
  size: number
  width: number
  height: number
  format: string
  status: ImageStatusType
  previewDataUrl: string | null
  outputSize: number | null
  outputPath: string | null
  errorMessage: string | null
  exifData: ExifDataType | null
}

export type LoadedImageType = {
  path: string
  name: string
  width: number
  height: number
  format: string
  size: number
  exifData: ExifDataType | null
}

// --- 프리셋 ---

export type CustomPresetInputType = Omit<PresetType, 'id' | 'isCustom'>

// --- 처리 옵션 ---

export type ProcessingOptionsType = {
  presetId: string | null
  resizeMode: ResizeModeType
  outputFormat: OutputFormatType
  quality: number
  frameStyle: FrameStyleType
  outputFolder: string
}

// --- 배치 처리 ---

export type BatchProcessOptionsType = {
  images: { id: string; path: string; name: string }[]
  outputDir: string
  presetId: string | null
  resizeMode: ResizeModeType
  output: { format: OutputFormatType; quality: number }
  frame: FrameStyleType
  concurrency?: number
}

export type ProcessingProgressType = {
  totalCount: number
  completedCount: number
  currentFile: string
  currentFileId: string
  status: 'processing' | 'success' | 'error'
  error?: string
}

export type ProcessedResultType = {
  inputPath: string
  outputPath: string
  originalSize: number
  processedSize: number
  width: number
  height: number
}

export type BatchResultType = {
  results: ProcessedResultType[]
  errors: { inputPath: string; error: string }[]
  totalTime: number
}

// --- 미리보기 ---

export type PreviewRequestType = {
  imagePath: string
  presetId: string | null
  resizeMode: ResizeModeType
  outputFormat: OutputFormatType
  quality: number
  frameStyle: FrameStyleType
}

export type PreviewResultType = {
  dataUrl: string
  width: number
  height: number
  estimatedSize: number
}

// --- 진행률 (UI 스토어용) ---

export type ProgressType = {
  isProcessing: boolean
  currentFileName: string
  currentIndex: number
  totalCount: number
  overallPercent: number
}

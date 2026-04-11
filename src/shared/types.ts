// --- main/renderer 공유 타입 ---

export type OutputFormatType = 'jpeg' | 'webp'

export type FrameStyleType = 'none' | 'minimal-white'

export type ResizeFitType = 'cover' | 'contain' | 'fill' | 'inside' | 'outside'

export type PresetCategoryType =
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'youtube'
  | 'tiktok'
  | 'linkedin'
  | 'general'

export type ResizeModeType =
  | { kind: 'preset-fit'; fit: ResizeFitType }
  | { kind: 'aspect-ratio' }
  | { kind: 'long-side'; pixels: number }
  | { kind: 'short-side'; pixels: number }
  | { kind: 'width'; pixels: number }
  | { kind: 'height'; pixels: number }

export type ExifDataType = {
  cameraBrand: string | null
  cameraModel: string | null
  lens: string | null
  aperture: string | null
  shutterSpeed: string | null
  iso: number | null
  focalLength: string | null
  dateTime: string | null
}

export type PresetType = {
  id: string
  name: string
  category: PresetCategoryType
  width: number | null
  height: number | null
  format: OutputFormatType
  quality: number
  description: string
  isCustom: boolean
}

export type PresetLookupType = {
  id: string
  width: number | null
  height: number | null
  format: OutputFormatType
  quality: number
}

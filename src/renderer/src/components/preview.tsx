import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../stores/app-store'
import { selectSelectedImage } from '../stores/selectors'
import { formatFileSize, formatCompressionRatio } from '../utils/format'
import DropZone from './drop-zone'

const Preview = () => {
  const selectedImage = useAppStore(selectSelectedImage)
  const options = useAppStore((s) => s.options)
  const updateImagePreview = useAppStore((s) => s.updateImagePreview)
  const [previewData, setPreviewData] = useState<{
    dataUrl: string
    width: number
    height: number
    estimatedSize: number
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const loadPreview = useCallback(async () => {
    if (!selectedImage || !options.presetId) return

    setLoading(true)
    try {
      const result = await window.api.image.preview({
        imagePath: selectedImage.path,
        presetId: options.presetId,
        resizeMode: options.resizeMode,
        outputFormat: options.outputFormat,
        quality: options.quality,
        frameStyle: options.frameStyle
      })
      if (result) {
        setPreviewData(result)
        updateImagePreview(selectedImage.id, result.dataUrl)
      }
    } catch {
      // 미리보기 실패 시 무시
    } finally {
      setLoading(false)
    }
  }, [selectedImage?.id, selectedImage?.path, options.presetId, options.resizeMode, options.outputFormat, options.quality, options.frameStyle, updateImagePreview])

  useEffect(() => {
    setPreviewData(null)
    if (!selectedImage || !options.presetId) return

    const timer = setTimeout(loadPreview, 300)
    return () => clearTimeout(timer)
  }, [selectedImage?.id, options.presetId, JSON.stringify(options.resizeMode), options.outputFormat, options.quality, options.frameStyle])

  if (!selectedImage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="max-w-[280px]">
          <DropZone />
        </div>
        <p className="text-xs text-text-muted">
          이미지를 드래그하거나 파일을 선택하세요
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 미리보기 영역 */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
        <img
          src={
            previewData?.dataUrl ??
            selectedImage.previewDataUrl ??
            `file://${selectedImage.path}`
          }
          alt={selectedImage.name}
          className="max-w-full max-h-full object-contain rounded-md shadow-lg shadow-black/10"
          draggable={false}
        />
      </div>

      {/* 정보 바 */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-border-light bg-card">
        <div className="flex items-center gap-6 text-[11px]">
          {/* 원본 정보 */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">원본</span>
            <span className="font-medium text-text-primary">
              {selectedImage.width}x{selectedImage.height}
            </span>
            <span className="text-text-muted">·</span>
            <span className="font-medium text-text-primary">
              {formatFileSize(selectedImage.size)}
            </span>
          </div>

          {/* 변환 후 정보 */}
          {previewData && (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-text-muted">
                <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex items-center gap-1.5">
                <span className="text-text-muted">변환</span>
                <span className="font-medium text-primary">
                  {previewData.width}x{previewData.height}
                </span>
                <span className="text-text-muted">·</span>
                <span className="font-medium text-primary">
                  {formatFileSize(previewData.estimatedSize)}
                </span>
                <span className="text-success text-[10px] font-medium ml-1">
                  {formatCompressionRatio(selectedImage.size, previewData.estimatedSize)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Preview

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../stores/app-store'
import { selectSelectedImage } from '../stores/selectors'
import { Format } from '../utils/format'
import { Toast } from '../utils/toast'
import { ERROR_CODES, ERROR_MESSAGES } from '../../../shared/errors'
import DropZone from './drop-zone'

const PREVIEW_DEBOUNCE_MS = 300

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
  const [imageError, setImageError] = useState<string | null>(null)

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
        setImageError(null)
        updateImagePreview(selectedImage.id, result.dataUrl)
      }
    } catch (err) {
      const message = Toast.parseIpcError(err, ERROR_MESSAGES[ERROR_CODES.IMAGE_PREVIEW_FAILED])
      setImageError(message)
    } finally {
      setLoading(false)
    }
  }, [selectedImage?.id, selectedImage?.path, options.presetId, options.resizeMode, options.outputFormat, options.quality, options.frameStyle, updateImagePreview])

  const handleRetry = useCallback(() => {
    setImageError(null)
    loadPreview()
  }, [loadPreview])

  useEffect(() => {
    setPreviewData(null)
    setImageError(null)
    if (!selectedImage || !options.presetId) return

    const timer = setTimeout(loadPreview, PREVIEW_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [loadPreview, selectedImage?.id, options.presetId])

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
        {imageError ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-border-light bg-card max-w-[280px]">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-error-light">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-error">
                <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 14L6.5 10L9 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11 11L14 8L18 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 4L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-text-primary">
                이미지를 표시할 수 없습니다
              </p>
              <p className="text-[10px] text-text-muted mt-1 truncate max-w-[240px]">
                {selectedImage.name}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-primary-light rounded-md transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 6C1.5 3.51 3.51 1.5 6 1.5C8.49 1.5 10.5 3.51 10.5 6C10.5 8.49 8.49 10.5 6 10.5C4.51 10.5 3.21 9.72 2.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1.5 3.5V6H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              다시 시도
            </button>
          </div>
        ) : (
          <img
            src={
              previewData?.dataUrl ??
              selectedImage.previewDataUrl ??
              `local-file:///${selectedImage.path.replace(/\\/g, '/').replace(/^\//, '')}`
            }
            alt={selectedImage.name}
            className="max-w-full max-h-full object-contain rounded-md shadow-lg shadow-black/10"
            draggable={false}
            onError={() => setImageError('이미지를 불러올 수 없습니다')}
          />
        )}
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
              {Format.fileSize(selectedImage.size)}
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
                  {Format.fileSize(previewData.estimatedSize)}
                </span>
                <span className="text-success text-[10px] font-medium ml-1">
                  {Format.compressionRatio(selectedImage.size, previewData.estimatedSize)}
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

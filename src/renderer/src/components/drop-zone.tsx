import { useState, useCallback } from 'react'
import { useAppStore } from '../stores/app-store'
import { cn } from '../utils/cn'
import type { ImageFileType } from '../types'

const DropZone = () => {
  const [isDragOver, setIsDragOver] = useState(false)
  const addImages = useAppStore((s) => s.addImages)

  const processFiles = useCallback(
    async (filePaths: string[]) => {
      if (filePaths.length === 0) return
      const loaded = await window.api.image.load(filePaths)
      const imageFiles: ImageFileType[] = loaded.map((info) => ({
        ...info,
        id: crypto.randomUUID(),
        status: 'idle',
        previewDataUrl: null,
        outputSize: null,
        outputPath: null,
        errorMessage: null
      }))
      addImages(imageFiles)
    },
    [addImages]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const imageFiles = files.filter((f) =>
        /\.(jpe?g|png|webp|heif|heic|tiff?)$/i.test(f.name)
      )
      const paths = imageFiles.map((f) => (f as File & { path: string }).path)
      await processFiles(paths)
    },
    [processFiles]
  )

  const handleClickAdd = useCallback(async () => {
    const paths = await window.api.dialog.openFile()
    if (paths) await processFiles(paths)
  }, [processFiles])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClickAdd}
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
        isDragOver
          ? 'border-primary bg-primary-light scale-[1.02]'
          : 'border-border-light hover:border-primary/30 hover:bg-card-hover'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
          isDragOver ? 'bg-primary text-white' : 'bg-background text-text-muted'
        )}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 3V13M10 3L6 7M10 3L14 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 13V15C3 16.1046 3.89543 17 5 17H15C16.1046 17 17 16.1046 17 15V13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-text-primary">
          {isDragOver ? '여기에 놓기' : '이미지 추가'}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">
          드래그 & 드롭 또는 클릭
        </p>
      </div>
    </div>
  )
}

export default DropZone

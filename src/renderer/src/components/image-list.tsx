import { useCallback } from 'react'
import { useAppStore } from '../stores/app-store'
import { cn } from '../utils/cn'
import { Format } from '../utils/format'
import { ProcessFile } from '../utils/process-files'
import { Toast } from '../utils/toast'
import { ERROR_CODES, ERROR_MESSAGES } from '../../../shared/errors'
import DropZone from './drop-zone'
import type { ImageFileType } from '../types'

const StatusIcon = ({ status }: { status: ImageFileType['status'] }) => {
  switch (status) {
    case 'idle':
      return <div className="w-1.5 h-1.5 rounded-full bg-border" />
    case 'processing':
      return <div className="w-3 h-3 rounded-full border-[1.5px] border-primary border-t-transparent animate-spin" />
    case 'done':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-success">
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'error':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-error">
          <path d="M3 3L9 9M3 9L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
  }
}

const ImageListItem = ({
  image,
  isSelected,
  onClick
}: {
  image: ImageFileType
  isSelected: boolean
  onClick: () => void
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-100 cursor-pointer',
        isSelected
          ? 'bg-primary-light border-l-2 border-l-primary'
          : 'hover:bg-card-hover border-l-2 border-l-transparent'
      )}
    >
      <StatusIcon status={image.status} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate text-text-primary">{image.name}</p>
        <p className="text-[10px] text-text-muted">
          {image.width}x{image.height} · {Format.fileSize(image.size)}
        </p>
      </div>
    </button>
  )
}

const ImageList = () => {
  const images = useAppStore((s) => s.images)
  const selectedImageId = useAppStore((s) => s.selectedImageId)
  const selectImage = useAppStore((s) => s.selectImage)
  const clearImages = useAppStore((s) => s.clearImages)

  const handleClickAdd = useCallback(async () => {
    try {
      const paths = await window.api.dialog.openFile()
      if (!paths) return
      const imageFiles = await ProcessFile.load(paths)
      if (imageFiles.length > 0) useAppStore.getState().addImages(imageFiles)
    } catch (err) {
      const message = Toast.parseIpcError(err, ERROR_MESSAGES[ERROR_CODES.DIALOG_OPEN_FILE_FAILED])
      Toast.error(message)
    }
  }, [])

  if (images.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center px-3">
        <DropZone />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-light">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {images.length}개 이미지
        </span>
        <button
          onClick={clearImages}
          className="text-[10px] text-text-muted hover:text-error transition-colors cursor-pointer"
        >
          전체 삭제
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {images.map((image) => (
          <ImageListItem
            key={image.id}
            image={image}
            isSelected={image.id === selectedImageId}
            onClick={() => selectImage(image.id)}
          />
        ))}
      </div>

      <div className="p-2 border-t border-border-light">
        <button
          onClick={handleClickAdd}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-primary-light rounded-md transition-colors cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          추가
        </button>
      </div>
    </div>
  )
}

export default ImageList

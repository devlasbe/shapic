import { useState, useCallback, useRef } from 'react'
import { useAppStore } from '../stores/app-store'
import { ProcessFile } from '../utils/process-files'
import { Toast } from '../utils/toast'
import { ERROR_CODES, ERROR_MESSAGES } from '../../../shared/errors'

export function useFileDrop() {
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounterRef = useRef(0)
  const addImages = useAppStore((s) => s.addImages)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current += 1
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current -= 1
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current = 0
      setIsDragOver(false)

      try {
        const files = Array.from(e.dataTransfer.files)
        const paths = ProcessFile.filter(files)
        const imageFiles = await ProcessFile.load(paths)
        if (imageFiles.length > 0) {
          addImages(imageFiles)
        }
      } catch (err) {
        const message = Toast.parseIpcError(err, ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_FAILED])
        Toast.error(message)
      }
    },
    [addImages]
  )

  return {
    isDragOver,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop
    }
  }
}

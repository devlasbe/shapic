import { useState, useCallback, useRef } from 'react'
import { useAppStore } from '../stores/app-store'
import { processFiles, filterImageFiles } from '../utils/process-files'

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

      const files = Array.from(e.dataTransfer.files)
      const paths = filterImageFiles(files)
      const imageFiles = await processFiles(paths)
      if (imageFiles.length > 0) {
        addImages(imageFiles)
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

import { useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '../stores/app-store.js'
import type { ProcessingProgressType, BatchResultType } from '../types/index.js'

export type ProcessingModeType = 'single' | 'batch' | null

export const useProcessing = () => {
  const images = useAppStore((s) => s.images)
  const selectedImageId = useAppStore((s) => s.selectedImageId)
  const options = useAppStore((s) => s.options)
  const setProgress = useAppStore((s) => s.setProgress)
  const resetProgress = useAppStore((s) => s.resetProgress)
  const updateImageStatus = useAppStore((s) => s.updateImageStatus)
  const updateImageResult = useAppStore((s) => s.updateImageResult)
  const updateImageError = useAppStore((s) => s.updateImageError)
  const processingModeRef = useRef<ProcessingModeType>(null)

  useEffect(() => {
    const unsubProgress = window.api.image.onProgress((raw) => {
      const progress = raw as ProcessingProgressType
      const percent =
        progress.totalCount > 0
          ? Math.round((progress.completedCount / progress.totalCount) * 100)
          : 0

      setProgress({
        isProcessing: true,
        currentFileName: progress.currentFile,
        currentIndex: progress.completedCount,
        totalCount: progress.totalCount,
        overallPercent: percent
      })

      if (progress.status === 'processing') {
        updateImageStatus(progress.currentFileId, 'processing')
      }
    })

    const unsubComplete = window.api.image.onComplete((raw) => {
      const result = raw as BatchResultType

      result.results.forEach((r) => {
        const img = images.find((i) => i.path === r.inputPath)
        if (img) {
          updateImageResult(img.id, {
            outputSize: r.processedSize,
            outputPath: r.outputPath
          })
        }
      })

      result.errors.forEach((e) => {
        const img = images.find((i) => i.path === e.inputPath)
        if (img) {
          updateImageError(img.id, e.error)
        }
      })

      setProgress({ isProcessing: false, overallPercent: 100 })
      processingModeRef.current = null
    })

    return () => {
      unsubProgress()
      unsubComplete()
    }
  }, [images, setProgress, resetProgress, updateImageStatus, updateImageResult, updateImageError])

  const processImages = useCallback(
    async (imagesToProcess: typeof images) => {
      if (imagesToProcess.length === 0 || !options.outputFolder) return

      setProgress({
        isProcessing: true,
        currentIndex: 0,
        totalCount: imagesToProcess.length,
        overallPercent: 0,
        currentFileName: imagesToProcess[0].name
      })

      imagesToProcess.forEach((img) => updateImageStatus(img.id, 'processing'))

      await window.api.image.process({
        images: imagesToProcess.map((img) => ({ id: img.id, path: img.path, name: img.name })),
        outputDir: options.outputFolder,
        presetId: options.presetId,
        resizeMode: options.resizeMode,
        output: { format: options.outputFormat, quality: options.quality },
        frame: options.frameStyle
      })
    },
    [options, setProgress, updateImageStatus]
  )

  const startSingleProcessing = useCallback(async () => {
    const image = images.find((img) => img.id === selectedImageId)
    if (!image) return

    if (image.status === 'done') {
      updateImageStatus(image.id, 'idle')
    }

    processingModeRef.current = 'single'
    await processImages([image])
  }, [images, selectedImageId, processImages, updateImageStatus])

  const startBatchProcessing = useCallback(async () => {
    const imagesToProcess = images.filter((img) => img.status !== 'done')
    if (imagesToProcess.length === 0) return

    processingModeRef.current = 'batch'
    await processImages(imagesToProcess)
  }, [images, processImages])

  return { startSingleProcessing, startBatchProcessing, processingModeRef }
}

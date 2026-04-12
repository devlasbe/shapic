import { useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '../stores/app-store.js'
import { showErrorToast, parseIpcError } from '../utils/toast.js'
import { ERROR_CODES, ERROR_MESSAGES } from '../../../shared/errors.js'
import type { ProcessingProgressType, BatchResultType } from '../types/index.js'

export type ProcessingModeType = 'single' | 'batch' | null

export const useProcessing = () => {
  const images = useAppStore((s) => s.images)
  const selectedImageId = useAppStore((s) => s.selectedImageId)
  const options = useAppStore((s) => s.options)
  const setProgress = useAppStore((s) => s.setProgress)
  const updateImageStatus = useAppStore((s) => s.updateImageStatus)
  const updateImageResult = useAppStore((s) => s.updateImageResult)
  const updateImageError = useAppStore((s) => s.updateImageError)
  const processingModeRef = useRef<ProcessingModeType>(null)
  const imagesRef = useRef(images)

  // images가 변경될 때 ref만 업데이트 (리스너 재등록 없음)
  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    const unsubProgress = window.api.image.onProgress((raw) => {
      const progress = raw as ProcessingProgressType
      const percent = progress.totalCount > 0 ? Math.round((progress.completedCount / progress.totalCount) * 100) : 0

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
        const img = imagesRef.current.find((i) => i.path === r.inputPath)
        if (img) {
          updateImageResult(img.id, {
            outputSize: r.processedSize,
            outputPath: r.outputPath
          })
        }
      })

      result.errors.forEach((e) => {
        const img = imagesRef.current.find((i) => i.path === e.inputPath)
        if (img) {
          updateImageError(img.id, e.error)
        }
      })

      // 에러 메시지별 그룹핑 후 토스트
      if (result.errors.length > 0) {
        const errorGroups = new Map<string, number>()
        for (const e of result.errors) {
          const baseMessage = e.error.includes(': ') ? e.error.split(': ')[0] : e.error
          errorGroups.set(baseMessage, (errorGroups.get(baseMessage) ?? 0) + 1)
        }
        for (const [message, count] of errorGroups) {
          if (count > 1) {
            showErrorToast(`${message} (${count}장)`)
          } else {
            const original = result.errors.find((e) => {
              const base = e.error.includes(': ') ? e.error.split(': ')[0] : e.error
              return base === message
            })!
            showErrorToast(original.error)
          }
        }
      }

      setProgress({ isProcessing: false, overallPercent: 100 })
      processingModeRef.current = null
    })

    return () => {
      unsubProgress()
      unsubComplete()
    }
  }, [setProgress, updateImageStatus, updateImageResult, updateImageError])

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

      try {
        await window.api.image.process({
          images: imagesToProcess.map((img) => ({ id: img.id, path: img.path, name: img.name })),
          outputDir: options.outputFolder,
          presetId: options.presetId,
          resizeMode: options.resizeMode,
          output: { format: options.outputFormat, quality: options.quality },
          frame: options.frameStyle
        })
      } catch (err) {
        const message = parseIpcError(err, ERROR_MESSAGES[ERROR_CODES.IMAGE_PROCESS_FAILED])
        showErrorToast(message)
        setProgress({ isProcessing: false, overallPercent: 0 })
        imagesToProcess.forEach((img) => updateImageStatus(img.id, 'error'))
      }
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

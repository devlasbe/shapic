import sharp from 'sharp'
import path from 'node:path'
import fs from 'node:fs/promises'
import os from 'node:os'
import type { BrowserWindow } from 'electron'
import type { ResizeModeType, OutputFormatType, FrameStyleType, PresetLookupType } from '../../shared/types.js'
import { readExif } from './exif-reader.js'
import { applyFrame, hasExifForFrame } from './frame-renderer.js'

type ProcessImageOptionsType = {
  inputPath: string
  outputDir: string
  preset: PresetLookupType | null
  resizeMode: ResizeModeType
  output: { format: OutputFormatType; quality: number }
  frameStyle: FrameStyleType
}

type BatchProcessOptionsType = {
  images: { id: string; path: string; name: string }[]
  outputDir: string
  preset: PresetLookupType | null
  resizeMode: ResizeModeType
  output: { format: OutputFormatType; quality: number }
  frameStyle: FrameStyleType
  concurrency?: number
}

type ProcessedResultType = {
  inputPath: string
  outputPath: string
  originalSize: number
  processedSize: number
  width: number
  height: number
}

type BatchResultType = {
  results: ProcessedResultType[]
  errors: { inputPath: string; error: string }[]
  totalTime: number
}

type ProcessingProgressType = {
  totalCount: number
  completedCount: number
  currentFile: string
  currentFileId: string
  status: 'processing' | 'success' | 'error'
  error?: string
}

const resolveResizeOptions = (
  mode: ResizeModeType,
  preset: PresetLookupType | null,
  originalWidth: number,
  originalHeight: number
): { width: number | null; height: number | null; options: sharp.ResizeOptions } => {
  switch (mode.kind) {
    case 'preset-fit': {
      if (!preset) throw new Error('Preset is required for preset-fit mode')
      if (preset.width === null && preset.height === null) {
        return {
          width: null,
          height: null,
          options: {}
        }
      }
      return {
        width: preset.width,
        height: preset.height,
        options: {
          fit: mode.fit,
          position: 'centre',
          withoutEnlargement: false
        }
      }
    }
    case 'aspect-ratio': {
      const targetWidth = preset?.width ?? 1920
      return {
        width: targetWidth,
        height: null,
        options: {
          fit: 'inside',
          withoutEnlargement: true
        }
      }
    }
    case 'long-side': {
      const isLandscape = originalWidth >= originalHeight
      return {
        width: isLandscape ? mode.pixels : null,
        height: isLandscape ? null : mode.pixels,
        options: {
          fit: 'inside',
          withoutEnlargement: true
        }
      }
    }
    case 'short-side': {
      const isLandscape = originalWidth >= originalHeight
      return {
        width: isLandscape ? null : mode.pixels,
        height: isLandscape ? mode.pixels : null,
        options: {
          fit: 'outside',
          withoutEnlargement: true
        }
      }
    }
    case 'width': {
      return {
        width: mode.pixels,
        height: null,
        options: { fit: 'inside', withoutEnlargement: true }
      }
    }
    case 'height': {
      return {
        width: null,
        height: mode.pixels,
        options: { fit: 'inside', withoutEnlargement: true }
      }
    }
  }
}

const processImage = async (options: ProcessImageOptionsType): Promise<ProcessedResultType> => {
  const { inputPath, outputDir, preset, resizeMode, output, frameStyle } = options

  const metadata = await sharp(inputPath).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error(`이미지 메타데이터를 읽을 수 없습니다: ${path.basename(inputPath)}`)
  }
  const originalWidth = metadata.width
  const originalHeight = metadata.height
  const originalStat = await fs.stat(inputPath)

  const { width, height, options: resizeOpts } = resolveResizeOptions(
    resizeMode,
    preset,
    originalWidth,
    originalHeight
  )

  let pipeline = sharp(inputPath, { sequentialRead: true })
  pipeline = pipeline.rotate()
  pipeline = pipeline.resize(width, height, resizeOpts)

  const outputExt = output.format === 'jpeg' ? '.jpg' : '.webp'
  const baseName = path.basename(inputPath, path.extname(inputPath))
  const outputPath = path.join(outputDir, `${baseName}_shapic${outputExt}`)

  const needsFrame = frameStyle !== 'none'
  let exifData = null

  if (needsFrame) {
    exifData = await readExif(inputPath)
  }

  if (needsFrame && exifData && hasExifForFrame(exifData)) {
    const resizedBuffer = await pipeline.toBuffer()
    const framedBuffer = await applyFrame(resizedBuffer, exifData)

    let outputPipeline = sharp(framedBuffer)
    if (output.format === 'jpeg') {
      outputPipeline = outputPipeline.jpeg({ quality: output.quality, mozjpeg: true })
    } else {
      outputPipeline = outputPipeline.webp({ quality: output.quality, effort: 4, smartSubsample: true })
    }
    const info = await outputPipeline.toFile(outputPath)
    const processedStat = await fs.stat(outputPath)

    return {
      inputPath,
      outputPath,
      originalSize: originalStat.size,
      processedSize: processedStat.size,
      width: info.width,
      height: info.height
    }
  } else {
    if (output.format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: output.quality, mozjpeg: true })
    } else {
      pipeline = pipeline.webp({ quality: output.quality, effort: 4, smartSubsample: true })
    }
    const info = await pipeline.toFile(outputPath)
    const processedStat = await fs.stat(outputPath)

    return {
      inputPath,
      outputPath,
      originalSize: originalStat.size,
      processedSize: processedStat.size,
      width: info.width,
      height: info.height
    }
  }
}

export const processBatch = async (
  options: BatchProcessOptionsType,
  sender: BrowserWindow['webContents']
): Promise<BatchResultType> => {
  const startTime = Date.now()
  const concurrency = options.concurrency ?? Math.min(4, os.cpus().length)
  const results: ProcessedResultType[] = []
  const errors: { inputPath: string; error: string }[] = []
  let completedCount = 0

  const semaphore = new Array(concurrency).fill(Promise.resolve())
  let semaphoreIndex = 0

  const tasks = options.images.map((image) => {
    const taskFn = async () => {
      sender.send('image:progress', {
        totalCount: options.images.length,
        completedCount,
        currentFile: image.name,
        currentFileId: image.id,
        status: 'processing'
      } satisfies ProcessingProgressType)

      try {
        const result = await processImage({
          inputPath: image.path,
          outputDir: options.outputDir,
          preset: options.preset,
          resizeMode: options.resizeMode,
          output: options.output,
          frameStyle: options.frameStyle
        })

        results.push(result)
        completedCount++

        sender.send('image:progress', {
          totalCount: options.images.length,
          completedCount,
          currentFile: image.name,
          currentFileId: image.id,
          status: 'success'
        } satisfies ProcessingProgressType)
      } catch (err) {
        completedCount++
        const errorMsg = err instanceof Error ? err.message : String(err)
        errors.push({ inputPath: image.path, error: errorMsg })

        sender.send('image:progress', {
          totalCount: options.images.length,
          completedCount,
          currentFile: image.name,
          currentFileId: image.id,
          status: 'error',
          error: errorMsg
        } satisfies ProcessingProgressType)
      }
    }

    const idx = semaphoreIndex % concurrency
    semaphoreIndex++
    semaphore[idx] = semaphore[idx].then(taskFn)
    return semaphore[idx]
  })

  await Promise.all(tasks)

  const batchResult: BatchResultType = {
    results,
    errors,
    totalTime: Date.now() - startTime
  }

  sender.send('image:complete', batchResult)
  return batchResult
}

export const generatePreview = async (
  imagePath: string,
  preset: PresetLookupType | null,
  resizeMode: ResizeModeType,
  outputFormat: OutputFormatType,
  quality: number,
  frameStyle: FrameStyleType
): Promise<{ dataUrl: string; width: number; height: number; estimatedSize: number }> => {
  const metadata = await sharp(imagePath).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error(`이미지 메타데이터를 읽을 수 없습니다: ${path.basename(imagePath)}`)
  }
  const originalWidth = metadata.width
  const originalHeight = metadata.height

  const { width, height, options: resizeOpts } = resolveResizeOptions(
    resizeMode,
    preset,
    originalWidth,
    originalHeight
  )

  let pipeline = sharp(imagePath, { sequentialRead: true })
  pipeline = pipeline.rotate()
  pipeline = pipeline.resize(width, height, resizeOpts)

  const needsFrame = frameStyle !== 'none'
  let exifData = null
  if (needsFrame) {
    exifData = await readExif(imagePath)
  }

  let resultBuffer: Buffer
  if (needsFrame && exifData && hasExifForFrame(exifData)) {
    const resizedBuffer = await pipeline.toBuffer()
    resultBuffer = await applyFrame(resizedBuffer, exifData)
  } else {
    resultBuffer = await pipeline.toBuffer()
  }

  let outputPipeline = sharp(resultBuffer)
  if (outputFormat === 'jpeg') {
    outputPipeline = outputPipeline.jpeg({ quality, mozjpeg: true })
  } else {
    outputPipeline = outputPipeline.webp({ quality, effort: 4 })
  }

  const outputBuffer = await outputPipeline.toBuffer()
  const outputMeta = await sharp(outputBuffer).metadata()

  const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : 'image/webp'
  const dataUrl = `data:${mimeType};base64,${outputBuffer.toString('base64')}`

  return {
    dataUrl,
    width: outputMeta.width!,
    height: outputMeta.height!,
    estimatedSize: outputBuffer.length
  }
}

export const loadImageMetadata = async (filePath: string) => {
  const metadata = await sharp(filePath).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error(`이미지 메타데이터를 읽을 수 없습니다: ${path.basename(filePath)}`)
  }
  const stat = await fs.stat(filePath)
  const exifData = await readExif(filePath)

  return {
    path: filePath,
    name: path.basename(filePath),
    width: metadata.width,
    height: metadata.height,
    format: metadata.format ?? 'unknown',
    size: stat.size,
    exifData
  }
}

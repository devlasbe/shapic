import sharp from 'sharp'
import path from 'node:path'
import fs from 'node:fs/promises'
import os from 'node:os'
import type { BrowserWindow } from 'electron'
import type { ResizeModeType, OutputFormatType, FrameStyleType, PresetLookupType } from '../../shared/types.js'
import { readExif } from './exif-reader.js'
import { applyFrame, hasExifForFrame, calcFrameLayout, calcFrameDimensions } from './frame-renderer.js'

type ProcessImageOptionsType = {
  inputPath: string
  outputDir: string
  preset: PresetLookupType | null
  resizeMode: ResizeModeType
  output: { format: OutputFormatType; quality: number }
  frameStyle: FrameStyleType
  outputPath?: string
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
          withoutEnlargement: false,
          ...(mode.fit === 'contain' && {
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
        }
      }
    }
    case 'aspect-ratio': {
      // Use the preset's larger dimension as long-side target; scale proportionally.
      if (!preset || (preset.width === null && preset.height === null)) {
        return { width: null, height: null, options: {} }
      }
      const maxSide = Math.max(preset.width ?? 0, preset.height ?? 0)
      if (maxSide <= 0) {
        return { width: null, height: null, options: {} }
      }
      const isLandscape = originalWidth >= originalHeight
      return {
        width: isLandscape ? maxSide : null,
        height: isLandscape ? null : maxSide,
        options: { fit: 'inside', withoutEnlargement: false }
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

const constrainFrameByHeight = (
  targetHeight: number,
  originalWidth: number,
  originalHeight: number
): { innerHeight: number; frameBorderWidth: number } => {
  // First pass: estimate image width from target height
  const estImageWidth = Math.round(targetHeight * (originalWidth / originalHeight))
  const estBorderWidth = Math.max(8, Math.round(estImageWidth * 0.015))
  const { frameHeight: estFrameHeight } = calcFrameDimensions(Math.max(1, estImageWidth - 2 * estBorderWidth))
  const estInnerHeight = targetHeight - 2 * estBorderWidth - estFrameHeight

  if (estInnerHeight < 1) {
    return { innerHeight: targetHeight, frameBorderWidth: 0 }
  }

  // Correction pass: recalculate from the corrected image width
  const correctedWidth = Math.round(estInnerHeight * (originalWidth / originalHeight))
  const borderWidth = Math.max(8, Math.round(correctedWidth * 0.015))
  const { frameHeight } = calcFrameDimensions(correctedWidth)
  const innerHeight = targetHeight - 2 * borderWidth - frameHeight

  if (innerHeight < 1) {
    return { innerHeight: targetHeight, frameBorderWidth: 0 }
  }

  return { innerHeight, frameBorderWidth: borderWidth }
}

const adjustForFrame = (
  width: number | null,
  height: number | null,
  resizeOpts: sharp.ResizeOptions,
  originalWidth: number,
  originalHeight: number,
  willApplyFrame: boolean
): {
  width: number | null
  height: number | null
  resizeOpts: sharp.ResizeOptions
  frameBorderWidth: number | undefined
} => {
  if (!willApplyFrame || (width == null && height == null)) {
    return { width, height, resizeOpts, frameBorderWidth: undefined }
  }

  // Both dimensions specified (preset-fit mode)
  if (width != null && height != null) {
    const layout = calcFrameLayout(width, height)
    if (layout.innerWidth < 1 || layout.innerHeight < 1) {
      return { width, height, resizeOpts, frameBorderWidth: undefined }
    }
    return {
      width: layout.innerWidth,
      height: layout.innerHeight,
      resizeOpts,
      frameBorderWidth: layout.borderWidth
    }
  }

  // Width specified, height auto: subtract horizontal frame space only
  if (width != null) {
    const borderWidth = Math.max(8, Math.round(width * 0.015))
    const innerWidth = width - 2 * borderWidth
    if (innerWidth < 1) return { width, height, resizeOpts, frameBorderWidth: undefined }
    return { width: innerWidth, height: null, resizeOpts, frameBorderWidth: borderWidth }
  }

  // Height specified, width auto: two-pass estimation for frame overhead
  const { innerHeight, frameBorderWidth } = constrainFrameByHeight(height!, originalWidth, originalHeight)
  if (frameBorderWidth === 0) return { width, height, resizeOpts, frameBorderWidth: undefined }
  return { width: null, height: innerHeight, resizeOpts, frameBorderWidth }
}

const buildOutputPathMap = async (
  images: { id: string; path: string; name: string }[],
  outputDir: string,
  outputFormat: OutputFormatType
): Promise<Map<string, string>> => {
  const outputExt = outputFormat === 'jpeg' ? '.jpg' : '.webp'

  let existingFiles: Set<string>
  try {
    const entries = await fs.readdir(outputDir)
    existingFiles = new Set(entries.map((e) => e.toLowerCase()))
  } catch {
    existingFiles = new Set()
  }

  const nameCounters = new Map<string, number>()
  const pathMap = new Map<string, string>()

  for (const image of images) {
    const baseName = path.basename(image.path, path.extname(image.path))
    const canonical = `${baseName}_shapic`
    const canonicalLower = canonical.toLowerCase()
    const extLower = outputExt.toLowerCase()

    let counter = nameCounters.get(canonicalLower) ?? 0

    let outputFileName: string
    if (counter === 0) {
      const candidate = `${canonical}${outputExt}`
      if (!existingFiles.has(candidate.toLowerCase())) {
        outputFileName = candidate
        nameCounters.set(canonicalLower, 1)
      } else {
        let n = 1
        while (existingFiles.has(`${canonicalLower} (${n})${extLower}`)) {
          n++
        }
        outputFileName = `${canonical} (${n})${outputExt}`
        nameCounters.set(canonicalLower, n + 1)
      }
    } else {
      while (existingFiles.has(`${canonicalLower} (${counter})${extLower}`)) {
        counter++
      }
      outputFileName = `${canonical} (${counter})${outputExt}`
      nameCounters.set(canonicalLower, counter + 1)
    }

    existingFiles.add(outputFileName.toLowerCase())
    pathMap.set(image.path, path.join(outputDir, outputFileName))
  }

  return pathMap
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

  let { width, height, options: resizeOpts } = resolveResizeOptions(
    resizeMode,
    preset,
    originalWidth,
    originalHeight
  )

  const needsFrame = frameStyle !== 'none'
  let exifData = null
  if (needsFrame) {
    exifData = await readExif(inputPath)
  }
  const willApplyFrame = needsFrame && exifData != null && hasExifForFrame(exifData)

  // For aspect-ratio mode: if constraining by width would make the final height
  // exceed maxSide (due to frame vertical overhead), switch to height constraint
  if (willApplyFrame && resizeMode.kind === 'aspect-ratio' && width != null && height == null) {
    const bw = Math.max(8, Math.round(width * 0.015))
    const iw = width - 2 * bw
    const estImageHeight = Math.round(iw * (originalHeight / originalWidth))
    const { frameHeight } = calcFrameDimensions(iw)
    if (estImageHeight + 2 * bw + frameHeight > width) {
      height = width
      width = null
    }
  }

  let frameBorderWidth: number | undefined
  ;({ width, height, resizeOpts, frameBorderWidth } = adjustForFrame(
    width, height, resizeOpts, originalWidth, originalHeight, willApplyFrame
  ))

  let pipeline = sharp(inputPath, { sequentialRead: true })
  pipeline = pipeline.rotate()
  pipeline = pipeline.resize(width, height, resizeOpts)

  const outputPath =
    options.outputPath ??
    path.join(
      outputDir,
      `${path.basename(inputPath, path.extname(inputPath))}_shapic${output.format === 'jpeg' ? '.jpg' : '.webp'}`
    )

  if (willApplyFrame) {
    const resizedBuffer = await pipeline.toBuffer()
    const framedBuffer = await applyFrame(resizedBuffer, exifData!, frameBorderWidth)

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

  const outputPathMap = await buildOutputPathMap(
    options.images,
    options.outputDir,
    options.output.format
  )

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
          frameStyle: options.frameStyle,
          outputPath: outputPathMap.get(image.path)
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

  let { width, height, options: resizeOpts } = resolveResizeOptions(
    resizeMode,
    preset,
    originalWidth,
    originalHeight
  )

  const needsFrame = frameStyle !== 'none'
  let exifData = null
  if (needsFrame) {
    exifData = await readExif(imagePath)
  }
  const willApplyFrame = needsFrame && exifData != null && hasExifForFrame(exifData)

  if (willApplyFrame && resizeMode.kind === 'aspect-ratio' && width != null && height == null) {
    const bw = Math.max(8, Math.round(width * 0.015))
    const iw = width - 2 * bw
    const estImageHeight = Math.round(iw * (originalHeight / originalWidth))
    const { frameHeight } = calcFrameDimensions(iw)
    if (estImageHeight + 2 * bw + frameHeight > width) {
      height = width
      width = null
    }
  }

  let frameBorderWidth: number | undefined
  ;({ width, height, resizeOpts, frameBorderWidth } = adjustForFrame(
    width, height, resizeOpts, originalWidth, originalHeight, willApplyFrame
  ))

  let pipeline = sharp(imagePath, { sequentialRead: true })
  pipeline = pipeline.rotate()
  pipeline = pipeline.resize(width, height, resizeOpts)

  let resultBuffer: Buffer
  if (willApplyFrame) {
    const resizedBuffer = await pipeline.toBuffer()
    resultBuffer = await applyFrame(resizedBuffer, exifData!, frameBorderWidth)
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

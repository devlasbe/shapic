import sharp from 'sharp'
import type { ExifDataType } from './exif-reader.js'

type FrameStyleType = 'simple-bar' | 'card' | 'minimal-white'

type FrameContextType = {
  imageWidth: number
  exif: ExifDataType
}

const escapeXml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const buildInfoParts = (exif: ExifDataType) => {
  const cameraInfo = [exif.cameraBrand, exif.cameraModel].filter(Boolean).join(' ')
  const lensInfo = exif.lens ?? ''
  const settingsParts = [exif.aperture, exif.shutterSpeed, exif.iso ? `ISO ${exif.iso}` : null, exif.focalLength]
    .filter(Boolean)
    .join('  |  ')
  return { cameraInfo, lensInfo, settingsParts }
}

const generateSimpleBarSvg = (ctx: FrameContextType): { svg: string; frameHeight: number } => {
  const frameHeight = 72
  const { imageWidth, exif } = ctx
  const fontSize = Math.max(11, Math.min(15, imageWidth / 70))
  const { cameraInfo, lensInfo, settingsParts } = buildInfoParts(exif)

  const leftText = [cameraInfo, lensInfo].filter(Boolean).join('  ·  ')
  const rightText = settingsParts

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${frameHeight}">
  <rect width="100%" height="100%" fill="#1a1a1a"/>
  <text x="24" y="${frameHeight / 2 + fontSize / 3}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="500" fill="#ffffff">${escapeXml(leftText)}</text>
  <text x="${imageWidth - 24}" y="${frameHeight / 2 + fontSize / 3}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize - 1}" font-weight="300" fill="#cccccc" text-anchor="end">${escapeXml(rightText)}</text>
</svg>`

  return { svg, frameHeight }
}

const generateCardSvg = (ctx: FrameContextType): { svg: string; frameHeight: number } => {
  const frameHeight = 110
  const { imageWidth, exif } = ctx
  const fontSize = Math.max(11, Math.min(14, imageWidth / 80))
  const { cameraInfo, lensInfo, settingsParts } = buildInfoParts(exif)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${frameHeight}">
  <rect width="100%" height="100%" fill="#1a1a1a"/>
  <rect x="0" y="0" width="3" height="${frameHeight}" fill="#4361ee"/>
  <text x="24" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize + 1}" font-weight="600" fill="#ffffff">${escapeXml(cameraInfo)}</text>
  <text x="24" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="300" fill="#aaaaaa">${escapeXml(lensInfo)}</text>
  <line x1="24" y1="68" x2="${imageWidth - 24}" y2="68" stroke="#333333" stroke-width="1"/>
  <text x="24" y="92" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="400" fill="#cccccc">${escapeXml(settingsParts)}</text>
</svg>`

  return { svg, frameHeight }
}

const generateMinimalWhiteSvg = (ctx: FrameContextType): { svg: string; frameHeight: number } => {
  const frameHeight = 56
  const { imageWidth, exif } = ctx
  const fontSize = Math.max(10, Math.min(13, imageWidth / 85))
  const { cameraInfo, settingsParts } = buildInfoParts(exif)

  const centerText = [cameraInfo, settingsParts].filter(Boolean).join('    ')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${frameHeight}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="${imageWidth / 2}" y="${frameHeight / 2 + fontSize / 3}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="300" fill="#666666" text-anchor="middle">${escapeXml(centerText)}</text>
</svg>`

  return { svg, frameHeight }
}

const generateFrameSvg = (
  style: FrameStyleType,
  ctx: FrameContextType
): { svg: string; frameHeight: number } => {
  switch (style) {
    case 'simple-bar':
      return generateSimpleBarSvg(ctx)
    case 'card':
      return generateCardSvg(ctx)
    case 'minimal-white':
      return generateMinimalWhiteSvg(ctx)
  }
}

export const applyFrame = async (
  resizedImageBuffer: Buffer,
  exif: ExifDataType,
  style: FrameStyleType
): Promise<Buffer> => {
  const meta = await sharp(resizedImageBuffer).metadata()
  const imageWidth = meta.width!
  const imageHeight = meta.height!

  const { svg, frameHeight } = generateFrameSvg(style, { imageWidth, exif })

  const framePng = await sharp(Buffer.from(svg)).resize(imageWidth, frameHeight).png().toBuffer()

  const bgColor =
    style === 'minimal-white'
      ? { r: 255, g: 255, b: 255, alpha: 1 }
      : { r: 26, g: 26, b: 26, alpha: 1 }

  const borderWidth = style === 'minimal-white' ? Math.max(8, Math.round(imageWidth * 0.015)) : 0

  let pipeline = sharp(resizedImageBuffer)

  if (borderWidth > 0) {
    pipeline = pipeline.extend({
      top: borderWidth,
      bottom: frameHeight + borderWidth,
      left: borderWidth,
      right: borderWidth,
      background: bgColor
    })
  } else {
    pipeline = pipeline.extend({
      top: 0,
      bottom: frameHeight,
      left: 0,
      right: 0,
      background: bgColor
    })
  }

  const compositeTop = borderWidth > 0 ? imageHeight + borderWidth : imageHeight
  const compositeLeft = borderWidth

  const result = await pipeline
    .composite([
      {
        input: framePng,
        top: compositeTop,
        left: compositeLeft,
        blend: 'over'
      }
    ])
    .toBuffer()

  return result
}

export const hasExifForFrame = (exif: ExifDataType | null): boolean => {
  if (!exif) return false
  return !!(exif.cameraBrand || exif.cameraModel || exif.lens || exif.aperture || exif.shutterSpeed || exif.iso || exif.focalLength)
}

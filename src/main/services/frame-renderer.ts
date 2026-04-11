import sharp from 'sharp'
import type { ExifDataType } from '../../shared/types.js'

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

export const applyFrame = async (
  resizedImageBuffer: Buffer,
  exif: ExifDataType
): Promise<Buffer> => {
  const meta = await sharp(resizedImageBuffer).metadata()
  if (!meta.width || !meta.height) {
    throw new Error('프레임 적용을 위한 이미지 크기를 읽을 수 없습니다')
  }
  const imageWidth = meta.width
  const imageHeight = meta.height

  const { svg, frameHeight } = generateMinimalWhiteSvg({ imageWidth, exif })

  const framePng = await sharp(Buffer.from(svg)).resize(imageWidth, frameHeight).png().toBuffer()

  const bgColor = { r: 255, g: 255, b: 255, alpha: 1 }
  const borderWidth = Math.max(8, Math.round(imageWidth * 0.015))

  const extended = await sharp(resizedImageBuffer)
    .extend({
      top: borderWidth,
      bottom: frameHeight + borderWidth,
      left: borderWidth,
      right: borderWidth,
      background: bgColor
    })
    .composite([
      {
        input: framePng,
        top: imageHeight + borderWidth,
        left: borderWidth,
        blend: 'over'
      }
    ])
    .toBuffer()

  return extended
}

export const hasExifForFrame = (exif: ExifDataType | null): boolean => {
  if (!exif) return false
  return !!(exif.cameraBrand || exif.cameraModel || exif.lens || exif.aperture || exif.shutterSpeed || exif.iso || exif.focalLength)
}

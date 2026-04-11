import sharp from 'sharp'
import exifReader from 'exif-reader'

export type ExifDataType = {
  cameraBrand: string | null
  cameraModel: string | null
  lens: string | null
  aperture: string | null
  shutterSpeed: string | null
  iso: number | null
  focalLength: string | null
  dateTime: string | null
}

const formatShutterSpeed = (exposureTime: number | undefined): string | null => {
  if (!exposureTime) return null
  if (exposureTime >= 1) return `${exposureTime}s`
  const denominator = Math.round(1 / exposureTime)
  return `1/${denominator}`
}

export const readExif = async (imagePath: string): Promise<ExifDataType | null> => {
  try {
    const metadata = await sharp(imagePath).metadata()
    const exifBuffer = metadata.exif

    if (!exifBuffer) return null

    const parsed = exifReader(exifBuffer) as unknown as Record<string, Record<string, unknown>>

    const image = parsed?.Image ?? parsed?.image ?? {}
    const photo = parsed?.Photo ?? parsed?.exif ?? {}

    const fNumber = photo.FNumber as number | undefined
    const apertureValue = photo.ApertureValue as number | undefined
    const exposureTime = photo.ExposureTime as number | undefined
    const isoValue = (photo.ISOSpeedRatings ?? photo.PhotographicSensitivity) as number | undefined
    const focalLengthValue = photo.FocalLength as number | undefined
    const lensModel = photo.LensModel as string | undefined
    const dateTimeOriginal = photo.DateTimeOriginal as Date | string | undefined
    const dateTime = image.DateTime as string | undefined

    let apertureStr: string | null = null
    if (fNumber) {
      apertureStr = `f/${fNumber}`
    } else if (apertureValue) {
      apertureStr = `f/${Math.round(Math.pow(2, apertureValue / 2) * 10) / 10}`
    }

    let dateTimeStr: string | null = null
    if (dateTimeOriginal) {
      dateTimeStr =
        dateTimeOriginal instanceof Date
          ? dateTimeOriginal.toISOString()
          : String(dateTimeOriginal)
    } else if (dateTime) {
      dateTimeStr = String(dateTime)
    }

    return {
      cameraBrand: (image.Make as string) ?? null,
      cameraModel: (image.Model as string) ?? null,
      lens: lensModel ?? null,
      aperture: apertureStr,
      shutterSpeed: formatShutterSpeed(exposureTime),
      iso: isoValue ?? null,
      focalLength: focalLengthValue ? `${focalLengthValue}mm` : null,
      dateTime: dateTimeStr
    }
  } catch {
    return null
  }
}

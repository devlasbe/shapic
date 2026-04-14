const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return `${value.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

const formatDimensions = (width: number, height: number): string => {
  return `${width} x ${height}`
}

const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`
}

const formatCompressionRatio = (original: number, processed: number): string => {
  if (original === 0) return '0%'
  const ratio = ((original - processed) / original) * 100
  return `${ratio > 0 ? '-' : '+'}${Math.abs(ratio).toFixed(1)}%`
}

export const Format = {
  fileSize: formatFileSize,
  dimensions: formatDimensions,
  percent: formatPercent,
  compressionRatio: formatCompressionRatio,
} as const

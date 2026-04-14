import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import sharp from 'sharp'
import path from 'node:path'
import fs from 'node:fs/promises'
import os from 'node:os'
import { resolveResizeOptions, ImageProcessor } from './image-processor.js'
import type { ResizeModeType, PresetLookupType, OutputFormatType, FrameStyleType } from '../../shared/types.js'

const makePreset = (
  width: number | null,
  height: number | null
): PresetLookupType => ({
  id: 'test',
  width,
  height,
  format: 'jpeg',
  quality: 90
})

describe('resolveResizeOptions — aspect-ratio 모드', () => {
  const mode: ResizeModeType = { kind: 'aspect-ratio' }

  describe('프리셋 큰 변 기준 할당 (핵심 버그 검증)', () => {
    it('세로 프리셋 + 가로 이미지 → height에 할당', () => {
      const result = resolveResizeOptions(mode, makePreset(1080, 1350), 4000, 3000)
      expect(result.width).toBeNull()
      expect(result.height).toBe(1350)
    })

    it('세로 프리셋 + 세로 이미지 → height에 할당', () => {
      const result = resolveResizeOptions(mode, makePreset(1080, 1350), 3000, 4000)
      expect(result.width).toBeNull()
      expect(result.height).toBe(1350)
    })

    it('가로 프리셋 + 가로 이미지 → width에 할당', () => {
      const result = resolveResizeOptions(mode, makePreset(1200, 630), 4000, 3000)
      expect(result.width).toBe(1200)
      expect(result.height).toBeNull()
    })

    it('가로 프리셋 + 세로 이미지 → width에 할당', () => {
      const result = resolveResizeOptions(mode, makePreset(1200, 630), 3000, 4000)
      expect(result.width).toBe(1200)
      expect(result.height).toBeNull()
    })

    it('정사각형 프리셋 + 가로 이미지 → width에 할당', () => {
      const result = resolveResizeOptions(mode, makePreset(1080, 1080), 4000, 3000)
      expect(result.width).toBe(1080)
      expect(result.height).toBeNull()
    })

    it('정사각형 프리셋 + 세로 이미지 → width에 할당', () => {
      const result = resolveResizeOptions(mode, makePreset(1080, 1080), 3000, 4000)
      expect(result.width).toBe(1080)
      expect(result.height).toBeNull()
    })
  })

  describe('options 검증', () => {
    it('fit: inside, withoutEnlargement: false', () => {
      const result = resolveResizeOptions(mode, makePreset(1080, 1350), 4000, 3000)
      expect(result.options).toEqual({ fit: 'inside', withoutEnlargement: false })
    })
  })

  describe('엣지 케이스', () => {
    it('preset이 null → 빈 결과 반환', () => {
      const result = resolveResizeOptions(mode, null, 4000, 3000)
      expect(result).toEqual({ width: null, height: null, options: {} })
    })

    it('width/height 모두 null → 빈 결과 반환', () => {
      const result = resolveResizeOptions(mode, makePreset(null, null), 4000, 3000)
      expect(result).toEqual({ width: null, height: null, options: {} })
    })

    it('width만 null (height=1350) → height에 할당', () => {
      const result = resolveResizeOptions(mode, makePreset(null, 1350), 4000, 3000)
      expect(result.width).toBeNull()
      expect(result.height).toBe(1350)
    })

    it('height만 null (width=1080) → width에 할당', () => {
      const result = resolveResizeOptions(mode, makePreset(1080, null), 4000, 3000)
      expect(result.width).toBe(1080)
      expect(result.height).toBeNull()
    })

    it('width=0, height=0 → 빈 결과 반환', () => {
      const result = resolveResizeOptions(mode, makePreset(0, 0), 4000, 3000)
      expect(result).toEqual({ width: null, height: null, options: {} })
    })

    it('극단적 세로 프리셋 (Story 1080x1920) → height에 할당', () => {
      const result = resolveResizeOptions(mode, makePreset(1080, 1920), 4000, 3000)
      expect(result.width).toBeNull()
      expect(result.height).toBe(1920)
    })

    it('극단적 가로 프리셋 (Banner 1584x396) → width에 할당', () => {
      const result = resolveResizeOptions(mode, makePreset(1584, 396), 3000, 4000)
      expect(result.width).toBe(1584)
      expect(result.height).toBeNull()
    })
  })
})

describe('resolveResizeOptions — 다른 모드 회귀 방지', () => {
  it('long-side: 가로 이미지 → width에 할당', () => {
    const result = resolveResizeOptions({ kind: 'long-side', pixels: 2000 }, null, 4000, 3000)
    expect(result.width).toBe(2000)
    expect(result.height).toBeNull()
  })

  it('long-side: 세로 이미지 → height에 할당', () => {
    const result = resolveResizeOptions({ kind: 'long-side', pixels: 2000 }, null, 3000, 4000)
    expect(result.width).toBeNull()
    expect(result.height).toBe(2000)
  })

  it('short-side: 가로 이미지 → height에 할당', () => {
    const result = resolveResizeOptions({ kind: 'short-side', pixels: 1000 }, null, 4000, 3000)
    expect(result.width).toBeNull()
    expect(result.height).toBe(1000)
  })

  it('short-side: 세로 이미지 → width에 할당', () => {
    const result = resolveResizeOptions({ kind: 'short-side', pixels: 1000 }, null, 3000, 4000)
    expect(result.width).toBe(1000)
    expect(result.height).toBeNull()
  })

  it('width 모드 → width에 할당', () => {
    const result = resolveResizeOptions({ kind: 'width', pixels: 1500 }, null, 4000, 3000)
    expect(result.width).toBe(1500)
    expect(result.height).toBeNull()
  })

  it('height 모드 → height에 할당', () => {
    const result = resolveResizeOptions({ kind: 'height', pixels: 1500 }, null, 4000, 3000)
    expect(result.width).toBeNull()
    expect(result.height).toBe(1500)
  })
})

// --- generatePreview null preset 패스스루 테스트 ---

const PREVIEW_MAX_PX = 1920

describe('generatePreview — null preset 패스스루', () => {
  let tmpDir: string
  let largeImagePath: string
  let smallImagePath: string

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shapic-test-'))

    // 큰 이미지 (4000x3000)
    largeImagePath = path.join(tmpDir, 'large.jpg')
    await sharp({ create: { width: 4000, height: 3000, channels: 3, background: { r: 128, g: 128, b: 128 } } })
      .jpeg()
      .toFile(largeImagePath)

    // 작은 이미지 (800x600)
    smallImagePath = path.join(tmpDir, 'small.jpg')
    await sharp({ create: { width: 800, height: 600, channels: 3, background: { r: 200, g: 200, b: 200 } } })
      .jpeg()
      .toFile(smallImagePath)
  })

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('null preset + preset-fit 모드 → 에러 없이 결과 반환', async () => {
    const result = await ImageProcessor.generatePreview(
      largeImagePath, null,
      { kind: 'preset-fit', fit: 'cover' },
      'jpeg', 80, 'none'
    )
    expect(result).toHaveProperty('dataUrl')
    expect(result).toHaveProperty('width')
    expect(result).toHaveProperty('height')
    expect(result).toHaveProperty('estimatedSize')
    expect(result.dataUrl).toMatch(/^data:image\/jpeg;base64,/)
  })

  it('null preset + aspect-ratio 모드 → 에러 없이 결과 반환', async () => {
    const result = await ImageProcessor.generatePreview(
      largeImagePath, null,
      { kind: 'aspect-ratio' },
      'webp', 80, 'none'
    )
    expect(result.dataUrl).toMatch(/^data:image\/webp;base64,/)
    expect(result.width).toBeGreaterThan(0)
    expect(result.height).toBeGreaterThan(0)
  })

  it('null preset + 큰 이미지 → 긴 변이 1920px 이내', async () => {
    const result = await ImageProcessor.generatePreview(
      largeImagePath, null,
      { kind: 'preset-fit', fit: 'cover' },
      'jpeg', 80, 'none'
    )
    const maxSide = Math.max(result.width, result.height)
    expect(maxSide).toBeLessThanOrEqual(PREVIEW_MAX_PX)
  })

  it('null preset + 작은 이미지 → 원본 크기 유지 (확대 안 함)', async () => {
    const result = await ImageProcessor.generatePreview(
      smallImagePath, null,
      { kind: 'preset-fit', fit: 'cover' },
      'jpeg', 80, 'none'
    )
    expect(result.width).toBe(800)
    expect(result.height).toBe(600)
  })

  it('null preset + frameStyle minimal-white → 프레임 적용 안 됨', async () => {
    const withFrame = await ImageProcessor.generatePreview(
      largeImagePath, null,
      { kind: 'preset-fit', fit: 'cover' },
      'jpeg', 80, 'minimal-white'
    )
    const withoutFrame = await ImageProcessor.generatePreview(
      largeImagePath, null,
      { kind: 'preset-fit', fit: 'cover' },
      'jpeg', 80, 'none'
    )
    // 프레임이 적용되지 않으므로 크기가 동일해야 함
    expect(withFrame.width).toBe(withoutFrame.width)
    expect(withFrame.height).toBe(withoutFrame.height)
  })
})

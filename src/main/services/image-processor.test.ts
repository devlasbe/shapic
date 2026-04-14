import { describe, it, expect } from 'vitest'
import { resolveResizeOptions } from './image-processor.js'
import type { ResizeModeType, PresetLookupType } from '../../shared/types.js'

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

import { describe, it, expect } from 'vitest'
import { pathToFileURL } from 'node:url'

/**
 * local-file:// 프로토콜의 URL 생성(렌더러) + pathname 추출(메인) 로직 테스트.
 * Windows 경로에서 드라이브 문자(C:)가 URL authority로 잘못 파싱되는 버그를 방지.
 */

// 렌더러 측 URL 생성 로직 (preview.tsx:120)
const buildLocalFileUrl = (filePath: string): string =>
  `local-file:///${filePath.replace(/\\/g, '/').replace(/^\//, '')}`

// 메인 측 pathname 추출 로직 (index.ts:48)
const extractFilePath = (requestUrl: string): string =>
  decodeURIComponent(new URL(requestUrl).pathname)

describe('local-file:// URL 생성 (렌더러)', () => {
  it('macOS 절대 경로', () => {
    expect(buildLocalFileUrl('/Users/lasbe/image.jpg')).toBe(
      'local-file:///Users/lasbe/image.jpg'
    )
  })

  it('Windows 절대 경로', () => {
    expect(buildLocalFileUrl('C:\\Users\\lasbe\\image.jpg')).toBe(
      'local-file:///C:/Users/lasbe/image.jpg'
    )
  })

  it('Windows 경로 - 슬래시 혼합', () => {
    expect(buildLocalFileUrl('D:/Photos/test.png')).toBe(
      'local-file:///D:/Photos/test.png'
    )
  })

  it('한글 포함 경로', () => {
    expect(buildLocalFileUrl('C:\\Users\\사용자\\이미지.jpg')).toBe(
      'local-file:///C:/Users/사용자/이미지.jpg'
    )
  })

  it('공백 포함 경로', () => {
    expect(buildLocalFileUrl('C:\\Users\\My Folder\\image.jpg')).toBe(
      'local-file:///C:/Users/My Folder/image.jpg'
    )
  })
})

describe('local-file:// pathname 추출 (메인)', () => {
  it('macOS URL에서 경로 추출', () => {
    const path = extractFilePath('local-file:///Users/lasbe/image.jpg')
    expect(path).toBe('/Users/lasbe/image.jpg')
  })

  it('Windows URL에서 경로 추출', () => {
    const path = extractFilePath('local-file:///C:/Users/lasbe/image.jpg')
    expect(path).toBe('/C:/Users/lasbe/image.jpg')
  })

  it('한글 포함 URL에서 경로 추출', () => {
    const url = 'local-file:///C:/Users/%EC%82%AC%EC%9A%A9%EC%9E%90/%EC%9D%B4%EB%AF%B8%EC%A7%80.jpg'
    const path = extractFilePath(url)
    expect(path).toBe('/C:/Users/사용자/이미지.jpg')
  })

  it('공백 포함 URL에서 경로 추출', () => {
    const url = 'local-file:///C:/Users/My%20Folder/image.jpg'
    const path = extractFilePath(url)
    expect(path).toBe('/C:/Users/My Folder/image.jpg')
  })
})

describe('전체 파이프라인: URL 생성 → 추출 → pathToFileURL', () => {
  it('macOS 경로 왕복 변환', () => {
    const original = '/Users/lasbe/image.jpg'
    const url = buildLocalFileUrl(original)
    const extracted = extractFilePath(url)
    const fileUrl = pathToFileURL(extracted).href
    expect(fileUrl).toBe('file:///Users/lasbe/image.jpg')
  })

  it('Windows 경로 왕복 변환', () => {
    const original = 'C:\\Users\\lasbe\\image.jpg'
    const url = buildLocalFileUrl(original)
    const extracted = extractFilePath(url)
    // pathToFileURL은 /C:/ 형태를 올바르게 처리해야 함
    const fileUrl = pathToFileURL(extracted).href
    // macOS에서 실행해도 file:///C:/... 또는 file:///C%3A/... 형태
    expect(fileUrl).toMatch(/^file:\/\/\//)
    // 파일명이 보존되는지 확인
    expect(decodeURIComponent(fileUrl)).toContain('image.jpg')
  })
})

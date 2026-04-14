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
  it('macOS 경로 왕복 변환 → 정확한 file:// URL', () => {
    const original = '/Users/lasbe/image.jpg'
    const url = buildLocalFileUrl(original)
    const extracted = extractFilePath(url)
    const fileUrl = pathToFileURL(extracted).href
    expect(fileUrl).toBe('file:///Users/lasbe/image.jpg')
  })

  it('Windows 경로 왕복 변환 → file:/// 접두사 + 파일명 보존', () => {
    const original = 'C:\\Users\\lasbe\\image.jpg'
    const url = buildLocalFileUrl(original)
    const extracted = extractFilePath(url)
    const fileUrl = pathToFileURL(extracted).href

    expect(fileUrl).toMatch(/^file:\/\/\//)
    // 콜론은 OS에 따라 보존(C:) 또는 인코딩(%3A) 가능
    expect(decodeURIComponent(fileUrl)).toContain('image.jpg')
    expect(decodeURIComponent(fileUrl)).toContain('Users')
    expect(decodeURIComponent(fileUrl)).toContain('lasbe')
  })

  it('한글 Windows 경로 왕복 변환 → 파일명 보존', () => {
    const original = 'C:\\Users\\사용자\\내사진\\이미지.jpg'
    const url = buildLocalFileUrl(original)
    const extracted = extractFilePath(url)
    const fileUrl = pathToFileURL(extracted).href

    expect(fileUrl).toMatch(/^file:\/\/\//)
    expect(decodeURIComponent(fileUrl)).toContain('이미지.jpg')
    expect(decodeURIComponent(fileUrl)).toContain('사용자')
  })

  it('공백 포함 Windows 경로 왕복 변환 → %20 인코딩', () => {
    const original = 'C:\\Users\\My Folder\\my image.jpg'
    const url = buildLocalFileUrl(original)
    const extracted = extractFilePath(url)
    const fileUrl = pathToFileURL(extracted).href

    expect(fileUrl).toMatch(/^file:\/\/\//)
    // 공백은 반드시 %20으로 인코딩
    expect(fileUrl).toContain('%20')
    expect(decodeURIComponent(fileUrl)).toContain('my image.jpg')
  })

  it('macOS 한글 경로 왕복 변환', () => {
    const original = '/Users/사용자/사진/테스트.png'
    const url = buildLocalFileUrl(original)
    const extracted = extractFilePath(url)
    const fileUrl = pathToFileURL(extracted).href

    expect(fileUrl).toMatch(/^file:\/\/\//)
    expect(decodeURIComponent(fileUrl)).toContain('테스트.png')
    expect(decodeURIComponent(fileUrl)).toContain('사용자')
  })
})

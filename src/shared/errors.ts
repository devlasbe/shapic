// --- 에러 코드 상수 ---

export const ERROR_CODES = {
  // IMAGE 도메인
  IMAGE_METADATA_READ_FAILED: 'IMAGE_METADATA_READ_FAILED',
  IMAGE_PRESET_RESOLVE_FAILED: 'IMAGE_PRESET_RESOLVE_FAILED',
  IMAGE_LOAD_FAILED: 'IMAGE_LOAD_FAILED',
  IMAGE_PROCESS_FAILED: 'IMAGE_PROCESS_FAILED',
  IMAGE_PREVIEW_FAILED: 'IMAGE_PREVIEW_FAILED',
  IMAGE_RESIZE_FAILED: 'IMAGE_RESIZE_FAILED',
  IMAGE_ENCODE_FAILED: 'IMAGE_ENCODE_FAILED',
  IMAGE_SAVE_FAILED: 'IMAGE_SAVE_FAILED',

  // FRAME 도메인
  FRAME_SIZE_READ_FAILED: 'FRAME_SIZE_READ_FAILED',
  FRAME_RENDER_FAILED: 'FRAME_RENDER_FAILED',

  // EXIF 도메인
  EXIF_PARSE_FAILED: 'EXIF_PARSE_FAILED',

  // PRESET 도메인
  PRESET_LOOKUP_FAILED: 'PRESET_LOOKUP_FAILED',
  PRESET_LIST_FAILED: 'PRESET_LIST_FAILED',
  PRESET_SAVE_FAILED: 'PRESET_SAVE_FAILED',
  PRESET_DELETE_FAILED: 'PRESET_DELETE_FAILED',

  // DIALOG 도메인
  DIALOG_OPEN_FILE_FAILED: 'DIALOG_OPEN_FILE_FAILED',
  DIALOG_OPEN_FOLDER_FAILED: 'DIALOG_OPEN_FOLDER_FAILED',

  // APP 도메인
  APP_WINDOW_LOOKUP_FAILED: 'APP_WINDOW_LOOKUP_FAILED',
  APP_VERSION_FAILED: 'APP_VERSION_FAILED',
  APP_UNKNOWN_ERROR: 'APP_UNKNOWN_ERROR'
} as const

export type ErrorCodeType = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

// --- 에러 메시지 매핑 (모두 한글) ---

export const ERROR_MESSAGES: Record<ErrorCodeType, string> = {
  IMAGE_METADATA_READ_FAILED: '이미지 메타데이터를 읽을 수 없습니다',
  IMAGE_PRESET_RESOLVE_FAILED: '프리셋 맞춤 모드에는 프리셋이 필요합니다',
  IMAGE_LOAD_FAILED: '이미지를 불러올 수 없습니다',
  IMAGE_PROCESS_FAILED: '이미지 처리에 실패했습니다',
  IMAGE_PREVIEW_FAILED: '미리보기 생성에 실패했습니다',
  IMAGE_RESIZE_FAILED: '이미지 리사이즈에 실패했습니다',
  IMAGE_ENCODE_FAILED: '이미지 인코딩에 실패했습니다',
  IMAGE_SAVE_FAILED: '이미지 저장에 실패했습니다',

  FRAME_SIZE_READ_FAILED: '프레임 적용을 위한 이미지 크기를 읽을 수 없습니다',
  FRAME_RENDER_FAILED: '프레임 렌더링에 실패했습니다',

  EXIF_PARSE_FAILED: 'EXIF 데이터를 읽을 수 없습니다',

  PRESET_LOOKUP_FAILED: '프리셋을 찾을 수 없습니다',
  PRESET_LIST_FAILED: '프리셋 목록을 불러올 수 없습니다',
  PRESET_SAVE_FAILED: '프리셋 저장에 실패했습니다',
  PRESET_DELETE_FAILED: '프리셋 삭제에 실패했습니다',

  DIALOG_OPEN_FILE_FAILED: '파일 선택 대화상자를 열 수 없습니다',
  DIALOG_OPEN_FOLDER_FAILED: '폴더 선택 대화상자를 열 수 없습니다',

  APP_WINDOW_LOOKUP_FAILED: '앱 창을 찾을 수 없습니다',
  APP_VERSION_FAILED: '앱 버전 정보를 가져올 수 없습니다',
  APP_UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다'
}

// --- 에러 메시지 포매터 ---

export const formatErrorMessage = (code: ErrorCodeType, context?: string): string => {
  const base = ERROR_MESSAGES[code]
  return context ? `${base}: ${context}` : base
}

// --- AppError 커스텀 에러 클래스 ---

export class AppError extends Error {
  readonly code: ErrorCodeType
  readonly context?: string

  constructor(code: ErrorCodeType, context?: string) {
    const message = formatErrorMessage(code, context)
    super(message)
    this.name = 'AppError'
    this.code = code
    this.context = context
  }
}


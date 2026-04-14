import { toast } from 'react-toastify'

/**
 * Electron IPC 에러 메시지에서 원본 메시지를 추출한다.
 * ipcMain.handle에서 throw하면 Electron이 다음 형태로 감싼다:
 * "Error invoking remote method '{채널}': AppError: 원본 메시지"
 * AppError가 아닌 경우(라이브러리 영어 에러) fallback을 반환한다.
 */
const parseIpcError = (err: unknown, fallback: string): string => {
  if (!(err instanceof Error)) return fallback
  const match = err.message.match(/AppError:\s*(.+)$/)
  return match ? match[1] : fallback
}

const showErrorToast = (message: string) => {
  toast.error(message, {
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false
  })
}

const showSuccessToast = (message: string) => {
  toast.success(message, {
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false
  })
}

export const Toast = {
  parseIpcError,
  error: showErrorToast,
  success: showSuccessToast,
} as const

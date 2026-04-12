import { useCallback } from 'react'
import { useAppStore } from '../stores/app-store'
import { processFiles } from '../utils/process-files'
import { showErrorToast, parseIpcError } from '../utils/toast'
import { ERROR_CODES, ERROR_MESSAGES } from '../../../shared/errors'

const DropZone = () => {
  const addImages = useAppStore((s) => s.addImages)

  const handleClickAdd = useCallback(async () => {
    try {
      const paths = await window.api.dialog.openFile()
      if (!paths) return
      const imageFiles = await processFiles(paths)
      if (imageFiles.length > 0) addImages(imageFiles)
    } catch (err) {
      const message = parseIpcError(err, ERROR_MESSAGES[ERROR_CODES.DIALOG_OPEN_FILE_FAILED])
      showErrorToast(message)
    }
  }, [addImages])

  return (
    <div
      onClick={handleClickAdd}
      className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 border-border-light hover:border-primary/30 hover:bg-card-hover"
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-background text-text-muted">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 3V13M10 3L6 7M10 3L14 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 13V15C3 16.1046 3.89543 17 5 17H15C16.1046 17 17 16.1046 17 15V13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-text-primary">이미지 추가</p>
        <p className="text-[10px] text-text-muted mt-0.5">드래그 & 드롭 또는 클릭</p>
      </div>
    </div>
  )
}

export default DropZone

import TitleBar from './title-bar'
import LeftPanel from './left-panel'
import CenterPanel from './center-panel'
import RightPanel from './right-panel'
import ProgressBar from '../progress-bar'
import { useFileDrop } from '../../hooks/use-file-drop'

const AppLayout = () => {
  const { isDragOver, dragHandlers } = useFileDrop()

  return (
    <div className="relative flex flex-col w-screen h-screen bg-background" {...dragHandlers}>
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <CenterPanel />
        <RightPanel />
      </div>
      <ProgressBar />
      {isDragOver && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-primary/10 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3 px-8 py-6 bg-card/95 rounded-2xl shadow-xl border border-primary/20">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3V15M12 3L7 8M12 3L17 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 15V17C3 18.6569 4.34315 20 6 20H18C19.6569 20 21 18.6569 21 17V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-primary">여기에 이미지를 놓으세요</p>
              <p className="text-xs text-text-muted mt-1">JPG, PNG, WebP, HEIF, TIFF</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppLayout

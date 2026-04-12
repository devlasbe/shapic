import { useEffect, useState } from 'react'
import { useAppStore } from '../stores/app-store'

const ProgressBar = () => {
  const progress = useAppStore((s) => s.progress)
  const [version, setVersion] = useState('')

  useEffect(() => {
    window.api.app.getVersion().then(setVersion)
  }, [])

  return (
    <div className="flex items-center h-9 px-4 bg-card border-t border-border gap-3">
      {progress.isProcessing ? (
        <>
          <div className="flex-1 h-1.5 bg-border-light rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress.overallPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-text-secondary truncate max-w-[140px]">
            {progress.currentFileName}
          </span>
          <span className="text-[11px] font-semibold text-text-primary tabular-nums whitespace-nowrap">
            {progress.currentIndex}/{progress.totalCount}
          </span>
        </>
      ) : progress.overallPercent === 100 ? (
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-success">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[11px] font-medium text-success">변환 완료</span>
        </div>
      ) : (
        <span className="text-[11px] text-text-muted">Ready</span>
      )}
      {version && (
        <span className="ml-auto text-[11px] text-text-muted">v{version}</span>
      )}
    </div>
  )
}

export default ProgressBar

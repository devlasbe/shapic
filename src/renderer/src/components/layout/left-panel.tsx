import ImageList from '../image-list'

const LeftPanel = () => {
  return (
    <div className="flex flex-col w-[190px] bg-card border-r border-border shrink-0">
      <div className="flex items-center h-11 pl-[72px] pr-3 border-b border-border" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <rect x="0.5" y="0.5" width="4" height="4" rx="1" fill="white" />
              <rect x="6.5" y="0.5" width="4" height="4" rx="1" fill="white" opacity="0.6" />
              <rect x="0.5" y="6.5" width="4" height="4" rx="1" fill="white" opacity="0.6" />
              <rect x="6.5" y="6.5" width="4" height="4" rx="1" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-text-primary tracking-tight">PhotoLayer</span>
        </div>
      </div>
      <ImageList />
    </div>
  )
}

export default LeftPanel

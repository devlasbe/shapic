import Settings from '../settings'

const RightPanel = () => {
  return (
    <div className="flex flex-col w-[210px] bg-card border-l border-border shrink-0">
      <div className="flex items-center h-11 px-3 border-b border-border" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          설정
        </span>
      </div>
      <Settings />
    </div>
  )
}

export default RightPanel

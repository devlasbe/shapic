import { useCallback } from 'react'
import { useAppStore } from '../stores/app-store'
import { selectSelectedImage, selectHasImages, selectIsAllDone } from '../stores/selectors'
import { useProcessing } from '../hooks/use-processing'
import PresetSelector from './preset-selector'
import PillButton from './ui/pill-button'
import Slider from './ui/slider'
import Button from './ui/button'
import Switch from './ui/switch'
import type { OutputFormatType, ResizeFitType } from '../types'

const Settings = () => {
  const options = useAppStore((s) => s.options)
  const setOption = useAppStore((s) => s.setOption)
  const setResizeMode = useAppStore((s) => s.setResizeMode)
  const progress = useAppStore((s) => s.progress)
  const hasImages = useAppStore(selectHasImages)
  const isAllDone = useAppStore(selectIsAllDone)
  const selectedImage = useAppStore(selectSelectedImage)
  const { startSingleProcessing, startBatchProcessing, processingModeRef } = useProcessing()

  const handleSelectFolder = useCallback(async () => {
    const folder = await window.api.dialog.openFolder()
    if (folder) setOption('outputFolder', folder)
  }, [setOption])

  const hasExif = selectedImage?.exifData != null

  const commonDisabled = !options.presetId || !options.outputFolder || progress.isProcessing
  const canSingle = !!selectedImage && !commonDisabled
  const canBatch = hasImages && !isAllDone && !commonDisabled

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-5">
        {/* 프리셋 선택 */}
        <PresetSelector />

        {/* 리사이즈 모드 */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-secondary">리사이즈 모드</label>
          <div className="flex gap-1.5">
            <PillButton
              active={options.resizeMode.kind === 'preset-fit'}
              onClick={() => setResizeMode({ kind: 'preset-fit', fit: 'cover' })}
            >
              프리셋 맞춤
            </PillButton>
            <PillButton
              active={options.resizeMode.kind === 'aspect-ratio'}
              onClick={() => setResizeMode({ kind: 'aspect-ratio' })}
            >
              비율 유지
            </PillButton>
          </div>
          {options.resizeMode.kind === 'preset-fit' && (
            <div className="flex gap-1.5 mt-1.5">
              <PillButton
                active={options.resizeMode.fit === 'cover'}
                onClick={() => setResizeMode({ kind: 'preset-fit', fit: 'cover' })}
              >
                Cover
              </PillButton>
              <PillButton
                active={options.resizeMode.fit === 'contain'}
                onClick={() => setResizeMode({ kind: 'preset-fit', fit: 'contain' })}
              >
                Contain
              </PillButton>
            </div>
          )}
        </div>

        {/* 포맷 선택 */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-secondary">출력 포맷</label>
          <div className="flex gap-1.5">
            <PillButton
              active={options.outputFormat === 'jpeg'}
              onClick={() => setOption('outputFormat', 'jpeg')}
            >
              JPEG
            </PillButton>
            <PillButton
              active={options.outputFormat === 'webp'}
              onClick={() => setOption('outputFormat', 'webp')}
            >
              WebP
            </PillButton>
          </div>
        </div>

        {/* 품질 슬라이더 */}
        <Slider
          label="품질"
          value={options.quality}
          min={1}
          max={100}
          onChange={(v) => setOption('quality', v)}
        />

        {/* EXIF 프레임 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-secondary">EXIF 프레임</label>
            <Switch
              checked={options.frameStyle === 'minimal-white'}
              onChange={(on) => setOption('frameStyle', on ? 'minimal-white' : 'none')}
              disabled={selectedImage != null && !hasExif}
            />
          </div>
          {!hasExif && selectedImage && (
            <p className="text-[10px] text-text-muted">이 이미지에 EXIF 데이터가 없습니다</p>
          )}
        </div>

        {/* 출력 폴더 */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-secondary">출력 폴더</label>
          <button
            onClick={handleSelectFolder}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm bg-card border border-border rounded-lg hover:border-primary/30 transition-colors cursor-pointer text-left"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-text-muted shrink-0">
              <path d="M1.5 3.5V11C1.5 11.5523 1.94772 12 2.5 12H11.5C12.0523 12 12.5 11.5523 12.5 11V5.5C12.5 4.94772 12.0523 4.5 11.5 4.5H7L5.5 2.5H2.5C1.94772 2.5 1.5 2.94772 1.5 3.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={options.outputFolder ? 'text-text-primary truncate' : 'text-text-muted'}>
              {options.outputFolder
                ? options.outputFolder.split('/').pop()
                : '폴더 선택...'}
            </span>
          </button>
          {options.outputFolder && (
            <p className="text-[10px] text-text-muted truncate">{options.outputFolder}</p>
          )}
        </div>
      </div>

      {/* 변환 버튼 */}
      <div className="p-3 border-t border-border-light space-y-1.5">
        <Button
          className="w-full"
          disabled={!canSingle}
          onClick={startSingleProcessing}
        >
          {progress.isProcessing && processingModeRef.current === 'single' ? (
            <span className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-white border-t-transparent animate-spin" />
              변환 중...
            </span>
          ) : (
            '개별 변환'
          )}
        </Button>
        <Button
          className="w-full"
          variant="secondary"
          disabled={!canBatch}
          onClick={startBatchProcessing}
        >
          {progress.isProcessing && processingModeRef.current === 'batch' ? (
            <span className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-border border-t-transparent animate-spin" />
              변환 중...
            </span>
          ) : (
            '일괄 변환'
          )}
        </Button>
      </div>
    </div>
  )
}

export default Settings

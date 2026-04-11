import { useState } from 'react'
import { useAppStore } from '../stores/app-store'
import Modal from './ui/modal'
import Button from './ui/button'
import type { PresetCategoryType, OutputFormatType } from '../types'

type PresetModalPropsType = {
  onClose: () => void
}

const PresetModal = ({ onClose }: PresetModalPropsType) => {
  const addCustomPreset = useAppStore((s) => s.addCustomPreset)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<PresetCategoryType>('instagram')
  const [width, setWidth] = useState(1080)
  const [height, setHeight] = useState(1080)
  const [format, setFormat] = useState<OutputFormatType>('jpeg')
  const [quality, setQuality] = useState(85)

  const handleSave = async () => {
    if (!name.trim()) return

    const saved = await window.api.preset.save({
      name: name.trim(),
      category,
      width,
      height,
      format,
      quality,
      description: `${width}x${height}`
    })

    if (saved) {
      addCustomPreset(saved)
    }
    onClose()
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="커스텀 프리셋 생성">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-text-secondary">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="프리셋 이름"
            className="w-full mt-1.5 px-2.5 py-1.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-text-secondary">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PresetCategoryType)}
            className="w-full mt-1.5 px-2.5 py-1.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
          >
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter / X</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
            <option value="general">일반</option>
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-text-secondary">너비 (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={1}
              className="w-full mt-1.5 px-2.5 py-1.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-text-secondary">높이 (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={1}
              className="w-full mt-1.5 px-2.5 py-1.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-text-secondary">포맷</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as OutputFormatType)}
              className="w-full mt-1.5 px-2.5 py-1.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-text-secondary">품질</label>
            <input
              type="number"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              min={1}
              max={100}
              className="w-full mt-1.5 px-2.5 py-1.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={!name.trim()}>
            저장
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PresetModal

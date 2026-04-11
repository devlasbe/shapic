import { useMemo, useState } from 'react'
import { useAppStore } from '../stores/app-store'
import { getGroupedPresets, PRESET_CATEGORIES } from '../presets/defaults'
import SelectInput from './ui/select-input'
import PresetModal from './preset-modal'
import type { PresetCategoryType } from '../types'

const PresetSelector = () => {
  const presetId = useAppStore((s) => s.options.presetId)
  const setOption = useAppStore((s) => s.setOption)
  const customPresets = useAppStore((s) => s.customPresets)
  const [showModal, setShowModal] = useState(false)

  const grouped = useMemo(() => getGroupedPresets(customPresets), [customPresets])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-text-secondary">프리셋</label>
        <button
          onClick={() => setShowModal(true)}
          className="text-[10px] text-primary hover:text-primary-hover font-medium cursor-pointer transition-colors"
        >
          + 커스텀
        </button>
      </div>

      <select
        value={presetId ?? ''}
        onChange={(e) => setOption('presetId', e.target.value || null)}
        className="w-full px-2.5 py-1.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary cursor-pointer transition-colors duration-150"
      >
        <option value="">프리셋 선택...</option>
        {grouped.map((group) =>
          group.presets.length > 0 ? (
            <optgroup key={group.category} label={group.label}>
              {group.presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} ({preset.description})
                </option>
              ))}
            </optgroup>
          ) : null
        )}
      </select>

      {showModal && <PresetModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

export default PresetSelector

import Store from 'electron-store'
import crypto from 'node:crypto'
import { AppError, ERROR_CODES } from '../../shared/errors.js'

type PresetType = {
  id: string
  name: string
  category: string
  width: number
  height: number | null
  format: 'jpeg' | 'webp'
  quality: number
  description: string
  isCustom: boolean
}

type StoreSchemaType = {
  customPresets: PresetType[]
}

const store = new Store<StoreSchemaType>({
  name: 'presets',
  defaults: {
    customPresets: []
  }
})

const getCustomPresets = (): PresetType[] => {
  return store.get('customPresets')
}

const saveCustomPreset = (input: Omit<PresetType, 'id' | 'isCustom'>): PresetType => {
  const preset: PresetType = {
    ...input,
    id: `custom-${crypto.randomUUID()}`,
    isCustom: true
  }
  const current = store.get('customPresets')
  store.set('customPresets', [...current, preset])
  return preset
}

const updateCustomPreset = (id: string, input: Partial<Omit<PresetType, 'id' | 'isCustom'>>): PresetType => {
  const current = store.get('customPresets')
  const index = current.findIndex((p) => p.id === id)
  if (index === -1) throw new AppError(ERROR_CODES.PRESET_LOOKUP_FAILED, id)

  const updated = { ...current[index], ...input }
  const newList = [...current]
  newList[index] = updated
  store.set('customPresets', newList)
  return updated
}

const deleteCustomPreset = (id: string): void => {
  const current = store.get('customPresets')
  const target = current.find((p) => p.id === id)
  if (!target) throw new AppError(ERROR_CODES.PRESET_LOOKUP_FAILED, id)
  store.set(
    'customPresets',
    current.filter((p) => p.id !== id)
  )
}

export const PresetStore = {
  getAll: getCustomPresets,
  save: saveCustomPreset,
  update: updateCustomPreset,
  delete: deleteCustomPreset,
} as const

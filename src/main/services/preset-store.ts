import Store from 'electron-store'
import crypto from 'node:crypto'

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

export const getCustomPresets = (): PresetType[] => {
  return store.get('customPresets')
}

export const saveCustomPreset = (input: Omit<PresetType, 'id' | 'isCustom'>): PresetType => {
  const preset: PresetType = {
    ...input,
    id: `custom-${crypto.randomUUID()}`,
    isCustom: true
  }
  const current = store.get('customPresets')
  store.set('customPresets', [...current, preset])
  return preset
}

export const updateCustomPreset = (id: string, input: Partial<Omit<PresetType, 'id' | 'isCustom'>>): PresetType => {
  const current = store.get('customPresets')
  const index = current.findIndex((p) => p.id === id)
  if (index === -1) throw new Error(`Preset not found: ${id}`)

  const updated = { ...current[index], ...input }
  const newList = [...current]
  newList[index] = updated
  store.set('customPresets', newList)
  return updated
}

export const deleteCustomPreset = (id: string): void => {
  const current = store.get('customPresets')
  const target = current.find((p) => p.id === id)
  if (!target) throw new Error(`Preset not found: ${id}`)
  store.set('customPresets', current.filter((p) => p.id !== id))
}

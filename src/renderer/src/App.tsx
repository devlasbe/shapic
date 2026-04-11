import { useEffect } from 'react'
import AppLayout from './components/layout/app-layout'
import { useAppStore } from './stores/app-store'

const App = () => {
  const setCustomPresets = useAppStore((s) => s.setCustomPresets)

  useEffect(() => {
    const loadPresets = async () => {
      const presets = await window.api.preset.list()
      setCustomPresets(presets)
    }
    loadPresets()
  }, [setCustomPresets])

  return <AppLayout />
}

export default App

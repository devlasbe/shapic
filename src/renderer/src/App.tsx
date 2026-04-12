import { useEffect } from 'react'
import AppLayout from './components/layout/app-layout'
import { useAppStore } from './stores/app-store'
import { showErrorToast, parseIpcError } from './utils/toast'
import { ERROR_CODES, ERROR_MESSAGES } from '../../shared/errors'

const App = () => {
  const setCustomPresets = useAppStore((s) => s.setCustomPresets)

  useEffect(() => {
    const loadPresets = async () => {
      try {
        const presets = await window.api.preset.list()
        setCustomPresets(presets)
      } catch (err) {
        const message = parseIpcError(err, ERROR_MESSAGES[ERROR_CODES.PRESET_LIST_FAILED])
        showErrorToast(message)
      }
    }
    loadPresets()
  }, [setCustomPresets])

  return <AppLayout />
}

export default App

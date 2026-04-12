import { registerAppHandlers } from './app.js'
import { registerImageHandlers } from './image.js'
import { registerPresetHandlers } from './preset.js'
import { registerDialogHandlers } from './dialog.js'

export const registerAllIpcHandlers = () => {
  registerAppHandlers()
  registerImageHandlers()
  registerPresetHandlers()
  registerDialogHandlers()
}

import { contextBridge, ipcRenderer, webUtils } from 'electron'

contextBridge.exposeInMainWorld('api', {
  image: {
    load: (filePaths: string[]) => ipcRenderer.invoke('image:load', filePaths),
    process: (options: unknown) => ipcRenderer.invoke('image:process', options),
    preview: (request: unknown) => ipcRenderer.invoke('image:preview', request),
    onProgress: (callback: (progress: unknown) => void) => {
      const handler = (_event: unknown, progress: unknown) => callback(progress)
      ipcRenderer.on('image:progress', handler)
      return () => ipcRenderer.removeListener('image:progress', handler)
    },
    onComplete: (callback: (result: unknown) => void) => {
      const handler = (_event: unknown, result: unknown) => callback(result)
      ipcRenderer.on('image:complete', handler)
      return () => ipcRenderer.removeListener('image:complete', handler)
    }
  },
  preset: {
    list: () => ipcRenderer.invoke('preset:list'),
    save: (preset: unknown) => ipcRenderer.invoke('preset:save', preset),
    delete: (id: string) => ipcRenderer.invoke('preset:delete', id)
  },
  dialog: {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    openFolder: () => ipcRenderer.invoke('dialog:openFolder')
  },
  file: {
    getPathForFile: (file: File) => webUtils.getPathForFile(file)
  }
})

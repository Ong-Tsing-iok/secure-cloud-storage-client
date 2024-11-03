import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', {
      changeCurFolder: (curFolderId) => ipcRenderer.send('change-cur-folder', curFolderId),
      onFileListRes: (callback) =>
        ipcRenderer.on('file-list-res', (_event, result) => callback(result)),
      onLog: (callback) => ipcRenderer.on('log', (_event, result) => callback(result)),
      onNotice: (callback) =>
        ipcRenderer.on('notice', (_event, result, level) => callback(result, level)),
      askUploadFile: (curPath) => ipcRenderer.send('upload', curPath),
      askDeleteFile: (uuid) => ipcRenderer.send('delete', uuid),
      askAddFolder: (curPath, folderName) => ipcRenderer.send('add-folder', curPath, folderName),
      askDeleteFolder: (folderId) => ipcRenderer.send('delete-folder', folderId),
      askAllFolder: () => ipcRenderer.invoke('get-folders'),
      askMoveFile: (uuid, targetFolderId) => ipcRenderer.send('move-file', uuid, targetFolderId)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

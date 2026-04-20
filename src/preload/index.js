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
    contextBridge.exposeInMainWorld('api', {
      fetchTopics: (url) => ipcRenderer.invoke('get-topics', url),
      getMessages: (url) => ipcRenderer.invoke('get-messages', url),
      openLoginWindow: () => ipcRenderer.invoke('auth:open-login'),
      onAuthSuccess: (callback) => ipcRenderer.on('auth:status-success', (event, data) => callback(data)),
      logout: () => ipcRenderer.invoke('auth:logout'),
      checkSession: () => ipcRenderer.invoke('auth:check-session'),
      sendNativePost: (data) => ipcRenderer.invoke('send-message', data),
      deleteMessage: (deleteUrl) => ipcRenderer.invoke('delete-message', deleteUrl),
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}



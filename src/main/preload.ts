import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  
  // Database API methods (will be implemented via IPC later)
  database: {
    // Placeholder for future database IPC methods
    testConnection: () => ipcRenderer.invoke('db:test-connection'),
    getAlarms: () => ipcRenderer.invoke('db:get-alarms'),
    createAlarm: (data: any) => ipcRenderer.invoke('db:create-alarm', data),
    updateAlarm: (id: string, data: any) => ipcRenderer.invoke('db:update-alarm', id, data),
    deleteAlarm: (id: string) => ipcRenderer.invoke('db:delete-alarm', id),
    getSettings: () => ipcRenderer.invoke('db:get-settings'),
    updateSettings: (data: any) => ipcRenderer.invoke('db:update-settings', data)
  }
});
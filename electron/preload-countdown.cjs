const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  hideCountdownWindow: () => ipcRenderer.invoke('hide-countdown-window'),
  onCountdownData: (cb) => ipcRenderer.on('countdown-data', (_event, data) => cb(data)),
  settingsGetAll: () => ipcRenderer.invoke('settings-get-all'),
  getSoundPath: (fileName) => ipcRenderer.invoke('get-sound-path', fileName),
});

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  hideWidget: () => ipcRenderer.invoke('hide-widget'),
  showWidget: () => ipcRenderer.invoke('show-widget'),
  onPrayerData: (cb) => ipcRenderer.on('prayer-data', (_event, data) => cb(data)),
  onUpdatePrayers: (cb) => ipcRenderer.on('update-prayers', (_event, data) => cb(data)),
  requestPrayerData: () => ipcRenderer.invoke('widget-request-prayer-data'),
});

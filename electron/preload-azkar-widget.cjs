const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  hideAzkarWidget: () => ipcRenderer.invoke('hide-azkar-widget'),
  dodgeAzkarWidget: (mx, my) => ipcRenderer.invoke('dodge-azkar-widget', mx, my),
});

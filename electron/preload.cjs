const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getDataStats: () => ipcRenderer.invoke('get-data-stats'),
  generateTTS: (text, voice, rate) => ipcRenderer.invoke('tts-generate', text, voice, rate),
  takeFullScreenshot: () => ipcRenderer.invoke('take-full-screenshot'),
  isElectron: true,

  // Reminder system (main process timers)
  setReminderInterval: (channel, intervalMs, enabled) =>
    ipcRenderer.invoke('set-reminder-interval', { channel, intervalMs, enabled }),
  stopReminders: (channel) =>
    ipcRenderer.invoke('stop-reminders', { channel }),
  startReminders: (channel, intervalMs) =>
    ipcRenderer.invoke('start-reminders', { channel, intervalMs }),

  // Listeners for reminders from main process
  onHourlyReminder: (cb) => ipcRenderer.on('hourly-reminder', (_event, data) => cb(data)),
  onHadithReminder: (cb) => ipcRenderer.on('hadith-reminder', (_event, data) => cb(data)),
  onFridayKahf: (cb) => ipcRenderer.on('friday-kahf-reminder', () => cb()),

  // System wake event (after sleep/hibernate)
  onSystemWake: (cb) => ipcRenderer.on('system-wake', () => cb()),

  // Widget
  hideWidget: () => ipcRenderer.invoke('hide-widget'),
  showWidget: () => ipcRenderer.invoke('show-widget'),
  updateWidgetPrayers: () => ipcRenderer.invoke('update-widget-prayers'),
  sendPrayerData: (prayers) => ipcRenderer.invoke('prayer-data-response', prayers),
  onRequestPrayerData: (cb) => ipcRenderer.on('request-prayer-data', () => cb()),

  // Azkar Widget
  toggleAzkarWidget: (enabled) => ipcRenderer.invoke('toggle-azkar-widget', enabled),
  showAzkarWidget: () => ipcRenderer.invoke('show-azkar-widget'),
  hideAzkarWidget: () => ipcRenderer.invoke('hide-azkar-widget'),

  // Countdown Window
  showCountdownWindow: (data) => ipcRenderer.invoke('show-countdown-window', data),
  hideCountdownWindow: () => ipcRenderer.invoke('hide-countdown-window'),

  // Sound path
  getSoundPath: (fileName) => ipcRenderer.invoke('get-sound-path', fileName),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // Persistent settings (survives file:// localStorage issues)
  settingsGet: (key) => ipcRenderer.invoke('settings-get', key),
  settingsSet: (key, value) => ipcRenderer.invoke('settings-set', key, value),
  settingsGetAll: () => ipcRenderer.invoke('settings-get-all'),

  // System tray
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  showMainWindow: () => ipcRenderer.invoke('show-main-window'),
  appIsQuitting: () => ipcRenderer.invoke('app-is-quitting'),
  onRestoreWindow: (cb) => ipcRenderer.on('restore-window', () => cb()),
  onStopAllAudio: (cb) => ipcRenderer.on('stop-all-audio', () => cb()),

  // Auto-start on Windows login
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
  setAutoStart: (enabled) => ipcRenderer.invoke('set-auto-start', enabled),

  // Fetch URL from main process (no CORS)
  fetchUrl: (url) => ipcRenderer.invoke('fetch-url', url),

  // Error logging
  writeErrorLog: (msg) => ipcRenderer.invoke('write-error-log', msg),
});

// Capture uncaught errors and log them
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT:', err.message, err.stack);
});

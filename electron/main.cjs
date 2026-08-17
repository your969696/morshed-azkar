const { app, BrowserWindow, ipcMain, protocol, Notification, powerMonitor, nativeImage, screen, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

const isDev = false;
const DIST = path.join(__dirname, '..', 'dist');

let mainWindow;
let widgetWindow = null;
let azkarWidgetWindow = null;
let countdownWindow = null;
let tray = null;
let hourlyTimer = null;
let hadithTimer = null;

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'public', 'favicon.ico');
  let appIcon = null;
  try { appIcon = nativeImage.createFromPath(iconPath); } catch(e) {}

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 500,
    minHeight: 400,
    title: 'Morshed اذكار',
    icon: appIcon || undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      autoplayPolicy: 'no-user-gesture-required',
    },
    backgroundColor: '#0a0015',
    autoHideMenuBar: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  });

  if (appIcon) {
    try { mainWindow.setIcon(appIcon); } catch(e) {}
  }

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(DIST, 'index.html'));
  }

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      hideWidget();
      hideAzkarWidget();
      mainWindow.hide();
    }
  });
  mainWindow.on('minimize', () => {
    createWidget(); setTimeout(() => sendPrayerDataToWidget(), 1500);
    let widgetEnabled = true;
    try {
      const settingsPath = path.join(app.getPath('userData'), 'app-settings.json');
      if (fs.existsSync(settingsPath)) {
        const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        if (data.azkarWidgetEnabled === false || data.azkarWidgetEnabled === 'false') widgetEnabled = false;
      }
    } catch {}
    if (widgetEnabled) createAzkarWidget();
  });
  mainWindow.on('restore', () => { hideWidget(); hideAzkarWidget(); });
}

function createWidget() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.show();
    widgetWindow.focus();
    return;
  }

  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const widgetW = 200;
  const widgetH = 140;
  const widgetX = screenW - widgetW - 12;
  const widgetY = screenH - widgetH - 12;

  widgetWindow = new BrowserWindow({
    width: widgetW,
    height: widgetH,
    x: widgetX,
    y: widgetY,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    backgroundColor: '#0a0015',
    webPreferences: {
      preload: path.join(__dirname, 'preload-widget.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  widgetWindow.loadFile(path.join(DIST, 'widget.html'));

  widgetWindow.on('closed', () => { widgetWindow = null; });
}

function hideWidget() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.hide();
  }
}

function showWidget() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.show();
  }
}

function destroyWidget() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.destroy();
    widgetWindow = null;
  }
}

function createAzkarWidget() {
  if (azkarWidgetWindow && !azkarWidgetWindow.isDestroyed()) {
    azkarWidgetWindow.show();
    azkarWidgetWindow.focus();
    return;
  }

  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const wW = 260;
  const wH = 180;
  const wX = 12;
  const wY = screenH - wH - 12;

  azkarWidgetWindow = new BrowserWindow({
    width: wW,
    height: wH,
    x: wX,
    y: wY,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload-azkar-widget.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  azkarWidgetWindow.loadFile(path.join(DIST, 'azkar-widget.html'));
  azkarWidgetWindow.on('closed', () => { azkarWidgetWindow = null; });
}

function hideAzkarWidget() {
  if (azkarWidgetWindow && !azkarWidgetWindow.isDestroyed()) {
    azkarWidgetWindow.hide();
  }
}

// ===== COUNTDOWN WINDOW =====

function createCountdownWindow(data) {
  if (countdownWindow && !countdownWindow.isDestroyed()) {
    countdownWindow.show();
    countdownWindow.focus();
    countdownWindow.webContents.send('countdown-data', data);
    return;
  }

  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const w = 300, h = 250;

  countdownWindow = new BrowserWindow({
    width: w,
    height: h,
    x: Math.round((screenW - w) / 2),
    y: Math.round((screenH - h) / 2),
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload-countdown.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  countdownWindow.loadFile(path.join(DIST, 'prayer-countdown.html'));
  countdownWindow.on('closed', () => { countdownWindow = null; });

  // Send data after page is ready
  countdownWindow.webContents.on('did-finish-load', () => {
    if (countdownWindow && !countdownWindow.isDestroyed() && data) {
      countdownWindow.webContents.send('countdown-data', data);
    }
  });

  // Auto-close after 90 seconds (countdown is 60 sec + 30 sec grace)
  setTimeout(() => {
    if (countdownWindow && !countdownWindow.isDestroyed()) {
      countdownWindow.close();
    }
  }, 90000);
}

function hideCountdownWindow() {
  if (countdownWindow && !countdownWindow.isDestroyed()) {
    countdownWindow.close();
    countdownWindow = null;
  }
}

function createTray() {
  if (tray && !tray.isDestroyed()) return;
  
  const iconPath = path.join(__dirname, '..', 'public', 'favicon.ico');
  let trayIcon = null;
  try { trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 }); } catch(e) {}
  
  tray = new Tray(trayIcon || iconPath);
  tray.setToolTip('تطبيق الأذكار الإسلامية');
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '🕌 فتح التطبيق', click: () => { if (mainWindow) mainWindow.show(); } },
    { type: 'separator' },
    { label: '❌ خروج', click: () => { app.isQuitting = true; app.quit(); } }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    }
  });
}

function sendPrayerDataToWidget() {
  if (!widgetWindow || widgetWindow.isDestroyed()) return;
  // Request prayer data from renderer
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
    mainWindow.webContents.send('request-prayer-data', {});
  }
}

function forwardPrayerDataToWidget(prayers) {
  if (!widgetWindow || widgetWindow.isDestroyed()) return;
  try {
    widgetWindow.webContents.send('prayer-data', { prayers });
  } catch (e) {}
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, stream: true } },
]);

app.commandLine.appendSwitch('disable-features', 'AudioServiceOutOfProcess');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-renderer-backgrounding');

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const filePath = path.join(DIST, decodeURIComponent(request.url.slice('app://localhost/'.length)));
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
      '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.woff2': 'font/woff2',
    };
    return { statusCode: 200, headers: { 'Content-Type': mimeTypes[ext] || 'text/html' }, data: fs.createReadStream(filePath) };
  });
  createWindow();
  createTray();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

  // Ensure auto-start is OFF by default (user can enable from Settings)
  try { app.setLoginItemSettings({ openAtLogin: false }); } catch {}

  // Add Referer header for YouTube embeds (required since 2025)
  try {
    if (mainWindow && mainWindow.webContents && mainWindow.webContents.session) {
      mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
        { urls: ['*://*.youtube.com/*', '*://*.googlevideo.com/*'] },
        (details, callback) => {
          details.requestHeaders['Referer'] = 'https://www.youtube.com/';
          callback({ requestHeaders: details.requestHeaders });
        }
      );

      // Add User-Agent for Nominatim + Overpass (required by their ToS)
      mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
        { urls: ['https://nominatim.openstreetmap.org/*', 'https://overpass-api.de/*'] },
        (details, callback) => {
          details.requestHeaders['User-Agent'] = 'AzkarApp/1.0 (halal-finder)';
          callback({ requestHeaders: details.requestHeaders });
        }
      );
    }
  } catch (e) {}

  // Auto-start reminders from saved settings
  try {
    const settingsPath = path.join(app.getPath('userData'), 'reminder-settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      reminderSettings = settings;
    }
  } catch {}
  if (reminderSettings.hourlyEnabled !== false) {
    startHourlyReminders((reminderSettings.hourlyInterval || 30) * 60 * 1000);
  }
  if (reminderSettings.hadithEnabled !== false) {
    startHadithReminders((reminderSettings.hadithInterval || 30) * 60 * 1000);
  }

  // Restart timers after system wakes from sleep
  powerMonitor.on('resume', () => {
    if (reminderSettings.hourlyEnabled !== false) {
      startHourlyReminders((reminderSettings.hourlyInterval || 30) * 60 * 1000);
    }
    if (reminderSettings.hadithEnabled !== false) {
      startHadithReminders((reminderSettings.hadithInterval || 30) * 60 * 1000);
    }
    // Notify renderer to recalibrate
    sendToRenderer('system-wake', {});
  });
});

// ===== FRIDAY AL-KAHF REMINDER =====

let lastKahfReminderDate = null;

function checkFridayKahf() {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  if (day === 5 && hours === 10 && minutes === 0 && lastKahfReminderDate !== todayStr) {
    lastKahfReminderDate = todayStr;
    sendToRenderer('friday-kahf-reminder', {});

    if (!mainWindow || mainWindow.isMinimized() || !mainWindow.isVisible()) {
      showSystemNotification('📖 تذكير سورة الكهف', 'حان وقت قراءة سورة الكهف - الجمعة');
    }
  }
  if (!(day === 5 && hours === 10 && minutes === 0)) {
    if (lastKahfReminderDate === todayStr && !(hours === 10 && minutes === 0)) {
    }
  }
}

setInterval(checkFridayKahf, 30000);

// ===== Keep renderer alive when minimized =====
setInterval(() => {
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
    mainWindow.webContents.send('keepAlive');
  }
}, 10000);

app.on('window-all-closed', () => {
  // Don't quit — keep running in system tray
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (tray && !tray.isDestroyed()) {
    tray.destroy();
    tray = null;
  }
});

// ===== AUTO-START ON WINDOWS LOGIN =====
ipcMain.handle('get-auto-start', () => {
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.handle('set-auto-start', (_event, enabled) => {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: app.getPath('exe'),
  });
  return enabled;
});

// ===== REMINDER SYSTEM (Main Process) =====

const REMINDER_TYPES = ['dhikr', 'hadith', 'history', 'deed', 'behavior'];

function sendToRenderer(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
    mainWindow.webContents.send(channel, data);
  }
}

function showSystemNotification(title, body) {
  if (!Notification.isSupported()) return;
  const notif = new Notification({
    title,
    body,
    icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    silent: false,
  });
  notif.show();
}

function startHourlyReminders(intervalMs) {
  if (hourlyTimer) clearInterval(hourlyTimer);
  hourlyTimer = setInterval(() => {
    const type = REMINDER_TYPES[Math.floor(Math.random() * REMINDER_TYPES.length)];

    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isMinimized()) {
      // App is visible — send to renderer for overlay display
      sendToRenderer('hourly-reminder', { type });
    } else {
      // App is minimized/closed — show system notification
      const labels = {
        dhikr: '📿 وقت الذكر',
        hadith: '📖 حديث نبوي',
        history: '📅 مثل هذا اليوم',
        deed: '⭐ أفضل الأعمال',
        behavior: '🕌 سلوك المسلم',
      };
      showSystemNotification('تذكير إسلامي', labels[type] || 'ذكر جديد');
    }
  }, intervalMs);
}

function startHadithReminders(intervalMs) {
  if (hadithTimer) clearInterval(hadithTimer);
  hadithTimer = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isMinimized()) {
      sendToRenderer('hadith-reminder', {});
    } else {
      showSystemNotification('حديث نبوي شريف', '📖 اقرأ الحديث النبوي');
    }
  }, intervalMs);
}

function stopHourlyReminders() {
  if (hourlyTimer) { clearInterval(hourlyTimer); hourlyTimer = null; }
}

function stopHadithReminders() {
  if (hadithTimer) { clearInterval(hadithTimer); hadithTimer = null; }
}

// Save settings helper
function saveReminderSettings(settings) {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'reminder-settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings), 'utf8');
  } catch {}
}

let reminderSettings = { hourlyEnabled: true, hourlyInterval: 30, hadithEnabled: true, hadithInterval: 30 };

try {
  const settingsPath = path.join(app.getPath('userData'), 'reminder-settings.json');
  if (fs.existsSync(settingsPath)) {
    reminderSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  }
} catch {}

// ===== IPC HANDLERS =====

ipcMain.handle('hide-widget', () => { hideWidget(); });
ipcMain.handle('hide-azkar-widget', () => { hideAzkarWidget(); });
ipcMain.handle('show-azkar-widget', () => { createAzkarWidget(); });
ipcMain.handle('toggle-azkar-widget', (_event, enabled) => {
  if (enabled) {
    createAzkarWidget();
  } else {
    hideAzkarWidget();
  }
});
ipcMain.handle('dodge-azkar-widget', (_event, mx, my) => {
  if (!azkarWidgetWindow || azkarWidgetWindow.isDestroyed()) return;
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const wW = azkarWidgetWindow.getBounds().width;
  const wH = azkarWidgetWindow.getBounds().height;
  const margin = 20;
  const corners = [
    { x: margin, y: margin },
    { x: screenW - wW - margin, y: margin },
    { x: margin, y: screenH - wH - margin },
  ];
  const c = corners[Math.floor(Math.random() * corners.length)];
  azkarWidgetWindow.setPosition(Math.round(c.x), Math.round(c.y), true);
});
ipcMain.handle('show-widget', () => { createWidget(); sendPrayerDataToWidget(); });

// ===== SYSTEM TRAY IPC =====
ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.handle('show-main-window', () => {
  if (mainWindow) mainWindow.show();
});

ipcMain.handle('app-is-quitting', () => {
  app.isQuitting = true;
  app.quit();
});
ipcMain.handle('update-widget-prayers', () => { sendPrayerDataToWidget(); });
ipcMain.handle('prayer-data-response', (_event, prayers) => {
  if (prayers && Object.keys(prayers).length > 0) {
    forwardPrayerDataToWidget(prayers);
  } else {
    sendPrayerDataToWidget();
  }
});

ipcMain.handle('widget-request-prayer-data', () => {
  sendPrayerDataToWidget();
});

// ===== COUNTDOWN WINDOW IPC =====
ipcMain.handle('hide-countdown-window', () => { hideCountdownWindow(); });
ipcMain.handle('show-countdown-window', (_event, data) => { createCountdownWindow(data); });

ipcMain.handle('set-reminder-interval', (_event, { channel, intervalMs, enabled }) => {
  if (channel === 'hourly') {
    reminderSettings.hourlyEnabled = enabled;
    reminderSettings.hourlyInterval = intervalMs / 60000;
    if (enabled) startHourlyReminders(intervalMs);
    else stopHourlyReminders();
  } else if (channel === 'hadith') {
    reminderSettings.hadithEnabled = enabled;
    reminderSettings.hadithInterval = intervalMs / 60000;
    if (enabled) startHadithReminders(intervalMs);
    else stopHadithReminders();
  }
  saveReminderSettings(reminderSettings);
});

ipcMain.handle('stop-reminders', (_event, { channel }) => {
  if (channel === 'hourly') stopHourlyReminders();
  else if (channel === 'hadith') stopHadithReminders();
});

ipcMain.handle('start-reminders', (_event, { channel, intervalMs }) => {
  if (channel === 'hourly') startHourlyReminders(intervalMs);
  else if (channel === 'hadith') startHadithReminders(intervalMs);
});

// ===== TTS =====

function getTtsCachePath(text) {
  const crypto = require('crypto');
  const appData = process.env.APPDATA || path.join(require('os').homedir(), 'AppData', 'Roaming');
  const cacheDir = path.join(appData, 'azkar-app', 'tts-cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  const h = crypto.createHash('md5').update(`edge-ar-SA-HamedNeural:${text}`).digest('hex');
  return path.join(cacheDir, `${h}.mp3`);
}

function findPython() {
  const candidates = ['python', 'python3', 'py'];
  for (const c of candidates) {
    try {
      require('child_process').execSync(`${c} --version`, { stdio: 'ignore', timeout: 3000 });
      return c;
    } catch {}
  }
  return null;
}

ipcMain.handle('tts-generate', async (_event, text) => {
  if (!text || !text.trim()) return null;
  const cached = getTtsCachePath(text);
  if (fs.existsSync(cached)) return cached;

  const python = findPython();
  if (!python) return null;

  const ttsScript = path.join(__dirname, 'edge-tts-gen.py');
  if (!fs.existsSync(ttsScript)) return null;

  return new Promise((resolve) => {
    execFile(python, [ttsScript, text, cached], { timeout: 30000 }, (err) => {
      if (err) { resolve(null); return; }
      if (fs.existsSync(cached)) resolve(cached);
      else resolve(null);
    });
  });
});

// ===== ERROR LOG =====
ipcMain.handle('write-error-log', (_event, msg) => {
  try {
    const logPath = path.join(app.getPath('userData'), 'error.log');
    fs.writeFileSync(logPath, msg, 'utf8');
  } catch {}
});

// ===== PERSISTENT SETTINGS (fix localStorage not persisting with file://) =====

ipcMain.handle('settings-get', (_event, key) => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'app-settings.json');
    if (!fs.existsSync(settingsPath)) return null;
    const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    return data[key] ?? null;
  } catch { return null; }
});

ipcMain.handle('settings-set', (_event, key, value) => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'app-settings.json');
    let data = {};
    if (fs.existsSync(settingsPath)) {
      data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
    data[key] = value;
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch { return false; }
});

ipcMain.handle('settings-get-all', () => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'app-settings.json');
    if (!fs.existsSync(settingsPath)) return {};
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch { return {}; }
});

ipcMain.handle('get-sound-path', (_event, fileName) => {
  if (app.isPackaged) {
    return path.join(app.getAppPath(), 'dist', fileName);
  }
  return path.join(__dirname, '..', 'dist', fileName);
});

  ipcMain.handle('take-full-screenshot', async () => {
    return await captureFullPage();
  });

  ipcMain.handle('get-data-stats', () => {
  const stats = { quran: 0, tafseer: 0, hadith: 0 };
  try {
    const quranDir = path.join(DIST, 'data', 'quran');
    if (fs.existsSync(quranDir)) stats.quran = fs.readdirSync(quranDir).length;
    const tafseerPath = path.join(DIST, 'data', 'tafsir.json');
    if (fs.existsSync(tafseerPath)) stats.tafseer = fs.statSync(tafseerPath).size;
    const hadithDir = path.join(DIST, 'data', 'hadith');
    if (fs.existsSync(hadithDir)) {
      fs.readdirSync(hadithDir).forEach(f => {
        const s = fs.statSync(path.join(hadithDir, f));
        stats.hadith += s.size;
      });
    }
  } catch {}
  return stats;
});

// ===== FULL PAGE SCREENSHOT =====
const { globalShortcut } = require('electron');

async function captureFullPage() {
  try {
    const originalBounds = mainWindow.getBounds();
    const originalResizable = mainWindow.isResizable();

    mainWindow.setResizable(true);

    const dims = JSON.parse(await mainWindow.webContents.executeJavaScript(`
      JSON.stringify({
        pageHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
        pageWidth: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
      })
    `));

    const { pageHeight, pageWidth } = dims;
    console.log('Full page:', pageWidth, 'x', pageHeight);

    await mainWindow.webContents.executeJavaScript(`
      var __sc = document.querySelector('[data-scroll-container]');
      if (__sc) {
        __sc.__origOverflow = __sc.style.overflow;
        __sc.__origHeight = __sc.style.height;
        __sc.__origFlex = __sc.style.flex;
        __sc.style.overflow = 'visible';
        __sc.style.height = '${pageHeight}px';
        __sc.style.flex = 'none';
      }
      window.scrollTo(0, 0);
    `);

    mainWindow.setSize(pageWidth, Math.max(pageHeight, 200), false);
    await new Promise(r => setTimeout(r, 1500));

    const img = await mainWindow.webContents.capturePage({ x: 0, y: 0, width: pageWidth, height: pageHeight });

    await mainWindow.webContents.executeJavaScript(`
      var __sc = document.querySelector('[data-scroll-container]');
      if (__sc) {
        __sc.style.overflow = __sc.__origOverflow || '';
        __sc.style.height = __sc.__origHeight || '';
        __sc.style.flex = __sc.__origFlex || '';
      }
      window.scrollTo(0, 0);
    `);

    mainWindow.setBounds(originalBounds);
    mainWindow.setResizable(originalResizable);

    const screenshotDir = path.join(app.getPath('desktop'), 'AzkarScreenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

    const filename = `FullPage_${Date.now()}.png`;
    const filePath = path.join(screenshotDir, filename);
    fs.writeFileSync(filePath, img.toPNG());

    new Notification({
      title: 'تم حفظ الصورة الكاملة',
      body: `${pageWidth}x${pageHeight}px - ${filename}`,
      silent: true
    }).show();

    return filePath;
  } catch (err) {
    console.error('Screenshot error:', err);
    new Notification({ title: 'خطأ', body: err.message }).show();
    try {
      const ob = mainWindow.getBounds();
      mainWindow.setBounds(ob);
    } catch {}
    return null;
  }
}

app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+Shift+F12', async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      await captureFullPage();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

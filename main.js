const { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;

/**
 * Dynamically resolves Google Chrome binary location on Windows
 */
function getChromePath() {
  try {
    const chromeLauncher = require('chrome-launcher');
    const installations = chromeLauncher.Launcher.getInstallations();
    if (installations && installations.length > 0) {
      return installations[0];
    }
  } catch (e) {
    // Fallback to standard path search
  }

  const possiblePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    path.join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google\\Chrome\\Application\\chrome.exe')
  ];

  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      plugins: true,
    }
  });

  mainWindow.maximize();
  mainWindow.setIgnoreMouseEvents(true, { forward: false });
  mainWindow.loadFile('index.html');
}

// 1. LAUNCHER (GPU Disabled is CRITICAL for capturing DRM streaming sources like Netflix)
ipcMain.on('launch-external', (event, url) => {
  const chromePath = getChromePath();
  console.log(`🚀 Launching External Projector Source: ${url} using ${chromePath}`);

  if (!chromePath) {
    console.error("❌ Google Chrome binary not found!");
    event.sender.send('projector-error', "Chrome binary not found on system. Please install Chrome.");
    return;
  }

  const args = [
    `--app=${url}`,
    '--new-window',
    '--disable-gpu',
    '--disable-d3d11',
    '--disable-gpu-compositing',
    '--disable-software-rasterizer',
    '--user-data-dir=' + path.join(app.getPath('userData'), 'projector-session')
  ];

  spawn(chromePath, args);
});

// 2. SOURCE FINDER (Fetch open windows/screens for renderer selection)
ipcMain.handle('get-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 0, height: 0 }
    });
    return sources
      .filter(s => s.name && s.name.trim() !== '')
      .map(s => ({ name: s.name, id: s.id }));
  } catch (err) {
    console.error('Error fetching desktop sources:', err);
    return [];
  }
});

// 3. APPLICATION LIFECYCLE & SHORTCUTS
app.whenReady().then(() => {
  createWindow();

  const sendToRenderer = (channel) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (channel === 'toggle-command') {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.setIgnoreMouseEvents(false);
        mainWindow.show();
        mainWindow.focus();
      }
      mainWindow.webContents.send(channel);
    }
  };

  // Register Command HUD shortcuts (Primary + Fallbacks for conflict prevention)
  ['CommandOrControl+Shift+X', 'CommandOrControl+Shift+Space', 'Alt+G'].forEach(key => {
    try {
      const ok = globalShortcut.register(key, () => sendToRenderer('toggle-command'));
      console.log(`🔑 Shortcut '${key}' registered: ${ok}`);
    } catch (e) {
      console.error(`Failed to register '${key}':`, e);
    }
  });

  // Register Interactive Mode shortcuts
  ['CommandOrControl+Shift+Z', 'Alt+Z'].forEach(key => {
    try {
      const ok = globalShortcut.register(key, () => sendToRenderer('toggle-stealth'));
      console.log(`🔑 Shortcut '${key}' registered: ${ok}`);
    } catch (e) {}
  });

  // Register Hide All shortcuts
  ['CommandOrControl+Shift+H', 'Alt+H'].forEach(key => {
    try {
      const ok = globalShortcut.register(key, () => sendToRenderer('toggle-hide'));
      console.log(`🔑 Shortcut '${key}' registered: ${ok}`);
    } catch (e) {}
  });
});

ipcMain.on('set-ignore-mouse', (event, config) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (config.ignore) {
    mainWindow.setIgnoreMouseEvents(true, { forward: config.forward || false });
    mainWindow.blur();
  } else {
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.focus();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
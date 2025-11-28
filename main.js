const { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;

// CONFIG: Your Chrome Path
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true, // Still kept for normal browsing
      plugins: true,
    }
  });

  mainWindow.maximize();
  mainWindow.setIgnoreMouseEvents(true, { forward: false });
  mainWindow.loadFile('index.html');
}

// 1. LAUNCHER (GPU Disabled is CRITICAL for capturing Netflix)
ipcMain.on('launch-external', (event, url) => {
  console.log(`🚀 Launching External Projector Source: ${url}`);
  
  const args = [
    `--app=${url}`,
    '--new-window',
    // We disable GPU so Netflix can't block the screen capture (HDCP bypass)
    '--disable-gpu',
    '--disable-d3d11', 
    '--disable-gpu-compositing',
    '--disable-software-rasterizer',
    '--user-data-dir=' + path.join(app.getPath('userData'), 'projector-session') 
  ];

  spawn(CHROME_PATH, args);
});

// 2. SOURCE FINDER (Allows HTML to see open windows)
ipcMain.handle('get-sources', async () => {
  // Fetch all open windows that we can capture
  const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
  // Send just the names and IDs back to the UI
  return sources.map(s => ({ name: s.name, id: s.id }));
});

app.whenReady().then(() => {
  createWindow();

  // SHORTCUTS
  globalShortcut.register('CommandOrControl+Shift+Z', () => mainWindow.webContents.send('toggle-stealth'));
  globalShortcut.register('CommandOrControl+Shift+X', () => {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    mainWindow.webContents.send('toggle-command');
  });
  globalShortcut.register('CommandOrControl+Shift+H', () => mainWindow.webContents.send('toggle-hide'));
});

ipcMain.on('set-ignore-mouse', (event, config) => {
  if (config.ignore) {
    mainWindow.setIgnoreMouseEvents(true, { forward: config.forward });
    mainWindow.blur();
  } else {
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.focus();
  }
});
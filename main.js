require('dotenv').config(); // <--- Loads the .env file
const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');

// Get paths from the .env file
const widevinePath = process.env.WIDEVINE_PATH;
const widevineVersion = process.env.WIDEVINE_VERSION;

// Only inject if the variables exist (prevents crashing if you forget the .env)
if (widevinePath && widevineVersion) {
  app.commandLine.appendSwitch('widevine-cdm-path', widevinePath);
  app.commandLine.appendSwitch('widevine-cdm-version', widevineVersion);
} else {
  console.warn("⚠️ Widevine DRM not configured. Video streaming may fail.");
}

let mainWindow;

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
      webviewTag: true,
      plugins: true,
    }
  });

  mainWindow.maximize();
  
  // Start in Ghost Mode
  mainWindow.setIgnoreMouseEvents(true, { forward: false });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  // SHORTCUTS
  globalShortcut.register('CommandOrControl+Shift+Z', () => mainWindow.webContents.send('toggle-stealth'));
  globalShortcut.register('CommandOrControl+Shift+X', () => mainWindow.webContents.send('toggle-command'));
  globalShortcut.register('CommandOrControl+Shift+H', () => mainWindow.webContents.send('toggle-hide'));
});

// MOUSE HANDLING
ipcMain.on('set-ignore-mouse', (event, config) => {
  if (config.ignore) {
    mainWindow.setIgnoreMouseEvents(true, { forward: config.forward });
    mainWindow.blur();
  } else {
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.focus();
  }
});
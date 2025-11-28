const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');

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
      // We keep plugins enabled just in case, but no complex DRM paths
      plugins: true, 
    }
  });

  mainWindow.maximize();
  
  // Start in Ghost Mode (Click-through, Game Active, NO Hover)
  mainWindow.setIgnoreMouseEvents(true, { forward: false });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  // SHORTCUT 1: Stealth Mode (Ctrl+Shift+Z) - Mouse works, UI hidden
  globalShortcut.register('CommandOrControl+Shift+Z', () => {
    mainWindow.webContents.send('toggle-stealth');
  });

  // SHORTCUT 2: Command Mode (Ctrl+Shift+X) - Mouse works, Search UI visible
  globalShortcut.register('CommandOrControl+Shift+X', () => {
    mainWindow.webContents.send('toggle-command');
  });

  // SHORTCUT 3: Hide All (Ctrl+Shift+H) - Panic button
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    mainWindow.webContents.send('toggle-hide');
  });
});

// Listener for manual mode changes from the UI
ipcMain.on('set-ignore-mouse', (event, config) => {
  if (config.ignore) {
    // GHOST MODE: 
    // forward: false means the browser won't even see your mouse moving (saves CPU/hover effects)
    mainWindow.setIgnoreMouseEvents(true, { forward: config.forward });
    mainWindow.blur();
  } else {
    // INTERACTIVE MODE
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.focus();
  }
});
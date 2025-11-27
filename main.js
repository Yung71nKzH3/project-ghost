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
      webviewTag: true
    }
  });

  mainWindow.maximize();
  
  // Start in Ghost Mode (Click-through, Game Active)
  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.loadFile('index.html');
}

// Helper to switch click-through states
function setInteractive(enable) {
  if (enable) {
    // INTERACTIVE: Mouse works on browser
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.focus();
  } else {
    // GHOST: Mouse passes through to game
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    mainWindow.blur();
  }
}

app.whenReady().then(() => {
  createWindow();

  // SHORTCUT 1: Stealth Mode (Ctrl+Shift+Z)
  // Toggles mouse interactivity, but keeps the Search Bar HIDDEN.
  globalShortcut.register('CommandOrControl+Shift+Z', () => {
    mainWindow.webContents.send('toggle-stealth');
  });

  // SHORTCUT 2: Command Mode (Ctrl+Shift+X)
  // Toggles mouse interactivity AND shows the Search Bar.
  globalShortcut.register('CommandOrControl+Shift+X', () => {
    mainWindow.webContents.send('toggle-command');
  });
});

// Listener for manual mode changes from the UI
ipcMain.on('set-ignore-mouse', (event, shouldIgnore) => {
  setInteractive(!shouldIgnore);
});
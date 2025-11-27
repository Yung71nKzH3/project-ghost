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
  
  // Start in Ghost Mode (Click-through, Game Active, NO Hover)
  mainWindow.setIgnoreMouseEvents(true, { forward: false });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  // SHORTCUT 1: Stealth Mode (Ctrl+Shift+Z)
  // Mouse works on browser, UI hidden.
  globalShortcut.register('CommandOrControl+Shift+Z', () => {
    mainWindow.webContents.send('toggle-stealth');
  });

  // SHORTCUT 2: Command Mode (Ctrl+Shift+X)
  // Mouse works, Search Bar visible.
  globalShortcut.register('CommandOrControl+Shift+X', () => {
    mainWindow.webContents.send('toggle-command');
  });

  // SHORTCUT 3: Hide All / Panic Button (Ctrl+Shift+H)
  // Completely hides everything.
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    mainWindow.webContents.send('toggle-hide');
  });
});

// Listener for manual mode changes from the UI
ipcMain.on('set-ignore-mouse', (event, config) => {
  const ignore = config.ignore;
  const forward = config.forward;

  if (ignore) {
    // GHOST MODE
    // If forward is TRUE: Clicks pass to game, but Browser sees mouse move (Hover works)
    // If forward is FALSE: Browser is dead to the world (No Hover)
    mainWindow.setIgnoreMouseEvents(true, { forward: forward });
    mainWindow.blur();
  } else {
    // INTERACTIVE MODE
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.focus();
  }
});
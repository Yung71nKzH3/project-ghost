const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,    // Makes the background see-through
    frame: false,         // Removes the white top bar/X button
    alwaysOnTop: true,    // Keeps it over your game
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true  // <--- ADD THIS LINE!
    }
  });

  mainWindow.maximize(); // Fill the screen
  mainWindow.setIgnoreMouseEvents(true, { forward: true }); // Start in "Ghost Mode"
  mainWindow.loadFile('index.html');
}

// TOGGLE: Press Ctrl + Shift + Z to switch modes
function toggleInteraction() {
  // We check if the window is currently ignoring mouse events
  // But since Electron doesn't give us a simple "get" function, we'll track it manually or just toggle.
  // Let's use a simple boolean tracker in the renderer or just flip logic here.
  
  // NOTE: We send a message to the webpage so it knows to change the visual style
  mainWindow.webContents.send('toggle-mode');
}

app.whenReady().then(() => {
  createWindow();

  // Register the magic hotkey
  globalShortcut.register('CommandOrControl+Shift+Z', () => {
    mainWindow.webContents.send('request-toggle');
  });
});

// Listen for the command from the webpage to actually change window settings
ipcMain.on('set-ignore-mouse', (event, shouldIgnore) => {
  if (shouldIgnore) {
    // GHOST MODE: Clicks go through to the game
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    mainWindow.blur(); // Unfocus so game takes over
  } else {
    // BROWSER MODE: Clicks stay on the browser
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.focus();
  }
});
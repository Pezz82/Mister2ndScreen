// ----------------------------
// File: main.js
// ----------------------------
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    autoHideMenuBar: true,     // hide default menu bar
    resizable: true,
    show: false,               // wait to show until ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the built React app (docs/index.html)
  win.loadFile(path.join(__dirname, 'docs', 'index.html'));
  
  // For debugging: open the dev‑tools so we can inspect console/network logs
  win.webContents.once('dom-ready', () => {
  win.webContents.openDevTools({ mode: 'detach' });
  });
  win.once('ready-to-show', () => {
    win.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


// ----------------------------
// File: preload.js
// ----------------------------
// (Use this to expose safe APIs to renderer if needed)
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // add methods here if you need Node APIs
});


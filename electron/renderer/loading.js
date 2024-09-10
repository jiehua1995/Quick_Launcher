// loading.js
window.onload = () => {
  const { ipcRenderer } = require('electron');
  ipcRenderer.send('loading-ready');
};

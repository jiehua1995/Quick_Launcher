const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getApps: () => ipcRenderer.send('get-apps'),
  onSendApps: (callback) => ipcRenderer.on('send-apps', (event, data) => callback(data)),
  launchApp: (appPath, appName) => ipcRenderer.send('launch-app', appPath, appName),
  openFolder: (folderPath) => ipcRenderer.send('open-folder', folderPath),
  openFile: (filePath) => ipcRenderer.send('open-file', filePath),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  notifyReady: () => ipcRenderer.send('content-ready')
});

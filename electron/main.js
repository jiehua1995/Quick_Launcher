const { app, BrowserWindow, ipcMain, dialog, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let loadingWindow;

app.disableHardwareAcceleration();
// 禁用硬件加速，解决 Electron 在某些系统上的渲染问题

function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 300,
    height: 300,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-loading.js') // 引入预加载脚本
    }
  });

  loadingWindow.loadFile(path.join(__dirname, 'renderer', 'loading.html'));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      partition: 'nopersist'
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    show: false // 先隐藏主窗口，等内容准备好再显示
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Optional: To completely remove the menu
  mainWindow.setMenu(null);

  // Ensure the menu is hidden on startup
  mainWindow.setMenuBarVisibility(false);

  // Clear cache
  session.defaultSession.clearCache().then(() => {
    console.log('Cache cleared');
  });
}

app.on('ready', () => {
  createLoadingWindow();
  createMainWindow();
});

ipcMain.on('loading-ready', () => {
  // 在loading.html加载完成后，显示主窗口
  setTimeout(() => {
    if (loadingWindow) {
      loadingWindow.close();
      loadingWindow = null;
    }
    if (mainWindow) {
      mainWindow.show();
    }
  }, 2000); // 延迟2秒
});

ipcMain.on('content-ready', () => {
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createMainWindow();
  }
});

ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

ipcMain.on('get-apps', (event) => {
  const userDataPath = app.getPath('userData');
  const defaultDataPath = path.join(__dirname, 'quick.json');
  const customDataPath = path.join(userDataPath, 'quick.json');

  const dataPath = fs.existsSync(customDataPath) ? customDataPath : defaultDataPath;

  fs.readFile(dataPath, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    event.reply('send-apps', JSON.parse(data));
  });
});

ipcMain.on('launch-app', (event, appPath, appName) => {
  if (!fs.existsSync(appPath)) {
    dialog.showErrorBox('Error', `The file for ${appName} does not exist at path: ${appPath}`);
    return;
  }

  const command = `"${appPath.replace(/\\/g, '\\\\')}"`;
  const process = spawn(command, { shell: true, detached: true });

  process.on('error', (err) => {
    console.error(`Could not launch ${appName}: ${err.message}`);
    dialog.showErrorBox('Error', `Could not launch ${appName}: ${err.message}`);
  });
});

ipcMain.on('open-folder', (event, folderPath) => {
  if (!fs.existsSync(folderPath)) {
    dialog.showErrorBox('Error', `The folder does not exist at path: ${folderPath}`);
    return;
  }

  shell.openPath(folderPath).catch(err => {
    console.error(`Could not open folder: ${err.message}`);
    dialog.showErrorBox('Error', `Could not open folder: ${err.message}`);
  });
});

ipcMain.on('open-file', (event, filePath) => {
  if (!fs.existsSync(filePath)) {
    dialog.showErrorBox('Error', `The file does not exist at path: ${filePath}`);
    return;
  }

  shell.openPath(filePath).catch(err => {
    console.error(`Could not open file: ${err.message}`);
    dialog.showErrorBox('Error', `Could not open file: ${err.message}`);
  });
});

const { app, BrowserWindow, ipcMain, dialog, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;

app.disableHardwareAcceleration();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      partition: 'nopersist' // 使用非持久性分区
    },
    autoHideMenuBar: true, // 隐藏菜单栏
    icon: path.join(__dirname, 'assets', '48x48.png') // 指定图标文件路径
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

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

ipcMain.on('get-apps', (event) => {
  const userDataPath = app.getPath('userData'); // 获取用户数据目录
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

import * as electron from 'electron';
import {app, BrowserWindow} from 'electron';

var mainWindow: Electron.BrowserWindow = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  mainWindow.loadURL('file://' + __dirname + '/index.html');
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // 引入主进程
  require('./main/ipcMain.js')

  mainWindow.on('closed', function() {
    mainWindow = null;
  });  
});

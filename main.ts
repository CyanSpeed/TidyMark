import * as electron from 'electron';
import { app, BrowserWindow, Menu, shell, ipcMain, Tray } from 'electron';

var mainWindow: Electron.BrowserWindow = null;

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname + "\\Assets\\TidyMark.png",
    webPreferences: {
      webSecurity: false
    }
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');
  
  // Open the DevTools.
  //mainWindow.webContents.openDevTools({mode:'bottom'});

  // 引入主进程
  require('./main/ipcMain.js')

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  //创建任务栏图标、菜单
  const tray = new Tray(__dirname + "\\Assets\\TidyMark.png");
  const trayContextMenu = Menu.buildFromTemplate([
    // {
    //   label: '打开',
    //   click: () => {
    //     mainWindow.show();
    //   }
    // }, 
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('TidyMark');
  tray.on('click', () => {
    mainWindow.show();
  });
  tray.on('right-click', () => {
    tray.popUpContextMenu(trayContextMenu);
  });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
var mainWindow = null;
electron_1.app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('ready', function () {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        icon: __dirname + "\\Assets\\TidyMark.png",
        webPreferences: {
            webSecurity: false
        }
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // 引入主进程
    require('./main/ipcMain.js');
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    //创建任务栏图标、菜单
    const tray = new electron_1.Tray(__dirname + "\\Assets\\TidyMark.png");
    const trayContextMenu = electron_1.Menu.buildFromTemplate([
        // {
        //   label: '打开',
        //   click: () => {
        //     mainWindow.show();
        //   }
        // }, 
        {
            label: '退出',
            click: () => {
                electron_1.app.quit();
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
//# sourceMappingURL=main.js.map
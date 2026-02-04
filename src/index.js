const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const PouchDB = require('pouchdb');
let db;
let gx;
let url;

if (require('electron-squirrel-startup')) {
  app.quit();
}
// import { greet } from 'https://sparkly-frangollo-7c1e65.netlify.app/data.js';
// export function processData(data) {
//     window.gx=parseInt(data.gx[0]), // 将字符串转换为数字
//     window.url=data.url[0] // 直接获取 URL
// }
const createWindow = () => {
  db = new PouchDB('mydatabase/my');

  // Create the browser window.
  let mainWindow = new BrowserWindow({
    minWidth: 950,
    minHeight: 600,
    width: 950,
    height: 600,
    show: false,
    frame: false,

    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false,
      contextIsolation: false
      // preload: path.join(__dirname, 'preload.js'),

    },
    icon: path.join(__dirname, 'Fred.png')
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // // Open the DevTools.
    mainWindow.webContents.openDevTools();

    ipcMain.on('gx-data', (event, gxValue) => { //接受渲染进程中发送的js文件信息
      gx = gxValue.gx;
      url = gxValue.url[0];
  
      // 可选：向渲染进程发送确认回执
      event.sender.send('data-received', '主进程已接收数据');
    });
  
    ipcMain.on('mini', (event, arg) => {
      //app.quit()
      console.log(arg);
      mainWindow.minimize();
    })
    //mainWindow.webContents.openDevTools();
    ipcMain.on('ext', (event, arg) => {
      app.quit()
      //console.log(arg);
      //mainWindow.minimize();     
    })
    //mainWindow.webContents.openDevTools();
    ipcMain.on('max', (event, arg) => {
      //app.quit()
      console.log(arg);
      //mainWindow.minimize();   
      // onclick="javascript:history.go(-1);"
      if (mainWindow.isMaximized()) {
        mainWindow.restore();
      } else {
        mainWindow.maximize();
      }
    })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    db.allDocs({ include_docs: true }).then(function (result) {
      // 遍历结果集中的文档
      var docs = result.rows.map(function (row) {
        return row.doc.gx;//筛选数据库中的全部name字段
      });
      var doc = result.rows.map(function (row) {
        return row.doc;
      });

      console.log(docs + '////');
      console.log(gx);
      console.log(url);
      console.log(doc);
      if (docs == gx) {
        console.log('版本一样')
      } else {
        console.log('版本不一样')
        mainWindow.webContents.send('gx');

      }
      //将数据库中的name字段发送到渲染进程
      setTimeout(() => {
        mainWindow.webContents.send('from-main', { message2: doc });
        mainWindow.webContents.send('from-wlgx', { message1: gx });
        mainWindow.webContents.send('from-bdgx', { message1: docs });
      }, 10); // 例如，3秒后发送数据
      window.onload = getLocalStorageParams;

      // 可以在这里对所有文档进行进一步处理
    }).catch(function (error) {
      console.error('Error: ' + error);
      // 处理错误
    });
  });


  // 监听下载事件
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    const currentURL = webContents.getURL();
    console.log(currentURL);
    const downloadURL = item.getURL();
    console.log('Download URL:', downloadURL.slice(-3));
    if (downloadURL.slice(-3) == "zip") {
      // 设置保存路径和文件名
      const savePath = path.join(
        app.getPath('downloads'),
        'gx.zip' // 直接指定文件名
      );
      item.setSavePath(savePath);

      // 监听下载进度（可选：发送给渲染进程）
      item.on('updated', () => {
        mainWindow.webContents.send('download-progress', {
          progress: Math.floor(item.getReceivedBytes() / item.getTotalBytes() * 100)
        });
      });

      // 监听下载完成（可选）
      item.on('done', (e, state) => {
        if (state === 'completed') {
          db.allDocs({ include_docs: true }).then(function (result) {
            const docs = result.rows
              .map(row => row.doc) // 提取文档
              .filter(doc => doc.gx !== undefined); // 过滤出包含 gx 字段的文档

            // 遍历所有符合条件的文档
            docs.forEach(function (doc) {
              // 修改 gx 字段
              doc.gx = gx; // 修改为你想要的值

              // 保存修改后的文档
              db.put(doc).then(function (response) {
                console.log('文档更新成功', response);
              }).catch(function (err) {
                console.error('更新文档时出错', err);
              });
            });
          }).catch(function (err) {
            console.error('获取文档时出错', err);
          });
          const child = spawn('C:\\update\\MyApp.exe', [], {
            detached: true,    // 让新程序脱离父进程独立运行
            stdio: 'ignore',   // 忽略输入输出（防止占用父进程资源）
            shell: true
          });
          child.unref();
          process.exit(0);
        } else {
          mainWindow.webContents.send('download-complete', { success: false });
        }
      });
    }
  });


  // 接收渲染进程的下载请求（可选）
  ipcMain.on('request-download', () => {
    mainWindow.webContents.downloadURL(url);
  });







};


// var fs = require("fs");

// // 异步读取
// var data = fs.readFileSync('./src/index.html');
// console.log("同步读取: " + data.toString());

// console.log("程序执行完毕。");
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


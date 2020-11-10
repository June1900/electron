const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow () {
	let mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			// preload: path.join(__dirname, 'preload.js')
			nodeIntegration: true,
			// Whether to enable the remote module.
			enableRemoteModule: true
		}
	});
	// 然后加载应用的 index.html。对应的index.html 就是初始界面。
	mainWindow.loadFile('index.html');
	// 打开开发者工具.
	mainWindow.webContents.openDevTools();
	mainWindow.on('closed', () => {
		// 取消引用 window 对象，如果你的应用支持多窗口的话，
		// 通常会把多个 window 对象存放在一个数组里面，
		// 与此同时，你应该删除相应的元素。
		mainWindow = null;
	});
}
//
app.whenReady().then(() => {
	createWindow();
	// 在macOS上，当单击dock图标并且没有其他窗口打开时，
	// 通常在应用程序中重新创建一个窗口。
	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', function () {
	// 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
	// 否则绝大部分应用及其菜单栏会保持激活。
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

//接收渲染进程的asynchronous-message通知
ipcMain.on('asynchronous-message', (event, arg) => {
	//发送asynchronous-reply事件到渲染进程
	event.sender.send('asynchronous-reply', { ping: 'pong', num: '1' });
});
// 接收渲染进程的synchronous-message通知
ipcMain.on('synchronous-message', (event, arg) => {
	event.returnValue = 'pong';
});

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			// preload: path.join(__dirname, 'preload.js')
			nodeIntegration: true
		}
	});
	// 加载html文件
	mainWindow.loadFile('index.html');
	// 打开 DevTools.
	mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
	createWindow();

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

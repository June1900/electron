const { ipcRenderer } = require('electron');
// 在渲染进程打开提示对话框
const { dialog, BrowserWindow } = require('electron').remote;

//发送asynchronous-message事件到主进程
ipcRenderer.send('asynchronous-message', 'ping');
//接收主进程的asynchronous-reply通知
ipcRenderer.on('asynchronous-reply', (event, arg) => {
	console.log('asynchronous-reply : args:', arg);
	const { num, ping } = arg;
	const message = `Asynchronous message reply: num:${num},ping:${ping}`;
	document.getElementById('async-reply').innerHTML = message;
});

window.addEventListener('DOMContentLoaded', () => {
	const replaceText = (selector, text) => {
		const element = document.getElementById(selector);
		if (element) element.innerText = text;
	};

	for (const type of [ 'chrome', 'node', 'electron' ]) {
		replaceText(`${type}-version`, process.versions[type]);
	}

	const btn = document.getElementById('newButton');
	btn.onclick = () => {
		// 点击发送通信事件
		console.log('点击');
		const reply = ipcRenderer.sendSync('synchronous-message', 'ping');
		const message = `Synchronous message reply: ${reply}`;
		document.getElementById('sync-reply').innerHTML = message;
	};

	// 使用remote打开新窗口
	const openDialog = document.getElementById('openDialog');
	openDialog.addEventListener('click', () => {
		// dialog.showMessageBox(options, (index) => {
		// 	console.log(options);
		// 	console.log(index);
		// });
		console.log(dialog);
	});
	// 打开新窗口
	const openWindow = document.getElementById('openWindow');
	openWindow.addEventListener('click', () => {
		let newWin = new BrowserWindow({
			width: 800,
			height: 800
		});
		newWin.loadURL('https://github.com');
		newWin.on('close', () => {
			newWin = null;
		});
	});
});

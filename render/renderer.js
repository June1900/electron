const { ipcRenderer } = require('electron');
const { dialog, BrowserWindow } = require('electron').remote;
// 解析Excel
const XLSX = require('xlsx');

const deepClone = (source) => {
	if (!source && typeof source !== 'object') {
		throw new Error('error arguments', 'deepClone');
	}
	const targetObj =

			source.constructor === Array ? [] :
			{};

	Object.keys(source).forEach((keys) => {
		if (source[keys] && typeof source[keys] === 'object') {
			targetObj[keys] = deepClone(source[keys]);
		} else {
			targetObj[keys] = source[keys];
		}
	});
	return targetObj;
};
// Excel表头
const isExcelHeader = (value) => {
	const reg = /│序号│/g;
	return reg.test(value);
};
// Excel数据
const isExcelData = (value) => {
	const reg = /^│.*\d+.*│|│/g;
	return reg.test(value);
};
// 是否是Excel标题
const isExcelTitle = (value) => {
	const reg = /.*卡号.*([:\uff1a])(\d+).*/g;
	return reg.test(value);
};

const parseExcel = (value) => {
	let res = [];
	let sheetData = { index: 0, title: '', headers: '', data: [] };
	for (const obj of Object.values(value)) {
		if (typeof obj === 'object') {
			const temp = obj['v'];
			if (isExcelTitle(temp)) {
				if (sheetData['headers'] && sheetData['data']) {
					res[sheetData['index'] - 1] = deepClone(sheetData);
				}
				sheetData['title'] = temp.replace(/\s+/g, '');
				sheetData['index'] = sheetData['index'] + 1;
				sheetData['headers'] = '';
				sheetData['data'] = [];
			} else if (isExcelHeader(temp)) {
				let excelHeaders = temp.split('│');
				excelHeaders.pop();
				excelHeaders.shift();
				sheetData['headers'] = excelHeaders.map((_v) => _v.replace(/\s+/g, ''));
			} else if (isExcelData(temp)) {
				let excelData = temp.split('│');
				excelData.pop();
				excelData.shift();
				// 判断序号列是否有值
				if (excelData[0].replace(/\s+/g, '')) {
					sheetData['data'].push(excelData.map((_v) => _v.replace(/\s+/g, '')));
				} else {
					const prev = sheetData['data'][sheetData['data'].length - 1];
					const p = prev.map((_v, _i) => _v + excelData[_i].replace(/\s+/g, ''));
					sheetData['data'][sheetData['data'].length - 1] = p;
				}
			}
		}
	}
	res[sheetData['index'] - 1] = deepClone(sheetData);
	return res;
};

const workbook = XLSX.readFile('source.xlsx');
// 获取全部sheet页数据
const { Sheets } = workbook;
const excelData = [];
for (const [ key, value ] of Object.entries(Sheets)) {
	excelData.push(...parseExcel(value));
}

const exportSheetData = (value) => {
	const { title = '', headers = [], data = [] } = value;
	const _t = {
		A1: { v: title }
	};
	const _h = headers
		.map((v, i) => Object.assign({}, { v: v, position: String.fromCharCode(65 + i) + 2 }))
		.reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {});

	const _d = data
		.map((v, i) =>
			headers.map((k, j) => Object.assign({}, { v: v[j], position: String.fromCharCode(65 + j) + (i + 3) }))
		)
		.reduce((prev, next) => prev.concat(next))
		.reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {});

	// 合并 title headers  data
	const output = Object.assign({}, _t, _h, _d);
	// 获取所有单元格的位置
	const outputPos = Object.keys(output);
	// 计算出范围
	const ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];
	return Object.assign({}, output, { '!ref': ref });
};

const exportWorkbook = {
	SheetNames: [],
	Sheets: {}
};

// 构建 workbook 对象
excelData.forEach((_v, _i) => {
	exportWorkbook.SheetNames.push(`sheet${_i + 1}`);
	exportWorkbook.Sheets[`sheet${_i + 1}`] = exportSheetData(_v);
});

// 导出Excel
XLSX.writeFile(exportWorkbook, 'result.xlsx');

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

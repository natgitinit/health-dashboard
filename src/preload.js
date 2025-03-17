// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// const { contextBridge, ipcRenderer } = require("electron");

// // Expose protected methods that allow the renderer process to use
// // the ipcRenderer without exposing the entire object
// contextBridge.exposeInMainWorld("api", {
// 	send: (channel, data) => {
// 		// whitelist channels
// 		let validChannels = ["renderer-ready", "request-historical-data"];
// 		if (validChannels.includes(channel)) {
// 			ipcRenderer.send(channel, data);
// 		}
// 	},
// 	receive: (channel, func) => {
// 		let validChannels = ["health-data", "health-data-update"];
// 		if (validChannels.includes(channel)) {
// 			// Deliberately strip event as it includes `sender`
// 			ipcRenderer.on(channel, (event, ...args) => func(...args));
// 		}
// 	},
// });

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
	send: (channel, data) => {
		let validChannels = [
			"renderer-ready",
			"request-historical-data",
			"find-similar-patterns",
		];
		if (validChannels.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
	},
	receive: (channel, func) => {
		let validChannels = [
			"health-data",
			"health-data-update",
			"similar-patterns-result",
		];
		if (validChannels.includes(channel)) {
			ipcRenderer.on(channel, (event, ...args) => func(...args));
		}
	},
});

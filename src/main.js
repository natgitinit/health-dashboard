const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const vectorDB = require("./renderer/data/vector-db");

// Handle creating/removing shortcuts on Windows
if (require("electron-squirrel-startup")) app.quit();

let mainWindow;

if (process.env.NODE_ENV === "development") {
	require("electron-reload")(__dirname);
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	const rendererPath = path.join(__dirname, "renderer", "index.html");
	mainWindow.loadFile(rendererPath);

	if (process.env.NODE_ENV === "development") {
		mainWindow.webContents.openDevTools();
	}
}

// App initialization
app.whenReady().then(async () => {
	createWindow();
	const dbInitialized = await vectorDB.initializeDatabase();
	if (!dbInitialized) {
		console.error(
			"Database initialization failed - data storage will not work"
		);
	}
	setupMockDataGeneration();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Data generation
function setupMockDataGeneration() {
	ipcMain.on("renderer-ready", () => {
		// Send initial data
		const initialData = generateHistoricalData();
		mainWindow.webContents.send("health-data", initialData);

		// Store in database
		initialData.forEach((dataPoint) => vectorDB.storeHealthData(dataPoint));

		// Send updates
		let lastDataPoint = null;
		mockDataInterval = setInterval(() => {
			const dataPoint = generateDataPoint();
			vectorDB.storeHealthData(dataPoint);
			mainWindow.webContents.send("health-data-update", dataPoint);
			lastDataPoint = dataPoint;
		}, 1000);
	});
}

function generateDataPoint() {
	return {
		timestamp: Date.now(),
		hrv: 50 + (Math.random() - 0.5) * 10,
		heart_rate: 75 + (Math.random() - 0.5) * 15,
		temperature: 36.7 + (Math.random() - 0.5) * 0.5,
		blood_oxygen: 98 + (Math.random() - 0.5) * 3,
	};
}

function generateHistoricalData() {
	const data = [];
	const now = Date.now();

	for (let i = 59; i >= 0; i--) {
		data.push({
			timestamp: now - i * 1000,
			hrv: 50 + Math.sin(i / 10) * 5 + (Math.random() - 0.5) * 4,
			heart_rate: 75 + Math.sin(i / 8) * 7 + (Math.random() - 0.5) * 6,
			temperature: 36.7 + Math.sin(i / 30) * 0.3 + (Math.random() - 0.5) * 0.2,
			blood_oxygen: 98 + Math.sin(i / 20) * 1 + (Math.random() - 0.5) * 0.8,
		});
	}

	return data;
}

// Cleanup
let mockDataInterval;
app.on("before-quit", () => {
	if (mockDataInterval) clearInterval(mockDataInterval);
});

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	app.quit();
}

let mainWindow;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	// Load the index.html of the app.
	// mainWindow.loadFile(path.join(__dirname, "renderer/index.html"));
	const rendererPath = path.join(__dirname, "renderer", "index.html");
	console.log("Loading from:", rendererPath);
	mainWindow.loadFile(rendererPath);

	// Open the DevTools in development.
	if (process.env.NODE_ENV === "development") {
		mainWindow.webContents.openDevTools();
	}
};

// This method will be called when Electron has finished initialization.
app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});

	// Generate mock health data for development
	setupMockDataGeneration();
});

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// Mock data generation for development
let mockDataInterval;
function setupMockDataGeneration() {
	// Listen for renderer process ready signal
	ipcMain.on("renderer-ready", () => {
		// Send initial historical data (last 60 seconds)
		const initialData = generateHistoricalData();
		mainWindow.webContents.send("health-data", initialData);

		// Send updates every second
		mockDataInterval = setInterval(() => {
			const dataPoint = generateDataPoint();
			mainWindow.webContents.send("health-data-update", dataPoint);
		}, 1000);
	});
}

// Generate a single data point
function generateDataPoint() {
	return {
		timestamp: Date.now(),
		hrv: 50 + (Math.random() - 0.5) * 10,
		heart_rate: 75 + (Math.random() - 0.5) * 15,
		temperature: 36.7 + (Math.random() - 0.5) * 0.5,
		blood_oxygen: 98 + (Math.random() - 0.5) * 3,
	};
}

// Generate 60 seconds of historical data
function generateHistoricalData() {
	const data = [];
	const now = Date.now();

	for (let i = 59; i >= 0; i--) {
		const timestamp = now - i * 1000;
		data.push({
			timestamp: timestamp,
			hrv: 50 + Math.sin(i / 10) * 5 + (Math.random() - 0.5) * 4,
			heart_rate: 75 + Math.sin(i / 8) * 7 + (Math.random() - 0.5) * 6,
			temperature: 36.7 + Math.sin(i / 30) * 0.3 + (Math.random() - 0.5) * 0.2,
			blood_oxygen: 98 + Math.sin(i / 20) * 1 + (Math.random() - 0.5) * 0.8,
		});
	}

	return data;
}

// Clean up when app is quitting
app.on("before-quit", () => {
	if (mockDataInterval) {
		clearInterval(mockDataInterval);
	}
});

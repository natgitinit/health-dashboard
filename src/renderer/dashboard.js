// Store health data history
const healthData = {
	hrv: [],
	heart_rate: [],
	temperature: [],
	blood_oxygen: [],
};

// Maximum number of data points to keep
const MAX_DATA_POINTS = 60;

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", () => {
	console.log("Dashboard initialized");

	// Tell main process that renderer is ready
	window.api.send("renderer-ready");

	// Listen for health data updates
	window.api.receive("health-data", (dataPoints) => {
		console.log("Received historical data:", dataPoints.length, "points");
		// Initialize with historical data
		dataPoints.forEach((dataPoint) => {
			addDataPoint(dataPoint);
		});
		updateUI();
		initializeCharts();
	});

	window.api.receive("health-data-update", (dataPoint) => {
		console.log("Received data update:", dataPoint);
		addDataPoint(dataPoint);
		updateUI();
		if (window.updateCharts) {
			window.updateCharts(healthData);
		}
		analyzeData();
	});
});

// Add a new data point to history
function addDataPoint(dataPoint) {
	const timestamp = new Date(dataPoint.timestamp);

	Object.keys(healthData).forEach((metric) => {
		if (dataPoint[metric] !== undefined) {
			// Add new data point
			healthData[metric].push({
				value: dataPoint[metric],
				timestamp: timestamp,
			});

			// Remove oldest if we exceed the limit
			if (healthData[metric].length > MAX_DATA_POINTS) {
				healthData[metric].shift();
			}
		}
	});
}

// Update UI with latest values
function updateUI() {
	// Update HRV
	if (healthData.hrv.length > 0) {
		const latestHRV = healthData.hrv[healthData.hrv.length - 1].value;
		const hrvElement = document.getElementById("hrv-value");
		if (hrvElement) {
			hrvElement.textContent = `${latestHRV.toFixed(1)} ms`;
		}

		const hrvValues = healthData.hrv.map((d) => d.value);
		updateStatValue("hrv-avg", average(hrvValues), "ms");
		updateStatValue("hrv-min", Math.min(...hrvValues), "ms");
		updateStatValue("hrv-max", Math.max(...hrvValues), "ms");
	}

	// Update Heart Rate
	if (healthData.heart_rate.length > 0) {
		const latestHR =
			healthData.heart_rate[healthData.heart_rate.length - 1].value;
		updateValue("heart-rate-value", latestHR, "bpm", 0);

		const hrValues = healthData.heart_rate.map((d) => d.value);
		updateStatValue("heart-rate-avg", average(hrValues), "bpm", 0);
		updateStatValue("heart-rate-min", Math.min(...hrValues), "bpm", 0);
		updateStatValue("heart-rate-max", Math.max(...hrValues), "bpm", 0);
	}

	// Update Temperature
	if (healthData.temperature.length > 0) {
		const latestTemp =
			healthData.temperature[healthData.temperature.length - 1].value;
		updateValue("temperature-value", latestTemp, "°C");

		const tempValues = healthData.temperature.map((d) => d.value);
		updateStatValue("temperature-avg", average(tempValues), "°C");
		updateStatValue("temperature-min", Math.min(...tempValues), "°C");
		updateStatValue("temperature-max", Math.max(...tempValues), "°C");
	}

	// Update Blood Oxygen
	if (healthData.blood_oxygen.length > 0) {
		const latestBO =
			healthData.blood_oxygen[healthData.blood_oxygen.length - 1].value;
		updateValue("blood-oxygen-value", latestBO, "%");

		const boValues = healthData.blood_oxygen.map((d) => d.value);
		updateStatValue("blood-oxygen-avg", average(boValues), "%");
		updateStatValue("blood-oxygen-min", Math.min(...boValues), "%");
		updateStatValue("blood-oxygen-max", Math.max(...boValues), "%");
	}
}

// Helper function to update a value element
function updateValue(elementId, value, unit, decimals = 1) {
	const element = document.getElementById(elementId);
	if (element) {
		element.textContent = `${value.toFixed(decimals)} ${unit}`;
	}
}

// Helper function to update a stat value element
function updateStatValue(elementId, value, unit, decimals = 1) {
	const element = document.getElementById(elementId);
	if (element) {
		element.textContent = `${value.toFixed(decimals)} ${unit}`;
	}
}

// Calculate average of an array
function average(arr) {
	return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Simple data analysis to generate insights
function analyzeData() {
	const insightsContainer = document.getElementById("insights-container");
	if (!insightsContainer) return;

	// Clear existing insights periodically
	if (healthData.hrv.length % 10 === 0) {
		insightsContainer.innerHTML = "";
	}

	// Check if we have enough data
	if (healthData.hrv.length < 10) return;

	// Get latest values
	const latestHRV = healthData.hrv[healthData.hrv.length - 1].value;
	const latestHR =
		healthData.heart_rate[healthData.heart_rate.length - 1].value;
	const latestTemp =
		healthData.temperature[healthData.temperature.length - 1].value;
	const latestBO =
		healthData.blood_oxygen[healthData.blood_oxygen.length - 1].value;

	// Simple thresholds for demo purposes
	const insights = [];

	// HRV analysis
	if (latestHRV < 40) {
		insights.push({
			title: "Low HRV Detected",
			description:
				"Your heart rate variability is below optimal levels, which may indicate stress.",
			isAlert: true,
		});
	} else if (latestHRV > 55) {
		insights.push({
			title: "Optimal HRV",
			description:
				"Your heart rate variability is in a healthy range, indicating good recovery.",
			isAlert: false,
		});
	}

	// Heart rate analysis
	if (latestHR > 90) {
		insights.push({
			title: "Elevated Heart Rate",
			description: "Your heart rate is higher than your resting baseline.",
			isAlert: true,
		});
	}

	// Temperature analysis
	if (latestTemp > 37.2) {
		insights.push({
			title: "Elevated Body Temperature",
			description: "Your body temperature is above normal range.",
			isAlert: true,
		});
	}

	// Blood oxygen analysis
	if (latestBO < 95) {
		insights.push({
			title: "Low Blood Oxygen",
			description: "Your blood oxygen saturation is below the optimal range.",
			isAlert: true,
		});
	}

	// Add new insights to the dashboard
	insights.forEach((insight) => {
		// Only add if it doesn't already exist
		const existingInsight = Array.from(insightsContainer.children).find(
			(el) => el.querySelector(".insight-title")?.textContent === insight.title
		);

		if (!existingInsight) {
			const insightCard = document.createElement("div");
			insightCard.className = `insight-card ${insight.isAlert ? "alert" : ""}`;

			const insightTitle = document.createElement("div");
			insightTitle.className = "insight-title";
			insightTitle.textContent = insight.title;

			const insightDescription = document.createElement("div");
			insightDescription.className = "insight-description";
			insightDescription.textContent = insight.description;

			insightCard.appendChild(insightTitle);
			insightCard.appendChild(insightDescription);

			insightsContainer.appendChild(insightCard);
		}
	});
}

function refreshCharts() {
	if (window.updateCharts) {
		window.updateCharts(healthData);
	}
}

// Charts will be initialized and updated by charts.js
window.healthData = healthData;
setTimeout(refreshCharts, 500);

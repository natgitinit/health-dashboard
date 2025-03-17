// Chart.js configuration and setup
let charts = {};

function initializeCharts() {
	Chart.defaults.font.family =
		"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
	Chart.defaults.color = "#7f8c8d";

	// HRV Chart
	charts.hrv = new Chart(
		document.getElementById("hrv-chart").getContext("2d"),
		{
			type: "line",
			data: {
				labels: [],
				datasets: [
					{
						label: "HRV (ms)",
						data: [],
						borderColor: "#3498db",
						backgroundColor: "rgba(52, 152, 219, 0.1)",
						borderWidth: 2,
						tension: 0.3,
						fill: true,
					},
				],
			},
			options: getChartOptions("HRV (ms)"),
		}
	);

	// Heart Rate Chart
	charts.heart_rate = new Chart(
		document.getElementById("heart-rate-chart").getContext("2d"),
		{
			type: "line",
			data: {
				labels: [],
				datasets: [
					{
						label: "Heart Rate (bpm)",
						data: [],
						borderColor: "#e74c3c",
						backgroundColor: "rgba(231, 76, 60, 0.1)",
						borderWidth: 2,
						tension: 0.3,
						fill: true,
					},
				],
			},
			options: getChartOptions("Heart Rate (bpm)"),
		}
	);

	// Temperature Chart
	charts.temperature = new Chart(
		document.getElementById("temperature-chart").getContext("2d"),
		{
			type: "line",
			data: {
				labels: [],
				datasets: [
					{
						label: "Temperature (°C)",
						data: [],
						borderColor: "#f39c12",
						backgroundColor: "rgba(243, 156, 18, 0.1)",
						borderWidth: 2,
						tension: 0.3,
						fill: true,
					},
				],
			},
			options: getChartOptions("Temperature (°C)"),
		}
	);

	// Blood Oxygen Chart
	charts.blood_oxygen = new Chart(
		document.getElementById("blood-oxygen-chart").getContext("2d"),
		{
			type: "line",
			data: {
				labels: [],
				datasets: [
					{
						label: "Blood Oxygen (%)",
						data: [],
						borderColor: "#2ecc71",
						backgroundColor: "rgba(46, 204, 113, 0.1)",
						borderWidth: 2,
						tension: 0.3,
						fill: true,
					},
				],
			},
			options: getChartOptions("Blood Oxygen (%)"),
		}
	);
}

function formatTime(timestamp) {
	const date = new Date(timestamp);
	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getChartOptions(title) {
	return {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				mode: "index",
				intersect: false,
			},
		},
		scales: {
			x: {
				type: "category",
				display: true,
				grid: {
					display: false,
				},
				ticks: {
					maxTicksLimit: 5,
					maxRotation: 0,
				},
			},
			y: {
				display: true,
				grid: {
					color: "rgba(0, 0, 0, 0.05)",
				},
			},
		},
	};
}

function updateCharts(healthData) {
	const timeLabels = healthData.hrv.map((d) => formatTime(d.timestamp));

	Object.keys(charts).forEach((metric) => {
		if (charts[metric] && healthData[metric].length > 0) {
			const values = healthData[metric].map((d) => d.value);

			charts[metric].data.labels = timeLabels;
			charts[metric].data.datasets[0].data = values;
			charts[metric].update();
		}
	});
}

// Initialize charts when DOM is loaded
window.initializeCharts = initializeCharts;
window.updateCharts = updateCharts;

document.addEventListener("DOMContentLoaded", () => {
	console.log("Charts.js: DOM ready, waiting for data");
});

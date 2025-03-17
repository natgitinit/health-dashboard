class HealthChartManager {
	constructor() {
		// Chart configuration for different health metrics
		this.chartConfigs = [
			{
				key: "hrv",
				id: "hrv-chart",
				label: "HRV (ms)",
				borderColor: "#3498db",
				backgroundColor: "rgba(52, 152, 219, 0.1)",
			},
			{
				key: "heart_rate",
				id: "heart-rate-chart",
				label: "Heart Rate (bpm)",
				borderColor: "#e74c3c",
				backgroundColor: "rgba(231, 76, 60, 0.1)",
			},
			{
				key: "temperature",
				id: "temperature-chart",
				label: "Temperature (°C)",
				borderColor: "#f39c12",
				backgroundColor: "rgba(243, 156, 18, 0.1)",
			},
			{
				key: "blood_oxygen",
				id: "blood-oxygen-chart",
				label: "Blood Oxygen (%)",
				borderColor: "#2ecc71",
				backgroundColor: "rgba(46, 204, 113, 0.1)",
			},
		];

		// Stores initialized chart instances
		this.charts = {};
	}

	// Initialize global Chart.js defaults
	initializeChartDefaults() {
		Chart.defaults.font.family =
			"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
		Chart.defaults.color = "#7f8c8d";
	}

	getChartOptions(title) {
		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
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
						maxTicksLimit: 3, // Limit to 3 time labels
						autoSkip: true, // Automatically skip labels if too crowded
						maxRotation: 0, // Keep labels horizontal
						color: "#888", // Lighter text color
						font: {
							size: 10, // Smaller font size
						},
					},
				},
				y: {
					display: true,
					grid: { color: "rgba(0, 0, 0, 0.05)" },
				},
			},
		};
	}

	// Initialize all charts
	initializeCharts() {
		this.initializeChartDefaults();

		this.chartConfigs.forEach((config) => {
			// Ensure the canvas element exists before creating the chart
			const canvas = document.getElementById(config.id);
			if (!canvas) {
				console.warn(`Canvas element for ${config.id} not found`);
				return;
			}

			const ctx = canvas.getContext("2d");
			this.charts[config.key] = new Chart(ctx, {
				type: "line",
				data: {
					labels: [],
					datasets: [
						{
							label: config.label,
							data: [],
							borderColor: config.borderColor,
							backgroundColor: config.backgroundColor,
							borderWidth: 2,
							tension: 0.3,
							fill: true,
						},
					],
				},
				options: this.getChartOptions(config.label),
			});
		});

		console.log("Charts initialized:", Object.keys(this.charts));
	}

	// Format timestamp to time string
	formatTime(timestamp) {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	// Update charts with new health data
	updateCharts(healthData) {
		// Ensure healthData is passed correctly
		if (!healthData) {
			console.error("No health data provided to updateCharts");
			return;
		}

		// Ensure we have HRV data for time labels
		if (!healthData.hrv || healthData.hrv.length === 0) {
			console.warn("No HRV data available for time labels");
			return;
		}

		const timeLabels = healthData.hrv.map((d) => this.formatTime(d.timestamp));

		Object.keys(this.charts).forEach((metric) => {
			const chart = this.charts[metric];
			const metricData = healthData[metric];

			if (chart && metricData && metricData.length > 0) {
				const values = metricData.map((d) => d.value);

				chart.data.labels = timeLabels;
				chart.data.datasets[0].data = values;
				chart.update();
			} else {
				console.warn(`No data for metric: ${metric}`);
			}
		});

		console.log("Charts updated");
	}
}

// Initialize the chart manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	const healthChartManager = new HealthChartManager();

	// Expose methods globally if needed
	window.initializeCharts = () => healthChartManager.initializeCharts();
	window.updateCharts = (healthData) =>
		healthChartManager.updateCharts(healthData);

	console.log("Charts.js: DOM ready, waiting for data");
});

const moment = require("moment");

// Initial ranges for each vital
const vitalRanges = {
	hrv: { min: 40, max: 60, current: 50 },
	heart_rate: { min: 60, max: 100, current: 75 },
	temperature: { min: 36.1, max: 37.2, current: 36.7 },
	blood_oxygen: { min: 95, max: 100, current: 98 },
	// Add more vitals as needed
};

// Generate realistic variations for each vital
function getNextValue(vital, range) {
	// How much the value can change per update
	const volatility = {
		hrv: 2,
		heart_rate: 3,
		temperature: 0.1,
		blood_oxygen: 0.5,
	};

	// Generate a random change
	const change = (Math.random() - 0.5) * 2 * volatility[vital];

	// Calculate new value within range
	let newValue = range.current + change;
	newValue = Math.max(range.min, Math.min(range.max, newValue));

	// Update current value
	vitalRanges[vital].current = newValue;

	return newValue;
}

// Historical data for initial load (last 60 data points)
function getInitialData() {
	const dataPoints = [];
	const now = moment();

	for (let i = 59; i >= 0; i--) {
		const timestamp = now.clone().subtract(i, "seconds");

		dataPoints.push({
			timestamp: timestamp.valueOf(),
			hrv: 50 + Math.sin(i / 10) * 5 + (Math.random() - 0.5) * 4,
			heart_rate: 75 + Math.sin(i / 8) * 7 + (Math.random() - 0.5) * 6,
			temperature: 36.7 + Math.sin(i / 30) * 0.3 + (Math.random() - 0.5) * 0.2,
			blood_oxygen: 98 + Math.sin(i / 20) * 1 + (Math.random() - 0.5) * 0.8,
		});
	}

	return dataPoints;
}

// Get next data point
function getNextDataPoint() {
	return {
		timestamp: Date.now(),
		hrv: getNextValue("hrv", vitalRanges.hrv),
		heart_rate: getNextValue("heart_rate", vitalRanges.heart_rate),
		temperature: getNextValue("temperature", vitalRanges.temperature),
		blood_oxygen: getNextValue("blood_oxygen", vitalRanges.blood_oxygen),
	};
}

module.exports = {
	getInitialData,
	getNextDataPoint,
};

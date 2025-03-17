// src/data/health-embeddings.js
function createSimpleEmbedding(healthData) {
	// Normalize the health metrics to create a basic embedding
	// This is a placeholder - you'll replace with TensorFlow model output
	const normalizedHRV = (healthData.hrv - 20) / 80; // Assuming HRV range ~20-100
	const normalizedHR = (healthData.heart_rate - 40) / 160; // Assuming HR range ~40-200
	const normalizedTemp = (healthData.temperature - 35) / 5; // Assuming temp range ~35-40°C
	const normalizedBO = (healthData.blood_oxygen - 80) / 20; // Assuming BO range ~80-100%

	// Create features and patterns from the data
	const hrvTrendUp = healthData.hrv_trend > 0 ? 1 : 0;
	const hrvTrendDown = healthData.hrv_trend < 0 ? 1 : 0;
	const hrTrendUp = healthData.hr_trend > 0 ? 1 : 0;
	const hrTrendDown = healthData.hr_trend < 0 ? 1 : 0;

	// Time of day encoding (using sin/cos for cyclical time feature)
	const hour = new Date(healthData.timestamp).getHours();
	const timeOfDaySin = Math.sin((2 * Math.PI * hour) / 24);
	const timeOfDayCos = Math.cos((2 * Math.PI * hour) / 24);

	// Create a 32-dimension vector with pattern data
	// Most dimensions are zeros for now (placeholders for more features)
	return [
		normalizedHRV,
		normalizedHR,
		normalizedTemp,
		normalizedBO,
		hrvTrendUp,
		hrvTrendDown,
		hrTrendUp,
		hrTrendDown,
		timeOfDaySin,
		timeOfDayCos,
		// Fill remaining dimensions with zeros for now
		...Array(22).fill(0),
	];
}

module.exports = {
	createSimpleEmbedding,
};

const { QdrantClient } = require("@qdrant/js-client-rest");
const { createSimpleEmbedding } = require("./health-embeddings");
const { v4: uuidv4 } = require("uuid");

const client = new QdrantClient({ url: "http://localhost:6333" });
const collectionName = "health_data_test";

async function initializeDatabase() {
	try {
		// Check if collection exists
		const response = await client.getCollections();
		console.log("Available collections:", response);

		const exists =
			response.collections &&
			response.collections.some((c) => c.name === collectionName);

		if (!exists) {
			// Create collection if it doesn't exist
			console.log(`Creating collection: ${collectionName}`);

			await client.createCollection(collectionName, {
				vectors: {
					size: 32, // Using the 32D vector from health-embeddings
					distance: "Cosine",
				},
			});
			console.log("Vector database initialized");
		} else {
			console.log("Vector database already exists");
		}
		return true;
	} catch (error) {
		console.error("Failed to initialize database:", error);
		return false;
	}
}

async function storeHealthData(dataPoint) {
	// Add trend information needed by the embedding function
	if (!dataPoint.hrv_trend) dataPoint.hrv_trend = 0;
	if (!dataPoint.hr_trend) dataPoint.hr_trend = 0;

	// Create embedding using the advanced function
	const vector = createSimpleEmbedding(dataPoint);

	try {
		// First, try to create the collection without checking if it exists
		// Qdrant will return an error if it already exists, which we can safely ignore
		try {
			await client.createCollection(collectionName, {
				vectors: {
					size: 32,
					distance: "Cosine",
				},
			});
			console.log("Collection created successfully");
		} catch (createError) {
			// Ignore errors about collection already existing
			console.log("Collection may already exist, proceeding with data storage");
		}
		const id = uuidv4();

		// Now attempt to store the data
		await client.upsert(collectionName, {
			points: [
				{
					id: id,
					vector: vector,
					payload: {
						timestamp: dataPoint.timestamp.toString(),
						hrv: dataPoint.hrv,
						heart_rate: dataPoint.heart_rate,
						temperature: dataPoint.temperature,
						blood_oxygen: dataPoint.blood_oxygen,
						hrv_trend: dataPoint.hrv_trend,
						hr_trend: dataPoint.hr_trend,
					},
				},
			],
		});
		return true;
	} catch (error) {
		console.error("Failed to store vector:", error);
		console.error("Error details:", error.data?.status?.error || error.message);
		return false;
	}
}

// Add a simple search function for similar patterns
async function findSimilarPatterns(dataPoint, limit = 5) {
	const vector = createSimpleEmbedding(dataPoint);

	try {
		const results = await client.search(collectionName, {
			vector: vector,
			limit: limit,
			with_payload: true,
		});
		return results.result;
	} catch (error) {
		console.error("Failed to search for similar patterns:", error);
		return [];
	}
}

module.exports = {
	initializeDatabase,
	storeHealthData,
	findSimilarPatterns,
};

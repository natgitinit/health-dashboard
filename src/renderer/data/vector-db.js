const { QdrantClient } = require("@qdrant/js-client-rest");

class HealthVectorDB {
	constructor() {
		// Default to localhost for development
		this.client = new QdrantClient({ url: "http://localhost:6333" });
		this.collectionName = "health_vectors";
		this.initialized = false;
	}

	async initialize() {
		try {
			// Check if collection exists, create if not
			const collections = await this.client.getCollections();
			const collectionExists = collections.collections.some(
				(c) => c.name === this.collectionName
			);

			if (!collectionExists) {
				await this.createCollection();
			}

			this.initialized = true;
			console.log("Vector database initialized successfully");
			return true;
		} catch (error) {
			console.error("Failed to initialize vector database:", error);
			return false;
		}
	}

	async createCollection() {
		return await this.client.createCollection(this.collectionName, {
			vectors: {
				size: 32, // Dimension of our health vector embeddings
				distance: "Cosine",
			},
			optimizers_config: {
				default_segment_number: 2, // Smaller for edge deployment
			},
		});
	}

	async storeHealthVector(dataPoint, embedding) {
		if (!this.initialized) {
			await this.initialize();
		}

		try {
			// Store the health data point with its vector embedding
			await this.client.upsert(this.collectionName, {
				points: [
					{
						id: dataPoint.timestamp.toString(),
						vector: embedding,
						payload: {
							timestamp: dataPoint.timestamp,
							hrv: dataPoint.hrv,
							heart_rate: dataPoint.heart_rate,
							temperature: dataPoint.temperature,
							blood_oxygen: dataPoint.blood_oxygen,
						},
					},
				],
			});

			return true;
		} catch (error) {
			console.error("Failed to store health vector:", error);
			return false;
		}
	}

	async findSimilarPatterns(embedding, limit = 5) {
		if (!this.initialized) {
			await this.initialize();
		}

		try {
			// Search for similar health patterns
			const results = await this.client.search(this.collectionName, {
				vector: embedding,
				limit: limit,
				with_payload: true,
			});

			return results;
		} catch (error) {
			console.error("Failed to search for similar patterns:", error);
			return [];
		}
	}

	async getTimeRangeData(startTime, endTime) {
		if (!this.initialized) {
			await this.initialize();
		}

		try {
			// Search for data points within a time range
			const results = await this.client.scroll(this.collectionName, {
				filter: {
					must: [
						{
							range: {
								timestamp: {
									gte: startTime,
									lte: endTime,
								},
							},
						},
					],
				},
				with_payload: true,
				with_vectors: true,
				limit: 1000, // Adjust as needed
			});

			return results.points;
		} catch (error) {
			console.error("Failed to get time range data:", error);
			return [];
		}
	}
}

module.exports = new HealthVectorDB();

const { QdrantClient } = require("@qdrant/js-client-rest");
const { createSimpleEmbedding } = require("./health-embeddings");

const client = new QdrantClient({ url: "http://localhost:6333" });
const collectionName = "health_vectors";

async function initializeDatabase() {
  try {
    // Check if collection exists
    const response = await client.getCollections();
    const exists = response.result.collections.some(
      (c) => c.name === collectionName
    );

    if (!exists) {
      // Create collection if it doesn't exist
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
    await client.upsert(collectionName, {
      points: [
        {
          id: dataPoint.timestamp.toString(),
          vector: vector,
          payload: {
            timestamp: dataPoint.timestamp,
            hrv: dataPoint.hrv,
            heart_rate: dataPoint.heart_rate,
            temperature: dataPoint.temperature,
            blood_oxygen: dataPoint.blood_oxygen,
            // Store trend information
            hrv_trend: dataPoint.hrv_trend,
            hr_trend: dataPoint.hr_trend
          },
        },
      ],
    });
    return true;
  } catch (error) {
    console.error("Failed to store vector:", error);
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
      with_payload: true
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
  findSimilarPatterns
};
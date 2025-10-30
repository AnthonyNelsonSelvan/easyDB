import { MongoClient } from "mongodb";

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
let mongoClient = null;

async function connectToMongo() {
    if (mongoClient && mongoClient.topology && mongoClient.topology.isConnected()) {
        console.log('MongoDB client is already connected.');
        return mongoClient;
    }

    try {
        console.log(`Attempting connection to MongoDB at ${mongoUrl}...`);
        mongoClient = new MongoClient(mongoUrl, {
            useUnifiedTopology: true,
        });

        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Cluster.');
        return mongoClient;

    } catch (err) {
        console.error('Failed to connect to MongoDB on startup:', err);
        process.exit(1);
    }
}

function getMongoClient() {
    if (!mongoClient || !mongoClient.topology || !mongoClient.topology.isConnected()) {
        console.error('MongoDB client requested but is not connected.');
        throw new Error('Database service unavailable. Connection not established.');
    }
    return mongoClient;
}

export { connectToMongo, getMongoClient }
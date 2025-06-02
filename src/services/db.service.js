import { MongoClient, ServerApiVersion } from 'mongodb';
import config from '../config/index.js';
import logger from '../config/logger.js';

const client = new MongoClient(config.mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function connectDB() {
  try {
    await client.connect();
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    throw err;
  }
}

export async function closeDB() {
  try {
    await client.close();
    logger.info('MongoDB connection closed');
  } catch (err) {
    logger.error('Error closing MongoDB:', err);
    throw err;
  }
}

export { client };
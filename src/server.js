import { createServer } from 'http';
import { connectDB, closeDB } from './services/db.service.js';
import app from './app.js';
import config from './config/index.js';
import logger from './config/logger.js';

const server = createServer(app);

async function startServer() {
  try {
    await connectDB();
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down server...');
  await closeDB();
  server.close(() => {
    logger.info('Server shut down');
    process.exit(0);
  });
});
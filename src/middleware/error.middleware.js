import logger from '../config/logger.js';

const errorMiddleware = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
};

export default errorMiddleware;
require('dotenv').config();
const app = require('./app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

/**
 * Start the Express HTTP server
 */
const startServer = async () => {
  try {
    // If there are any asynchronous initializations (e.g. database connections), 
    // we would await them here before starting the listener.
    
    app.listen(PORT, () => {
      logger.info(`Water Supplier API server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    logger.error('Fatal error during server startup:', error);
    process.exit(1);
  }
};

startServer();

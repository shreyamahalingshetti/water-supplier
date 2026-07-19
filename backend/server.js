require('dotenv').config();
const app = require('./app');
const logger = require('./src/utils/logger');
const recurringOrderService = require('./src/services/recurringOrderService');

const PORT = process.env.PORT || 5000;
const RECURRING_ORDER_SCAN_INTERVAL_MS = 60 * 60 * 1000;

const processDueRecurringOrders = async () => {
  try {
    const results = await recurringOrderService.processRecurringOrders();
    const successfulRuns = results.filter(result => result.success).length;

    if (successfulRuns > 0) {
      logger.info(`Recurring order processor completed with ${successfulRuns} successful update(s)`);
    }
  } catch (error) {
    logger.error('Recurring order processor failed:', error);
  }
};

/**
 * Start the Express HTTP server
 */
const startServer = async () => {
  try {
    // If there are any asynchronous initializations (e.g. database connections), 
    // we would await them here before starting the listener.
    
    app.listen(PORT, () => {
      logger.info(`Water Supplier API server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      processDueRecurringOrders();
      setInterval(processDueRecurringOrders, RECURRING_ORDER_SCAN_INTERVAL_MS);
    });
  } catch (error) {
    logger.error('Fatal error during server startup:', error);
    process.exit(1);
  }
};

startServer();

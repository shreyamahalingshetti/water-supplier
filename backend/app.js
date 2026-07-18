const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./src/utils/logger');
const { sendSuccess, sendError } = require('./src/utils/response');

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const recurringOrderRoutes = require('./src/routes/recurringOrderRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const disruptionRoutes = require('./src/routes/disruptionRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

// Security Headers
app.use(helmet());


// CORS Setup using the CLIENT_URL environment variable
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  return sendSuccess(res, 'Water Supplier API Running');
});

// Route Registrations
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recurring-orders', recurringOrderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/disruptions', disruptionRoutes);
app.use('/api/users', userRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled exception caught by global handler:', err);
  
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}
  );
});

module.exports = app;

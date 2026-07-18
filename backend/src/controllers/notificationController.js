const notificationService = require('../services/notificationService');
const Notification = require('../models/notificationModel');
const { sendSuccess, sendError } = require('../utils/response');
const { uuidToBigInt } = require('../utils/uuidHelper');

/**
 * Notification Controller
 */
const notificationController = {
  /**
   * Send a disruption broadcast message to multiple customer phone numbers (Supplier only)
   */
  broadcast: async (req, res, next) => {
    try {
      // Role verification: check if authenticated user is a supplier (email authenticated)
      if (!req.user || !req.user.email) {
        return sendError(res, 'Access denied. Supplier permissions required to broadcast notifications.', 403);
      }

      const { customers, message } = req.body;
      if (!customers || !message) {
        return sendError(res, 'Customers array and message body are required', 400);
      }

      const results = await notificationService.sendDisruptionBroadcast(customers, message);
      
      return sendSuccess(res, 'Broadcast completed successfully', results);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve all notification logs in the system (Supplier only)
   */
  getAll: async (req, res, next) => {
    try {
      // Role verification: check if authenticated user is a supplier (email authenticated)
      if (!req.user || !req.user.email) {
        return sendError(res, 'Access denied. Supplier permissions required to view notification logs.', 403);
      }

      const logs = await Notification.findAll();

      return sendSuccess(res, 'All notification logs retrieved successfully', logs);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve notification history for a specific customer ID (Customer / Supplier)
   */
  getByCustomer: async (req, res, next) => {
    try {
      const customerId = uuidToBigInt(req.params.customerId);

      // Access verification: customers can only view their own logs, suppliers can view any customer logs
      const isSupplier = req.user && req.user.email;
      if (!isSupplier && req.user.id !== customerId) {
        return sendError(res, 'Access denied. You can only view your own notification history.', 403);
      }

      const logs = await notificationService.getCustomerNotifications(customerId);

      return sendSuccess(res, 'Customer notifications retrieved successfully', logs);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = notificationController;

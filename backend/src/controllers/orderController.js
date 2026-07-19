const orderService = require('../services/orderService');
const recurringOrderService = require('../services/recurringOrderService');
const { sendSuccess } = require('../utils/response');
const { uuidToBigInt } = require('../utils/uuidHelper');

/**
 * Order Controller
 */
const orderController = {
  /**
   * Create order handler (Customer)
   */
  create: async (req, res, next) => {
    try {
      // Use customer_id from JWT payload if authenticated, otherwise fallback to request body
      const customerId = req.user ? req.user.id : req.body.customer_id;

      const orderData = {
        ...req.body,
        customer_id: customerId
      };

      const order = await orderService.createOrder(orderData);
      
      return sendSuccess(res, 'Order created successfully', order, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve all orders matching filter options (Supplier)
   */
  getAll: async (req, res, next) => {
    try {
      const { date, area, status, from, to } = req.query;
      const orders = await orderService.getAllOrders({ date, area, status, from, to });
      
      return sendSuccess(res, 'Orders retrieved successfully', orders);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve single order by ID
   */
  getById: async (req, res, next) => {
    try {
      const id = uuidToBigInt(req.params.id);
      const order = await orderService.getOrderById(id);
      
      return sendSuccess(res, 'Order retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve all orders for a customer ID (Customer/Supplier)
   */
  getByCustomer: async (req, res, next) => {
    try {
      const customerId = uuidToBigInt(req.params.customerId);
      const orders = await orderService.getCustomerOrders(customerId);
      
      return sendSuccess(res, 'Customer orders retrieved successfully', orders);
    } catch (error) {
      next(error);
    }
  },

  getToday: async (req, res, next) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const orders = await orderService.getAllOrders({ date: today });
      
      return sendSuccess(res, "Today's orders retrieved successfully", orders);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update the status of an order (Supplier)
   */
  updateStatus: async (req, res, next) => {
    try {
      const id = uuidToBigInt(req.params.id);
      const { status } = req.body;
      
      const updatedOrder = await orderService.updateOrderStatus(id, status);

      if ((status || '').toLowerCase() === 'delivered') {
        recurringOrderService.processRecurringOrders().catch((error) => {
          console.error('Failed to process recurring orders after delivery update:', error);
        });
      }
      
      return sendSuccess(res, 'Order status updated successfully', updatedOrder);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete an order by ID (Customer/Supplier)
   */
  delete: async (req, res, next) => {
    try {
      const id = uuidToBigInt(req.params.id);
      const deletedOrder = await orderService.deleteOrder(id);
      
      return sendSuccess(res, 'Order deleted successfully', deletedOrder);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = orderController;

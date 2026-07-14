const orderService = require('../services/orderService');
const { sendSuccess } = require('../utils/response');

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
      const { date, area, status } = req.query;
      const orders = await orderService.getAllOrders({ date, area, status });
      
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
      const { id } = req.params;
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
      const { customerId } = req.params;
      const orders = await orderService.getCustomerOrders(customerId);
      
      return sendSuccess(res, 'Customer orders retrieved successfully', orders);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve today's orders grouped by area (Supplier Dashboard)
   */
  getToday: async (req, res, next) => {
    try {
      const groupedOrders = await orderService.getTodayOrdersByArea();
      
      return sendSuccess(res, "Today's orders grouped by area retrieved successfully", groupedOrders);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update the status of an order (Supplier)
   */
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedOrder = await orderService.updateOrderStatus(id, status);
      
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
      const { id } = req.params;
      const deletedOrder = await orderService.deleteOrder(id);
      
      return sendSuccess(res, 'Order deleted successfully', deletedOrder);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = orderController;

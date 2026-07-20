const Order = require('../models/orderModel');

/**
 * Order Service
 */
const orderService = {
  /**
   * Validate and create a new order
   */
  createOrder: async (data) => {
    if (!data.delivery_date) {
      const err = new Error('Delivery date is required');
      err.statusCode = 400;
      throw err;
    }

    const deliveryDate = new Date(data.delivery_date);
    if (isNaN(deliveryDate.getTime())) {
      const err = new Error('Invalid delivery date format');
      err.statusCode = 400;
      throw err;
    }

    // Normalizing dates in local timezone to compare only year/month/day
    const offsetMs = new Date().getTimezoneOffset() * 60 * 1000;
    
    const localToday = new Date(Date.now() - offsetMs);
    const todayStr = localToday.toISOString().split('T')[0];

    const localDelivery = new Date(deliveryDate.getTime() - offsetMs);
    const deliveryStr = localDelivery.toISOString().split('T')[0];

    // Business rule: Delivery must be tomorrow or later
    if (deliveryStr <= todayStr) {
      const err = new Error('Delivery date must be at least tomorrow (no same-day or past bookings)');
      err.statusCode = 400;
      throw err;
    }

    // Ensure status is valid if specified
    if (data.status && !['pending', 'delivered', 'cancelled'].includes(data.status)) {
      const err = new Error('Invalid order status. Status must be pending, delivered, or cancelled');
      err.statusCode = 400;
      throw err;
    }

    return await Order.create(data);
  },

  /**
   * Fetch all orders by applying filters
   */
  getAllOrders: async (filters = {}) => {
    return await Order.findAll(filters);
  },

  /**
   * Fetch order by ID, throw 404 if missing
   */
  getOrderById: async (id) => {
    const order = await Order.findById(id);
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }
    return order;
  },

  /**
   * Fetch all orders for a customer ID
   */
  getCustomerOrders: async (customerId) => {
    return await Order.findByCustomer(customerId);
  },

  /**
   * Fetch today's orders grouped by area
   */
  getTodayOrdersByArea: async () => {
    return await Order.findTodayByArea();
  },

  /**
   * Validate and update status of an order
   */
  updateOrderStatus: async (id, status) => {
    if (!['pending', 'delivered', 'cancelled'].includes(status)) {
      const err = new Error('Invalid status. Status must be pending, delivered, or cancelled');
      err.statusCode = 400;
      throw err;
    }

    // Check if order exists
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    return await Order.updateStatus(id, status);
  },

  /**
   * Validate and update payment status of an order
   */
  updatePaymentStatus: async (id, paymentStatus) => {
    if (!['paid', 'unpaid', 'pending'].includes(paymentStatus)) {
      const err = new Error('Invalid payment status. Status must be paid, unpaid, or pending');
      err.statusCode = 400;
      throw err;
    }

    return await Order.updatePaymentStatus(id, paymentStatus);
  },

  /**
   * Delete an order by ID
   */
  deleteOrder: async (id) => {
    // Check if order exists
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    return await Order.delete(id);
  }
};

module.exports = orderService;

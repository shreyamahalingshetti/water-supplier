const recurringOrderService = require('../services/recurringOrderService');
const { sendSuccess } = require('../utils/response');
const { uuidToBigInt } = require('../utils/uuidHelper');

/**
 * RecurringOrder Controller
 */
const recurringOrderController = {
  /**
   * Create recurring order handler (Customer)
   */
  create: async (req, res, next) => {
    try {
      // Use customer_id from authenticated token payload, otherwise fallback to request body
      const customerId = req.user ? req.user.id : req.body.customer_id;

      const data = {
        ...req.body,
        customer_id: customerId
      };

      const recurringOrder = await recurringOrderService.createRecurringOrder(data);
      
      return sendSuccess(res, 'Recurring order created successfully', recurringOrder, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve all recurring orders (Supplier)
   */
  getAll: async (req, res, next) => {
    try {
      const recurringOrders = await recurringOrderService.getAllRecurringOrders();
      
      return sendSuccess(res, 'All recurring orders retrieved successfully', recurringOrders);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve all recurring orders for a customer ID (Customer/Supplier)
   */
  getByCustomer: async (req, res, next) => {
    try {
      const customerId = uuidToBigInt(req.params.customerId);
      const recurringOrders = await recurringOrderService.getCustomerRecurringOrders(customerId);
      
      return sendSuccess(res, 'Customer recurring orders retrieved successfully', recurringOrders);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve single recurring order details
   */
  getById: async (req, res, next) => {
    try {
      const id = uuidToBigInt(req.params.id);
      const recurringOrder = await recurringOrderService.getRecurringOrderById(id);
      
      return sendSuccess(res, 'Recurring order retrieved successfully', recurringOrder);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Pause a recurring order (Customer)
   */
  pause: async (req, res, next) => {
    try {
      const id = uuidToBigInt(req.params.id);
      const pausedOrder = await recurringOrderService.pauseRecurringOrder(id);
      
      return sendSuccess(res, 'Recurring order paused successfully', pausedOrder);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Resume a paused recurring order (Customer)
   */
  resume: async (req, res, next) => {
    try {
      const id = uuidToBigInt(req.params.id);
      const resumedOrder = await recurringOrderService.resumeRecurringOrder(id);
      
      return sendSuccess(res, 'Recurring order resumed successfully', resumedOrder);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a recurring order (Customer/Supplier)
   */
  delete: async (req, res, next) => {
    try {
      const id = uuidToBigInt(req.params.id);
      const deletedOrder = await recurringOrderService.deleteRecurringOrder(id);
      
      return sendSuccess(res, 'Recurring order deleted successfully', deletedOrder);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = recurringOrderController;

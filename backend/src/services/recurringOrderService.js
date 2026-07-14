const RecurringOrder = require('../models/recurringOrderModel');
const Order = require('../models/orderModel');
const { supabase } = require('../config/supabase');

/**
 * Recurring Order Service
 */
const recurringOrderService = {
  /**
   * Validate and create a new recurring order subscription
   */
  createRecurringOrder: async (data) => {
    if (!data.frequency_days || data.frequency_days <= 0) {
      const err = new Error('Frequency days must be greater than 0');
      err.statusCode = 400;
      throw err;
    }

    // Tomorrow's date calculation in local timezone
    const offsetMs = new Date().getTimezoneOffset() * 60 * 1000;
    const localTomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000 - offsetMs);
    const tomorrowStr = localTomorrow.toISOString().split('T')[0];

    const recurringOrderData = {
      ...data,
      next_delivery: tomorrowStr,
      is_active: true
    };

    return await RecurringOrder.create(recurringOrderData);
  },

  /**
   * Fetch all recurring orders for a customer ID
   */
  getCustomerRecurringOrders: async (customerId) => {
    return await RecurringOrder.findByCustomer(customerId);
  },

  /**
   * Fetch all recurring orders across the system (Supplier View)
   */
  getAllRecurringOrders: async () => {
    return await RecurringOrder.findAll();
  },

  /**
   * Fetch a single recurring order by ID, throw 404 if missing
   */
  getRecurringOrderById: async (id) => {
    const recurringOrder = await RecurringOrder.findById(id);
    if (!recurringOrder) {
      const err = new Error('Recurring order not found');
      err.statusCode = 404;
      throw err;
    }
    return recurringOrder;
  },

  /**
   * Pause a recurring order (is_active = false)
   */
  pauseRecurringOrder: async (id) => {
    const existing = await RecurringOrder.findById(id);
    if (!existing) {
      const err = new Error('Recurring order not found');
      err.statusCode = 404;
      throw err;
    }
    return await RecurringOrder.toggleActive(id, false);
  },

  /**
   * Resume a recurring order (is_active = true)
   */
  resumeRecurringOrder: async (id) => {
    const existing = await RecurringOrder.findById(id);
    if (!existing) {
      const err = new Error('Recurring order not found');
      err.statusCode = 404;
      throw err;
    }
    return await RecurringOrder.toggleActive(id, true);
  },

  /**
   * Delete a recurring order config
   */
  deleteRecurringOrder: async (id) => {
    const existing = await RecurringOrder.findById(id);
    if (!existing) {
      const err = new Error('Recurring order not found');
      err.statusCode = 404;
      throw err;
    }
    return await RecurringOrder.delete(id);
  },

  /**
   * Batch process active due recurring orders.
   * Creates normal orders in the 'orders' table and increments the subscription next_delivery date.
   */
  processRecurringOrders: async () => {
    const offsetMs = new Date().getTimezoneOffset() * 60 * 1000;
    const localToday = new Date(Date.now() - offsetMs);
    const todayStr = localToday.toISOString().split('T')[0];

    // Fetch active recurring orders that are due today or in the past
    const { data: dueOrders, error } = await supabase
      .from('recurring_orders')
      .select('*')
      .eq('is_active', true)
      .lte('next_delivery', todayStr);

    if (error) {
      throw error;
    }

    const results = [];

    for (const recOrder of dueOrders) {
      try {
        // 1. Create corresponding regular order record in orders table
        const createdOrder = await Order.create({
          customer_id: recOrder.customer_id,
          delivery_date: recOrder.next_delivery, // Deliver on scheduled due date
          area: recOrder.area,
          status: 'pending',
          quantity: recOrder.quantity,
          address: recOrder.address
        });

        // 2. Calculate next delivery date by adding frequency_days (UTC timezone-safe calculation)
        const currentNextDelivery = new Date(recOrder.next_delivery);
        currentNextDelivery.setUTCDate(currentNextDelivery.getUTCDate() + recOrder.frequency_days);
        const newNextDeliveryStr = currentNextDelivery.toISOString().split('T')[0];

        // 3. Update the recurring order next_delivery field
        await RecurringOrder.updateNextDelivery(recOrder.id, newNextDeliveryStr);

        results.push({
          recurringOrderId: recOrder.id,
          success: true,
          createdOrderId: createdOrder.id,
          newNextDelivery: newNextDeliveryStr
        });
      } catch (err) {
        results.push({
          recurringOrderId: recOrder.id,
          success: false,
          error: err.message
        });
      }
    }

    return results;
  }
};

module.exports = recurringOrderService;

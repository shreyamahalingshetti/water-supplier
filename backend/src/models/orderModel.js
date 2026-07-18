const { supabaseAdmin: supabase } = require('../config/supabase');

/**
 * Order Model interacting with Supabase PostgreSQL 'orders' table
 */
const Order = {
  /**
   * Create a new order record
   */
  create: async (data) => {
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_id: data.customer_id,
        delivery_date: data.delivery_date,
        time_slot: data.time_slot,
        area: data.area,
        status: data.status || 'pending',
        quantity: data.quantity,
        address: data.address,
        is_recurring: data.is_recurring !== undefined ? data.is_recurring : false,
        recurring_days: data.recurring_days !== undefined ? data.recurring_days : 0,
        can_size: data.can_size
      })
      .select()
      .single();




    if (error) {
      throw error;
    }

    return order;
  },

  /**
   * Get all orders with optional filter options
   */
  findAll: async (filters = {}) => {
    let query = supabase.from('orders').select('*, users(name)');

    if (filters.date) {
      query = query.eq('delivery_date', filters.date);
    }
    if (filters.area) {
      query = query.eq('area', filters.area);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Sort by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data: orders, error } = await query;

    if (error) {
      throw error;
    }

    return orders.map(o => ({
      ...o,
      customer: o.users?.name || '—'
    }));
  },

  /**
   * Find single order record by ID
   */
  findById: async (id) => {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return order;
  },

  /**
   * Find all orders belonging to a customer
   */
  findByCustomer: async (customerId) => {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return orders;
  },

  /**
   * Find today's orders and group them by area
   */
  findTodayByArea: async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('delivery_date', today);

    if (error) {
      throw error;
    }

    // Group the retrieved orders by their area field
    const grouped = orders.reduce((acc, order) => {
      const area = order.area || 'unspecified';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(order);
      return acc;
    }, {});

    return grouped;
  },

  /**
   * Update the status field of an order
   */
  updateStatus: async (id, status) => {
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return order;
  },

  /**
   * Delete an order record by ID
   */
  delete: async (id) => {
    const { data: order, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return order;
  }
};

module.exports = Order;

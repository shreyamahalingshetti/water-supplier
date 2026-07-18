const { supabaseAdmin: supabase } = require('../config/supabase');

/**
 * RecurringOrder Model interacting with Supabase PostgreSQL 'recurring_orders' table
 */
const RecurringOrder = {
  /**
   * Create a new recurring order configuration
   */
  create: async (data) => {
    const { data: recurringOrder, error } = await supabase
      .from('recurring_orders')
      .insert({
        customer_id: data.customer_id,
        frequency_days: data.frequency_days,
        next_delivery: data.next_delivery,
        is_active: data.is_active !== undefined ? data.is_active : true,
        area: data.area,
        quantity: data.quantity,
        address: data.address
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return recurringOrder;
  },

  /**
   * Fetch all recurring orders belonging to a customer
   */
  findByCustomer: async (customerId) => {
    const { data: recurringOrders, error } = await supabase
      .from('recurring_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return recurringOrders;
  },

  /**
   * Fetch all recurring orders across the system (Supplier View)
   */
  findAll: async () => {
    const { data: recurringOrders, error } = await supabase
      .from('recurring_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return recurringOrders;
  },

  /**
   * Fetch a single recurring order record by ID
   */
  findById: async (id) => {
    const { data: recurringOrder, error } = await supabase
      .from('recurring_orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return recurringOrder;
  },

  /**
   * Update the calculated next delivery date
   */
  updateNextDelivery: async (id, nextDate) => {
    const { data: recurringOrder, error } = await supabase
      .from('recurring_orders')
      .update({ next_delivery: nextDate })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return recurringOrder;
  },

  /**
   * Pause or resume the recurring subscription active state
   */
  toggleActive: async (id, isActive) => {
    const { data: recurringOrder, error } = await supabase
      .from('recurring_orders')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return recurringOrder;
  },

  /**
   * Delete a recurring order record
   */
  delete: async (id) => {
    const { data: recurringOrder, error } = await supabase
      .from('recurring_orders')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return recurringOrder;
  }
};

module.exports = RecurringOrder;

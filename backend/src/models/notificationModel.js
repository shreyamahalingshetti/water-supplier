const { supabaseAdmin: supabase } = require('../config/supabase');

/**
 * Notification Model interacting with Supabase PostgreSQL 'notifications' table
 */
const Notification = {
  /**
   * Save a notification record (attempt details)
   */
  create: async (data) => {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        customer_id: data.customer_id,
        phone: data.phone,
        message: data.message,
        status: data.status || 'pending',
        sid: data.sid || null,
        error_message: data.error_message || null
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return notification;
  },

  /**
   * Retrieve all notification logs for a specific customer
   */
  findByCustomer: async (customerId) => {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return notifications;
  },

  /**
   * Retrieve all notification logs in the system (Supplier view)
   */
  findAll: async () => {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return notifications;
  },

  /**
   * Update the status field of a log record
   */
  updateStatus: async (id, status) => {
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return notification;
  }
};

module.exports = Notification;

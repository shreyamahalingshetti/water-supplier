const { supabaseAdmin: supabase } = require('../config/supabase');

/**
 * User Model interacting with Supabase PostgreSQL 'users' table
 */
const User = {
  /**
   * Create a new user profile record linked to the auth.users UUID
   */
  create: async (data) => {
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: data.id,
        name: data.name,
        phone: data.phone,
        password: data.password,
        role: data.role || 'customer',
        area: data.area || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();



    if (error) {
      throw error;
    }

    return user;
  },

  /**
   * Retrieve a user profile by ID
   */
  findById: async (id) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return user;
  },

  /**
   * Retrieve a user profile by phone number (customer login)
   */
  findByPhone: async (phone) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return user;
  },

  /**
   * Fetch all user profiles (Supplier view)
   */
  findAll: async () => {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return users;
  },

  /**
   * Fetch all user profiles with role = 'customer'
   */
  findAllCustomers: async () => {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (users && users.length > 0) {
      // Fetch all orders to compute order counts per customer
      const { data: orders } = await supabase
        .from('orders')
        .select('customer_id');

      // Fetch active recurring orders to compute recurring badge presence
      const { data: recurring } = await supabase
        .from('recurring_orders')
        .select('customer_id, is_active')
        .eq('is_active', true);

      const orderCounts = {};
      if (orders) {
        orders.forEach(o => {
          if (o.customer_id) {
            orderCounts[o.customer_id] = (orderCounts[o.customer_id] || 0) + 1;
          }
        });
      }

      const hasRecurring = {};
      if (recurring) {
        recurring.forEach(r => {
          if (r.customer_id) {
            hasRecurring[r.customer_id] = true;
          }
        });
      }

      users.forEach(u => {
        u.total_orders = orderCounts[u.id] || 0;
        u.has_recurring = hasRecurring[u.id] || false;
      });
    }

    return users;
  },

  /**
   * Update fields on a user profile record
   */
  update: async (id, data) => {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        name: data.name,
        phone: data.phone,
        area: data.area
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return user;
  },

  /**
   * Delete a user profile record
   */
  delete: async (id) => {
    const { data: user, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return user;
  }
};

module.exports = User;

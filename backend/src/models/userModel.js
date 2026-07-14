const { supabase } = require('../config/supabase');

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
        email: data.email || null,
        role: data.role || 'customer',
        area: data.area || null,
        address: data.address || null
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
        area: data.area,
        address: data.address
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

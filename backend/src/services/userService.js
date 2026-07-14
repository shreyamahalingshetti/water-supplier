const User = require('../models/userModel');

/**
 * User Profile Service
 */
const userService = {
  /**
   * Validate and create a user profile in the public.users database table
   */
  createUserProfile: async (data) => {
    if (!data.id) {
      const err = new Error('User ID (matching Supabase Auth uid) is required');
      err.statusCode = 400;
      throw err;
    }

    // Role bounds check
    if (data.role && !['customer', 'supplier'].includes(data.role)) {
      const err = new Error('Invalid role. Role must be either customer or supplier');
      err.statusCode = 400;
      throw err;
    }

    // Unique phone check
    if (data.phone) {
      const existing = await User.findByPhone(data.phone);
      if (existing && existing.id !== data.id) {
        const err = new Error('Phone number is already associated with another profile');
        err.statusCode = 400;
        throw err;
      }
    }

    return await User.create(data);
  },

  /**
   * Fetch a single user profile, throw 404 if not found
   */
  getUserById: async (id) => {
    const user = await User.findById(id);
    if (!user) {
      const err = new Error('User profile not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  },

  /**
   * Fetch customer profile by phone, throw 404 if not found
   */
  getUserByPhone: async (phone) => {
    const user = await User.findByPhone(phone);
    if (!user) {
      const err = new Error('User profile not found for this phone number');
      err.statusCode = 404;
      throw err;
    }
    return user;
  },

  /**
   * Fetch all user profiles
   */
  getAllUsers: async () => {
    return await User.findAll();
  },

  /**
   * Fetch only customers (role = 'customer')
   */
  getAllCustomers: async () => {
    return await User.findAllCustomers();
  },

  /**
   * Validate unique constraints and edit user profile
   */
  updateUserProfile: async (id, data) => {
    // Check if profile exists
    const existing = await User.findById(id);
    if (!existing) {
      const err = new Error('User profile not found');
      err.statusCode = 404;
      throw err;
    }

    // Unique phone check if phone number is modified
    if (data.phone && data.phone !== existing.phone) {
      const phoneOwner = await User.findByPhone(data.phone);
      if (phoneOwner && phoneOwner.id !== id) {
        const err = new Error('Phone number is already associated with another profile');
        err.statusCode = 400;
        throw err;
      }
    }

    return await User.update(id, data);
  },

  /**
   * Delete user profile
   */
  deleteUser: async (id) => {
    const existing = await User.findById(id);
    if (!existing) {
      const err = new Error('User profile not found');
      err.statusCode = 404;
      throw err;
    }
    
    return await User.delete(id);
  }
};

module.exports = userService;

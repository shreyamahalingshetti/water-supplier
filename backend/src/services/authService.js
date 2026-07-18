const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Authentication Service for Water Supplier Application
 */
const authService = {
  /**
   * Request OTP code via SMS for customer phone number
   * @param {string} phone - Customer's phone number
   */
  loginWithPhone: async (phone) => {
    // TODO: await User.findByPhone(phone)
    
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Verify SMS OTP code and return session data
   * @param {string} phone - Customer's phone number
   * @param {string} token - OTP code sent to customer
   */
  verifyOTP: async (phone, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: 'sms'
    });

    if (error) {
      throw error;
    }

    // TODO: await User.findOrCreateByPhone(phone) (Sync/Update database user record)

    return data;
  },

  /**
   * Sign up customer using phone and password and create a user profile record
   * @param {string} phone - Customer's phone number
   * @param {string} password - Customer's password
   * @param {string} name - Customer's name
   * @param {string} area - Customer's area / locality
   */
  signup: async (phone, password, name, area) => {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      phone: phone,
      password: password,
      phone_confirm: true
    });

    if (error) {
      throw error;
    }

    if (data && data.user) {
      const { uuidToBigInt } = require('../utils/uuidHelper');
      const User = require('../models/userModel');
      
      const bigIntId = uuidToBigInt(data.user.id);
      
      // Create user profile record in PostgreSQL
      await User.create({
        id: bigIntId,
        name: name,
        phone: phone,
        password: password,
        role: 'customer',
        area: area
      });

    }

    // Automatically sign in the user to obtain a session
    const loginResult = await supabase.auth.signInWithPassword({
      phone: phone,
      password: password
    });

    if (loginResult.error) {
      throw loginResult.error;
    }

    return loginResult.data;
  },



  /**
   * Log in customer using phone and password
   * @param {string} phone - Customer's phone number
   * @param {string} password - Customer's password
   */
  login: async (phone, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: phone,
      password: password
    });

    if (error) {
      throw error;
    }

    // Fetch or create database profile and return it alongside session
    let profile = null;
    if (data && data.user) {
      const { uuidToBigInt } = require('../utils/uuidHelper');
      const User = require('../models/userModel');
      const bigIntId = uuidToBigInt(data.user.id);

      // First try to find by bigint ID
      profile = await User.findById(bigIntId);

      // If not found, try by phone number (user may have been created with different ID mapping)
      if (!profile) {
        profile = await User.findByPhone(phone);
        if (profile) {
          // Auto-align ID to match the JWT sub bigIntId
          await supabaseAdmin.from('users').update({ id: bigIntId }).eq('phone', phone);
          profile.id = bigIntId;
        }
      }

      // Still not found — create a placeholder that user can update
      if (!profile) {
        try {
          profile = await User.create({
            id: bigIntId,
            name: phone,        // use phone as temporary name
            phone: phone,
            password: password,
            role: 'customer',
            area: ''
          });
        } catch (createErr) {
          // If creation fails (e.g. duplicate), try fetching by phone again
          profile = await User.findByPhone(phone);
          if (profile) {
            await supabaseAdmin.from('users').update({ id: bigIntId }).eq('phone', phone);
            profile.id = bigIntId;
          }
        }
      }
    }

    return { ...data, profile };
  },


  loginSupplier: async (phone, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: phone,
      password: password
    });
    if (error) {
      throw { statusCode: 401, message: error.message };
    }

    let profile = null;
    if (data && data.user) {
      const { uuidToBigInt } = require('../utils/uuidHelper');
      const User = require('../models/userModel');
      const bigIntId = uuidToBigInt(data.user.id);

      // First try to find by bigint ID
      profile = await User.findById(bigIntId);

      // If not found, try by phone
      if (!profile) {
        profile = await User.findByPhone(phone);
        if (profile) {
          // Auto-align ID to match the JWT sub bigIntId
          await supabaseAdmin.from('users').update({ id: bigIntId }).eq('phone', phone);
          profile.id = bigIntId;
        }
      }

      // Enforce: Must be a supplier to access this portal
      if (profile && profile.role !== 'supplier') {
        throw { statusCode: 403, message: 'Access denied. You do not have supplier permissions.' };
      }

      // Still not found — create a placeholder supplier profile
      if (!profile) {
        try {
          profile = await User.create({
            id: bigIntId,
            name: 'Supplier',
            phone: phone,
            password: password,
            role: 'supplier',
            area: ''
          });
        } catch (createErr) {
          profile = await User.findByPhone(phone);
          if (profile) {
            if (profile.role !== 'supplier') {
              throw { statusCode: 403, message: 'Access denied. You do not have supplier permissions.' };
            }
            await supabaseAdmin.from('users').update({ id: bigIntId }).eq('phone', phone);
            profile.id = bigIntId;
          }
        }
      }
    }

    return { session: data.session, profile };
  },

  /**
   * Log out user by invalidating their JWT access token
   * @param {string} accessToken - JWT authentication token
   */
  logout: async (accessToken) => {
    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);

    if (error) {
      throw error;
    }

    return { success: true, message: 'Logged out successfully' };
  }
};

module.exports = authService;


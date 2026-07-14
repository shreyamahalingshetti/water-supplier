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
   * Log in supplier using email and password
   * @param {string} email - Supplier's email
   * @param {string} password - Supplier's password
   */
  loginSupplier: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      throw error;
    }

    // TODO: await Supplier.findByEmail(email) (Verify supplier profile status in local database)

    return data;
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

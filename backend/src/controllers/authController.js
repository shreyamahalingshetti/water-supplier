const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Authentication Controller
 */
const authController = {
  /**
   * Request an OTP to be sent to customer's phone number
   */
  sendOTP: async (req, res, next) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return sendError(res, 'Phone number is required', 400);
      }

      const data = await authService.loginWithPhone(phone);
      
      return sendSuccess(res, 'OTP code sent successfully', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify customer OTP and log in / start session
   */
  verifyOTP: async (req, res, next) => {
    try {
      const { phone, token } = req.body;

      if (!phone || !token) {
        return sendError(res, 'Phone number and verification token are required', 400);
      }

      const data = await authService.verifyOTP(phone, token);

      return sendSuccess(res, 'OTP verified successfully and session initiated', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Sign up customer using phone and password
   */
  signup: async (req, res, next) => {
    try {
      const { phone, password, name, area } = req.body;

      if (!phone || !password || !name || !area) {
        return sendError(res, 'Phone number, password, name, and area/locality are required', 400);
      }

      const data = await authService.signup(phone, password, name, area);

      return sendSuccess(res, 'Customer registered and profile created successfully', data, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Log in customer using phone and password
   */
  login: async (req, res, next) => {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return sendError(res, 'Phone number and password are required', 400);
      }

      const data = await authService.login(phone, password);

      return sendSuccess(res, 'Customer authenticated successfully', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Authenticate supplier using email and password
   */
  supplierLogin: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }

      const data = await authService.loginSupplier(email, password);

      return sendSuccess(res, 'Supplier authenticated successfully', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Terminate active user session
   */
  logout: async (req, res, next) => {
    try {
      // Token is guaranteed to exist due to authMiddleware
      const authHeader = req.headers.authorization;
      const token = authHeader.split(' ')[1];

      const data = await authService.logout(token);

      return sendSuccess(res, 'Logged out successfully', data);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;

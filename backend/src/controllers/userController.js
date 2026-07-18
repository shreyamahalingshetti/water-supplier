const userService = require('../services/userService');
const { sendSuccess, sendError } = require('../utils/response');
const { uuidToBigInt } = require('../utils/uuidHelper');

/**
 * User Profile Controller
 */
const userController = {
  /**
   * Create user profile (Post-signup)
   */
  create: async (req, res, next) => {
    try {
      // Allow taking ID from request body or decoded token payload
      const userId = req.user ? req.user.id : req.body.id;
      
      const profileData = {
        ...req.body,
        id: userId
      };

      const user = await userService.createUserProfile(profileData);
      
      return sendSuccess(res, 'User profile created successfully', user, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve all user profiles (Supplier only)
   */
  getAll: async (req, res, next) => {
    try {
      // Role Check: Only suppliers (email authenticated) can list all users
      if (!req.user || !req.user.email) {
        return sendError(res, 'Access denied. Supplier permissions required.', 403);
      }

      const users = await userService.getAllUsers();
      
      return sendSuccess(res, 'Users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve customer-role users only (Supplier only)
   */
  getAllCustomers: async (req, res, next) => {
    try {
      // Role Check: Only suppliers can view all customers
      if (!req.user || !req.user.email) {
        return sendError(res, 'Access denied. Supplier permissions required.', 403);
      }

      const customers = await userService.getAllCustomers();
      
      return sendSuccess(res, 'Customers retrieved successfully', customers);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve a single user profile (Self/Supplier)
   */
  getById: async (req, res, next) => {
    try {
      const id = uuidToBigInt(req.params.id);

      // Access Check: Customers can only retrieve their own profile, suppliers can retrieve any
      const isSupplier = req.user && req.user.email;
      if (!isSupplier && req.user.id !== id) {
        return sendError(res, 'Access denied. You can only view your own profile.', 403);
      }

      const user = await userService.getUserById(id);
      
      return sendSuccess(res, 'User profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a user profile record (Self/Supplier)
   */
  update: async (req, res, next) => {
    try {
      const id = uuidToBigInt(req.params.id);

      // Access Check: Customers can only update their own profile, suppliers can update any
      const isSupplier = req.user && req.user.email;
      if (!isSupplier && req.user.id !== id) {
        return sendError(res, 'Access denied. You can only modify your own profile.', 403);
      }

      const updatedUser = await userService.updateUserProfile(id, req.body);
      
      return sendSuccess(res, 'User profile updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a user profile (Supplier only)
   */
  delete: async (req, res, next) => {
    try {
      // Role Check: Only suppliers can delete user profiles
      if (!req.user || !req.user.email) {
        return sendError(res, 'Access denied. Supplier permissions required to delete users.', 403);
      }

      const id = uuidToBigInt(req.params.id);
      const deletedUser = await userService.deleteUser(id);
      
      return sendSuccess(res, 'User profile deleted successfully', deletedUser);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;

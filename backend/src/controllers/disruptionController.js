const disruptionService = require('../services/disruptionService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Disruption Controller
 */
const disruptionController = {
  /**
   * Create a new disruption announcement (Supplier only)
   */
  create: async (req, res, next) => {
    try {
      // Allow admin OR supplier roles to announce disruptions
      const role = req.user && req.user.role;
      if (!req.user || (role !== 'admin' && role !== 'supplier')) {
        return sendError(res, 'Access denied. Admin or supplier permissions required.', 403);
      }

      const supplierPhone = req.user.phone;
      const disruption = await disruptionService.createDisruption(req.body, supplierPhone);

      return sendSuccess(res, 'Disruption announcement created successfully', disruption, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve all disruption announcements (Public)
   */
  getAll: async (req, res, next) => {
    try {
      const disruptions = await disruptionService.getAllDisruptions();
      
      return sendSuccess(res, 'Disruptions retrieved successfully', disruptions);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check if today has a disruption scheduled (Public)
   */
  getToday: async (req, res, next) => {
    try {
      const todayDisruption = await disruptionService.checkTodayDisruption();
      
      return sendSuccess(res, "Today's disruption status checked successfully", todayDisruption);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve single disruption details (Public)
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const disruption = await disruptionService.getDisruptionById(id);
      
      return sendSuccess(res, 'Disruption details retrieved successfully', disruption);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a disruption announcement (Supplier only)
   */
  delete: async (req, res, next) => {
    try {
      // Allow admin OR supplier roles to delete disruptions
      const role = req.user && req.user.role;
      if (!req.user || (role !== 'admin' && role !== 'supplier')) {
        return sendError(res, 'Access denied. Admin or supplier permissions required.', 403);
      }

      const { id } = req.params;
      const deletedDisruption = await disruptionService.deleteDisruption(id);

      return sendSuccess(res, 'Disruption announcement deleted successfully', deletedDisruption);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = disruptionController;

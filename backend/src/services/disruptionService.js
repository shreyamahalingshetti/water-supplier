const Disruption = require('../models/disruptionModel');

/**
 * Disruption Service
 */
const disruptionService = {
  /**
   * Create a new disruption announcement (Supplier only)
   */
  createDisruption: async (data, supplierId) => {
    let disruptionDate = data.disruption_date;

    // Default to today's local date string if not specified
    if (!disruptionDate) {
      const offsetMs = new Date().getTimezoneOffset() * 60 * 1000;
      const localToday = new Date(Date.now() - offsetMs);
      disruptionDate = localToday.toISOString().split('T')[0];
    } else {
      const parsedDate = new Date(disruptionDate);
      if (isNaN(parsedDate.getTime())) {
        const err = new Error('Invalid disruption date format');
        err.statusCode = 400;
        throw err;
      }
    }

    const disruptionData = {
      title: data.title || 'Water Supply Disruption',
      description: data.description || 'Water delivery service is temporarily suspended.',
      disruption_date: disruptionDate,
      created_by: supplierId
    };

    return await Disruption.create(disruptionData);
  },

  /**
   * Fetch all disruption records
   */
  getAllDisruptions: async () => {
    return await Disruption.findAll();
  },

  /**
   * Fetch single disruption announcement, throw 404 if missing
   */
  getDisruptionById: async (id) => {
    const disruption = await Disruption.findById(id);
    if (!disruption) {
      const err = new Error('Disruption announcement not found');
      err.statusCode = 404;
      throw err;
    }
    return disruption;
  },

  /**
   * Check if a disruption announcement exists for today
   */
  checkTodayDisruption: async () => {
    const offsetMs = new Date().getTimezoneOffset() * 60 * 1000;
    const localToday = new Date(Date.now() - offsetMs);
    const todayStr = localToday.toISOString().split('T')[0];

    const disruption = await Disruption.findByDate(todayStr);

    return {
      hasDisruption: !!disruption,
      disruption: disruption || null
    };
  },

  /**
   * Delete a disruption announcement
   */
  deleteDisruption: async (id) => {
    const existing = await Disruption.findById(id);
    if (!existing) {
      const err = new Error('Disruption announcement not found');
      err.statusCode = 404;
      throw err;
    }
    return await Disruption.delete(id);
  }
};

module.exports = disruptionService;

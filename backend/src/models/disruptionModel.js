const { supabaseAdmin: supabase } = require('../config/supabase');

/**
 * Disruption Model interacting with Supabase PostgreSQL 'disruptions' table
 */
const Disruption = {
  /**
   * Helper to map database rows to expected model format
   */
  mapRow: (row) => {
    if (!row) return null;
    return {
      id: row.id,
      title: 'Water Supply Disruption',
      description: row.message,
      message: row.message,
      disruption_date: row.created_at ? row.created_at.split('T')[0] : null,
      created_by: row.created_by,
      created_at: row.created_at
    };
  },

  /**
   * Create a new disruption announcement
   */
  create: async (data) => {
    const { data: disruption, error } = await supabase
      .from('disruptions')
      .insert({
        message: data.description || data.message || 'Water delivery service is temporarily suspended.',
        created_by: data.created_by
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Disruption.mapRow(disruption);
  },

  /**
   * Fetch all disruption records ordered by disruption date descending
   */
  findAll: async () => {
    const { data: disruptions, error } = await supabase
      .from('disruptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (disruptions || []).map(Disruption.mapRow);
  },

  /**
   * Find a single disruption announcement by ID
   */
  findById: async (id) => {
    const { data: disruption, error } = await supabase
      .from('disruptions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return Disruption.mapRow(disruption);
  },

  /**
   * Check if a disruption exists for a specific calendar date (YYYY-MM-DD)
   */
  findByDate: async (date) => {
    const start = `${date}T00:00:00.000Z`;
    const end = `${date}T23:59:59.999Z`;

    const { data: disruptions, error } = await supabase
      .from('disruptions')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Return all disruptions for the date (not just the first)
    return (disruptions || []).map(Disruption.mapRow);
  },

  /**
   * Delete a disruption record
   */
  delete: async (id) => {
    const { data: disruption, error } = await supabase
      .from('disruptions')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return Disruption.mapRow(disruption);
  }
};

module.exports = Disruption;


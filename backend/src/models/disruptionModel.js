const { supabaseAdmin: supabase } = require('../config/supabase');

/**
 * Disruption Model interacting with Supabase PostgreSQL 'disruptions' table
 */
const Disruption = {
  /**
   * Create a new disruption announcement
   */
  create: async (data) => {
    const { data: disruption, error } = await supabase
      .from('disruptions')
      .insert({
        title: data.title,
        description: data.description,
        disruption_date: data.disruption_date,
        created_by: data.created_by
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return disruption;
  },

  /**
   * Fetch all disruption records ordered by disruption date descending
   */
  findAll: async () => {
    const { data: disruptions, error } = await supabase
      .from('disruptions')
      .select('*')
      .order('disruption_date', { ascending: false });

    if (error) {
      throw error;
    }

    return disruptions;
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

    return disruption;
  },

  /**
   * Check if a disruption exists for a specific calendar date (YYYY-MM-DD)
   */
  findByDate: async (date) => {
    const { data: disruptions, error } = await supabase
      .from('disruptions')
      .select('*')
      .eq('disruption_date', date);

    if (error) {
      throw error;
    }

    return disruptions.length > 0 ? disruptions[0] : null;
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

    return disruption;
  }
};

module.exports = Disruption;

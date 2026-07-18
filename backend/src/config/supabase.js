const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('Missing critical Supabase environment variables in configuration');
}

// Global headers: tell PostgREST to serialize bigint columns as strings
// This prevents JavaScript Number precision loss on large IDs (> 2^53)
const globalHeaders = {
  'X-Client-Info': 'water-supplier-backend',
  'Prefer': 'bigint-stringify'
};

// Regular Supabase client for user-specific operations
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: { headers: globalHeaders }
});

// Admin Supabase client for backend operations requiring elevated permissions
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: { headers: globalHeaders }
});

module.exports = {
  supabase,
  supabaseAdmin
};


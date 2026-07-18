const { supabase } = require('../config/supabase');
const { sendError } = require('../utils/response');
const { uuidToBigInt } = require('../utils/uuidHelper');

/**
 * Middleware to verify Supabase Auth Bearer Token
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or malformed', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return sendError(res, 'Invalid or expired authentication token', 401);
    }

    // Convert Supabase UUID to database-compatible bigint string
    user.id = uuidToBigInt(user.id);

    // Look up role in the database profile — first by bigint ID, then by phone as fallback
    const User = require('../models/userModel');
    let dbProfile = await User.findById(user.id);

    // Fallback: if not found by ID, try phone (handles ID-alignment edge cases for suppliers)
    if (!dbProfile) {
      const phone = user.phone;
      if (phone) {
        dbProfile = await User.findByPhone(phone);
        if (dbProfile) {
          // Auto-align the stored ID to the current bigint so future lookups succeed
          try {
            await require('../config/supabase').supabaseAdmin
              .from('users')
              .update({ id: user.id })
              .eq('phone', phone);
            dbProfile.id = user.id;
          } catch (_) { /* non-fatal */ }
        }
      }
    }

    if (dbProfile) {
      user.role  = dbProfile.role;
      user.phone = user.phone || dbProfile.phone;
      // If user is a supplier, ensure email is populated so legacy controller checks pass
      if (dbProfile.role === 'supplier' && !user.email) {
        user.email = dbProfile.phone || 'supplier@jalseva.com';
      }
    }


    // Convert request parameters
    if (req.params) {
      for (const key in req.params) {
        req.params[key] = uuidToBigInt(req.params[key]);
      }
    }

    // Convert request body fields
    if (req.body) {
      if (req.body.id)          req.body.id          = uuidToBigInt(req.body.id);
      if (req.body.customer_id) req.body.customer_id = uuidToBigInt(req.body.customer_id);
      if (req.body.created_by)  req.body.created_by  = uuidToBigInt(req.body.created_by);
    }

    // Convert query parameters
    if (req.query) {
      if (req.query.customer_id) req.query.customer_id = uuidToBigInt(req.query.customer_id);
    }

    // Set user on request object
    req.user = user;
    
    next();
  } catch (error) {
    // Pass unexpected execution errors to the global error handler
    next(error);
  }
};

module.exports = authMiddleware;

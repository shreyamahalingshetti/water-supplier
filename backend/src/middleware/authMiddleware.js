const { supabase } = require('../config/supabase');
const { sendError } = require('../utils/response');

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

    // Set user on request object
    req.user = user;
    
    next();
  } catch (error) {
    // Pass unexpected execution errors to the global error handler
    next(error);
  }
};

module.exports = authMiddleware;

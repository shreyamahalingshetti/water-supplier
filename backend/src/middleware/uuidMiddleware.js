const { uuidToBigInt } = require('../utils/uuidHelper');

const uuidMiddleware = (req, res, next) => {
  // Convert params (e.g. :id, :customerId)
  if (req.params) {
    for (const key in req.params) {
      req.params[key] = uuidToBigInt(req.params[key]);
    }
  }

  // Convert body fields
  if (req.body) {
    if (req.body.id) req.body.id = uuidToBigInt(req.body.id);
    if (req.body.customer_id) req.body.customer_id = uuidToBigInt(req.body.customer_id);
    if (req.body.created_by) req.body.created_by = uuidToBigInt(req.body.created_by);
  }

  // Convert query string parameters
  if (req.query) {
    if (req.query.customer_id) req.query.customer_id = uuidToBigInt(req.query.customer_id);
  }

  next();
};

module.exports = uuidMiddleware;

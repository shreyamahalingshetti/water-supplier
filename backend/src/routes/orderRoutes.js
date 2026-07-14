const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all order endpoints with Supabase JWT authentication
router.use(authMiddleware);

// POST /api/orders - Customer creates a new order
router.post('/', orderController.create);

// GET /api/orders - Supplier views all orders (with optional filters)
router.get('/', orderController.getAll);

// GET /api/orders/today - Supplier views today's orders grouped by area
router.get('/today', orderController.getToday);

// GET /api/orders/:id - View details of a single order
router.get('/:id', orderController.getById);

// GET /api/orders/customer/:customerId - Customer views their own orders
router.get('/customer/:customerId', orderController.getByCustomer);

// PUT /api/orders/:id/status - Supplier updates order status (pending/delivered/cancelled)
router.put('/:id/status', orderController.updateStatus);

// DELETE /api/orders/:id - Delete an order
router.delete('/:id', orderController.delete);

module.exports = router;

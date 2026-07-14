const express = require('express');
const router = express.Router();
const recurringOrderController = require('../controllers/recurringOrderController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all recurring order endpoints with Supabase JWT authentication
router.use(authMiddleware);

// POST /api/recurring-orders - Customer creates a new recurring order
router.post('/', recurringOrderController.create);

// GET /api/recurring-orders - Supplier views all recurring orders
router.get('/', recurringOrderController.getAll);

// GET /api/recurring-orders/customer/:customerId - Customer views their own recurring orders
router.get('/customer/:customerId', recurringOrderController.getByCustomer);

// GET /api/recurring-orders/:id - View details of a single recurring order
router.get('/:id', recurringOrderController.getById);

// PUT /api/recurring-orders/:id/pause - Pause recurring order subscription
router.put('/:id/pause', recurringOrderController.pause);

// PUT /api/recurring-orders/:id/resume - Resume recurring order subscription
router.put('/:id/resume', recurringOrderController.resume);

// DELETE /api/recurring-orders/:id - Delete a recurring order subscription
router.delete('/:id', recurringOrderController.delete);

module.exports = router;

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all notification routes with Supabase JWT authentication
router.use(authMiddleware);

// POST /api/notifications/broadcast - Send disruption broadcast (Supplier only)
router.post('/broadcast', notificationController.broadcast);

// GET /api/notifications - View all notification logs (Supplier only)
router.get('/', notificationController.getAll);

// GET /api/notifications/customer/:customerId - View own notification logs (Customer / Supplier)
router.get('/customer/:customerId', notificationController.getByCustomer);

module.exports = router;

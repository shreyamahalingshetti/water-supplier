const express = require('express');
const router = express.Router();
const disruptionController = require('../controllers/disruptionController');
const authMiddleware = require('../middleware/authMiddleware');

// Public endpoints: Accessible by both Customers and Suppliers without JWT
// GET /api/disruptions - View all disruption announcements
router.get('/', disruptionController.getAll);

// GET /api/disruptions/today - Check if there is an active disruption today
router.get('/today', disruptionController.getToday);

// GET /api/disruptions/:id - View details of a single disruption announcement
router.get('/:id', disruptionController.getById);

// Protected endpoints: Accessible only by authenticated Suppliers (verified in controller)
// POST /api/disruptions - Create a new disruption announcement
router.post('/', authMiddleware, disruptionController.create);

// DELETE /api/disruptions/:id - Delete a disruption announcement
router.delete('/:id', authMiddleware, disruptionController.delete);

module.exports = router;

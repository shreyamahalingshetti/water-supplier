const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all user routes with Supabase JWT authentication
router.use(authMiddleware);

// POST /api/users - Create a new user profile record (post-signup)
router.post('/', userController.create);

// GET /api/users - Supplier views all users
router.get('/', userController.getAll);

// GET /api/users/customers - Supplier views all customer-role users
router.get('/customers', userController.getAllCustomers);

// GET /api/users/:id - View single user profile details (Self / Supplier)
router.get('/:id', userController.getById);

// PUT /api/users/:id - Update user profile information (Self / Supplier)
router.put('/:id', userController.update);

// DELETE /api/users/:id - Delete a user profile record (Supplier only)
router.delete('/:id', userController.delete);

module.exports = router;

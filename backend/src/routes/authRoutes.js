const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route: Request SMS OTP for Customer login
router.post('/send-otp', authController.sendOTP);

// Public route: Verify SMS OTP for Customer login
router.post('/verify-otp', authController.verifyOTP);

// Public route: Supplier login with Email/Password
router.post('/supplier-login', authController.supplierLogin);

// Protected route: Terminate user session (requires Bearer JWT token)
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;

const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, userCreate } = require('../middleware/validate');

const router = express.Router();

// Public routes
router.post(
  '/register/admin',
  userCreate,
  validateRequest,
  AuthController.registerAdmin
);

router.post('/login', AuthController.login);

router.post('/forgot-password', AuthController.forgotPassword);

router.post('/reset-password', AuthController.resetPassword);

router.get('/verify-email/:token', AuthController.verifyEmail);

// Protected routes
router.use(authenticateToken);

router.get('/me', AuthController.getProfile);

router.patch('/me', AuthController.updateProfile);

router.post('/refresh-token', AuthController.refreshToken);

router.post('/logout', AuthController.logout);

module.exports = router;

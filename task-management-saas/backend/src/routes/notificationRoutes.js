const express = require('express');
const router = express.Router();
const { getUserNotifications, markAsRead } = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');

router.get(
  '/',
  authenticateToken,
  getUserNotifications
);

router.post(
  '/mark-read',
  authenticateToken,
  [
    body('notificationIds')
      .isArray()
      .withMessage('notificationIds must be an array')
      .notEmpty()
      .withMessage('notificationIds cannot be empty'),
    validate
  ],
  markAsRead
);

module.exports = router;

const { validationResult, body, param, query } = require('express-validator');
const { APIError } = require('./errorHandler');

// Middleware to check validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(400, errors.array()[0].msg);
  }
  next();
};

// Common validation rules
const commonValidations = {
  // User validations
  userCreate: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
  ],

  // Workspace validations
  workspaceCreate: [
    body('name')
      .notEmpty()
      .withMessage('Workspace name is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Workspace name must be between 3 and 50 characters'),
  ],

  // Task validations
  taskCreate: [
    body('title')
      .notEmpty()
      .withMessage('Task title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Task title must be between 3 and 100 characters'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
      .withMessage('Invalid priority level'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid due date format'),
    body('assignedTo')
      .optional()
      .isUUID()
      .withMessage('Invalid user ID format'),
  ],

  // Comment validations
  commentCreate: [
    body('content')
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ max: 500 })
      .withMessage('Comment cannot exceed 500 characters'),
  ],

  // ID parameter validation
  idParam: [
    param('id')
      .isUUID()
      .withMessage('Invalid ID format'),
  ],

  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],

  // Search validation
  search: [
    query('q')
      .optional()
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters long'),
  ],

  // Date range validation
  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
  ],
};

module.exports = {
  validateRequest,
  ...commonValidations
};

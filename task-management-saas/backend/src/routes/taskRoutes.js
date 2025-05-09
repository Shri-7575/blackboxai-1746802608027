const express = require('express');
const TaskController = require('../controllers/taskController');
const {
  authenticateToken,
  isWorkspaceMember,
  validateSubscription
} = require('../middleware/auth');
const {
  validateRequest,
  taskCreate,
  commentCreate,
  idParam,
  pagination,
  search,
  dateRange
} = require('../middleware/validate');

const router = express.Router({ mergeParams: true }); // To access workspaceId from parent router

// All routes require authentication and workspace membership
router.use(authenticateToken, isWorkspaceMember, validateSubscription);

// Get tasks list with filters
router.get(
  '/',
  pagination,
  search,
  dateRange,
  validateRequest,
  TaskController.getTasks
);

// Get my tasks
router.get(
  '/my-tasks',
  pagination,
  search,
  validateRequest,
  TaskController.getMyTasks
);

// Get task statistics
router.get('/stats', TaskController.getTaskStats);

// Create new task
router.post(
  '/',
  taskCreate,
  validateRequest,
  TaskController.createTask
);

// Bulk update tasks
router.patch(
  '/bulk',
  TaskController.bulkUpdateTasks
);

// Task-specific routes
router.use('/:taskId', idParam, validateRequest);

// Get task details
router.get(
  '/:taskId',
  TaskController.getTask
);

// Update task
router.patch(
  '/:taskId',
  TaskController.updateTask
);

// Delete task
router.delete(
  '/:taskId',
  TaskController.deleteTask
);

// Task comments
router.post(
  '/:taskId/comments',
  commentCreate,
  validateRequest,
  TaskController.addComment
);

// Get task activity log
router.get(
  '/:taskId/activity',
  TaskController.getTaskActivity
);

module.exports = router;

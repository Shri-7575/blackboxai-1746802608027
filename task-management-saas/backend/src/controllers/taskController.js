const TaskService = require('../services/taskService');
const NotificationService = require('../services/notificationService');
const { catchAsync } = require('../middleware/errorHandler');

class TaskController {
  /**
   * Create a new task
   * @route POST /api/workspaces/:workspaceId/tasks
   */
  static createTask = catchAsync(async (req, res) => {
    const task = await TaskService.createTask(
      req.params.workspaceId,
      req.body,
      req.user.id
    );

    // Send notification if task is assigned
    if (task.assignedTo) {
      await NotificationService.sendTaskAssignmentNotification(task);
    }

    res.status(201).json({
      status: 'success',
      data: { task }
    });
  });

  /**
   * Get task details
   * @route GET /api/workspaces/:workspaceId/tasks/:taskId
   */
  static getTask = catchAsync(async (req, res) => {
    const task = await TaskService.getTask(
      req.params.taskId,
      req.params.workspaceId
    );
    res.status(200).json({
      status: 'success',
      data: { task }
    });
  });

  /**
   * Update task
   * @route PATCH /api/workspaces/:workspaceId/tasks/:taskId
   */
  static updateTask = catchAsync(async (req, res) => {
    const task = await TaskService.getTask(
      req.params.taskId,
      req.params.workspaceId
    );

    const previousStatus = task.status;
    const updatedTask = await TaskService.updateTask(
      req.params.taskId,
      req.params.workspaceId,
      {
        ...req.body,
        updatedBy: req.user.id
      }
    );

    // Send notifications for status changes
    if (req.body.status && req.body.status !== previousStatus) {
      await NotificationService.sendTaskStatusNotification(
        updatedTask,
        previousStatus
      );
    }

    // Send notifications for assignment changes
    if (req.body.assignedTo && req.body.assignedTo !== task.assignedTo) {
      await NotificationService.sendTaskAssignmentNotification(updatedTask);
    }

    res.status(200).json({
      status: 'success',
      data: { task: updatedTask }
    });
  });

  /**
   * Delete task
   * @route DELETE /api/workspaces/:workspaceId/tasks/:taskId
   */
  static deleteTask = catchAsync(async (req, res) => {
    await TaskService.deleteTask(
      req.params.taskId,
      req.params.workspaceId
    );
    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  });

  /**
   * Add comment to task
   * @route POST /api/workspaces/:workspaceId/tasks/:taskId/comments
   */
  static addComment = catchAsync(async (req, res) => {
    const { content } = req.body;
    const comment = await TaskService.addComment(
      req.params.taskId,
      req.params.workspaceId,
      req.user.id,
      content
    );

    const task = await TaskService.getTask(
      req.params.taskId,
      req.params.workspaceId
    );

    // Send notification for new comment
    await NotificationService.sendTaskCommentNotification(
      task,
      comment,
      req.user
    );

    res.status(201).json({
      status: 'success',
      data: { comment }
    });
  });

  /**
   * Get task list with filters
   * @route GET /api/workspaces/:workspaceId/tasks
   */
  static getTasks = catchAsync(async (req, res) => {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      assignedTo: req.query.assignedTo,
      search: req.query.q,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await TaskService.getTasks(
      req.params.workspaceId,
      filters
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  /**
   * Get task statistics
   * @route GET /api/workspaces/:workspaceId/tasks/stats
   */
  static getTaskStats = catchAsync(async (req, res) => {
    const stats = await TaskService.getTaskStats(
      req.params.workspaceId,
      req.query.userId
    );
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  });

  /**
   * Get my tasks
   * @route GET /api/workspaces/:workspaceId/tasks/my-tasks
   */
  static getMyTasks = catchAsync(async (req, res) => {
    const filters = {
      assignedTo: req.user.id,
      status: req.query.status,
      priority: req.query.priority,
      search: req.query.q,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await TaskService.getTasks(
      req.params.workspaceId,
      filters
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  /**
   * Get task activity log
   * @route GET /api/workspaces/:workspaceId/tasks/:taskId/activity
   */
  static getTaskActivity = catchAsync(async (req, res) => {
    const activity = await TaskService.getTaskActivity(
      req.params.taskId,
      req.params.workspaceId
    );
    res.status(200).json({
      status: 'success',
      data: { activity }
    });
  });

  /**
   * Bulk update tasks
   * @route PATCH /api/workspaces/:workspaceId/tasks/bulk
   */
  static bulkUpdateTasks = catchAsync(async (req, res) => {
    const { taskIds, update } = req.body;
    const updatedTasks = await TaskService.bulkUpdateTasks(
      req.params.workspaceId,
      taskIds,
      update,
      req.user.id
    );
    res.status(200).json({
      status: 'success',
      data: { tasks: updatedTasks }
    });
  });
}

module.exports = TaskController;

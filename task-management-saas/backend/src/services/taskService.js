const { Task, User, Comment, Workspace } = require('../models');
const { APIError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

class TaskService {
  /**
   * Create a new task
   */
  static async createTask(workspaceId, taskData, creatorId) {
    const {
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      tags = []
    } = taskData;

    // Verify workspace exists and is active
    const workspace = await Workspace.findByPk(workspaceId);
    if (!workspace || !workspace.isActive) {
      throw new APIError(404, 'Workspace not found or inactive');
    }

    // If assignee specified, verify they're a workspace member
    if (assignedTo) {
      const isMember = await workspace.hasMember(assignedTo);
      if (!isMember) {
        throw new APIError(400, 'Assigned user is not a workspace member');
      }
    }

    const task = await Task.create({
      workspaceId,
      title,
      description,
      assignedTo,
      assignedBy: creatorId,
      dueDate,
      priority,
      tags,
      status: 'PENDING'
    });

    // Send notification to assigned user
    if (assignedTo) {
      // TODO: Implement notification service
      // await notificationService.sendTaskAssignmentNotification(task);
    }

    return task;
  }

  /**
   * Get task details
   */
  static async getTask(taskId, workspaceId) {
    const task = await Task.findOne({
      where: {
        id: taskId,
        workspaceId
      },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: Comment,
          include: [{
            model: User,
            attributes: ['id', 'email', 'firstName', 'lastName']
          }]
        }
      ]
    });

    if (!task) {
      throw new APIError(404, 'Task not found');
    }

    return task;
  }

  /**
   * Update task
   */
  static async updateTask(taskId, workspaceId, updateData) {
    const task = await this.getTask(taskId, workspaceId);
    
    // If changing assignee, verify they're a workspace member
    if (updateData.assignedTo) {
      const workspace = await Workspace.findByPk(workspaceId);
      const isMember = await workspace.hasMember(updateData.assignedTo);
      if (!isMember) {
        throw new APIError(400, 'Assigned user is not a workspace member');
      }
    }

    // If marking as completed, set completedAt
    if (updateData.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    await task.update(updateData);

    // Send notification if assignment changed
    if (updateData.assignedTo && updateData.assignedTo !== task.assignedTo) {
      // TODO: Implement notification service
      // await notificationService.sendTaskReassignmentNotification(task);
    }

    return task;
  }

  /**
   * Delete task
   */
  static async deleteTask(taskId, workspaceId) {
    const task = await this.getTask(taskId, workspaceId);
    await task.destroy();
    return true;
  }

  /**
   * Add comment to task
   */
  static async addComment(taskId, workspaceId, userId, content) {
    const task = await this.getTask(taskId, workspaceId);

    const comment = await Comment.create({
      taskId,
      userId,
      content
    });

    // Send notification to task assignee and creator
    // TODO: Implement notification service
    // await notificationService.sendTaskCommentNotification(task, comment);

    return comment;
  }

  /**
   * Get tasks list with filters
   */
  static async getTasks(workspaceId, filters = {}) {
    const {
      status,
      priority,
      assignedTo,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = filters;

    const where = { workspaceId };

    // Apply filters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = startDate;
      if (endDate) where.createdAt[Op.lte] = endDate;
    }

    // Pagination
    const offset = (page - 1) * limit;

    const { rows: tasks, count: total } = await Task.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get task statistics
   */
  static async getTaskStats(workspaceId, userId = null) {
    const where = { workspaceId };
    if (userId) where.assignedTo = userId;

    const [
      total,
      pending,
      inProgress,
      completed,
      overdue
    ] = await Promise.all([
      Task.count({ where }),
      Task.count({ where: { ...where, status: 'PENDING' } }),
      Task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      Task.count({ where: { ...where, status: 'COMPLETED' } }),
      Task.count({
        where: {
          ...where,
          status: { [Op.ne]: 'COMPLETED' },
          dueDate: { [Op.lt]: new Date() }
        }
      })
    ]);

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
      completionRate: total ? (completed / total * 100).toFixed(2) : 0
    };
  }
}

module.exports = TaskService;

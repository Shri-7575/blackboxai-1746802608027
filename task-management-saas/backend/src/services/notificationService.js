const nodemailer = require('nodemailer');
const { User, Workspace, Task } = require('../models');
const { APIError } = require('../middleware/errorHandler');

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

class NotificationService {
  /**
   * Send email notification
   */
  static async sendEmail(to, subject, html) {
    try {
      await transporter.sendMail({
        from: `"Task Management" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      // Don't throw error to prevent disrupting the main flow
    }
  }

  /**
   * Create in-app notification
   */
  static async createNotification(userId, workspaceId, type, data) {
    const notification = await Notification.create({
      userId,
      workspaceId,
      type,
      data,
      isRead: false
    });

    // TODO: Emit notification through WebSocket if implemented
    return notification;
  }

  /**
   * Send task assignment notification
   */
  static async sendTaskAssignmentNotification(task) {
    const [assignee, workspace] = await Promise.all([
      User.findByPk(task.assignedTo),
      Workspace.findByPk(task.workspaceId)
    ]);

    if (!assignee) return;

    // Send email
    const emailHtml = `
      <h2>New Task Assigned</h2>
      <p>You have been assigned a new task in workspace "${workspace.name}"</p>
      <h3>Task Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${task.title}</li>
        <li><strong>Priority:</strong> ${task.priority}</li>
        ${task.dueDate ? `<li><strong>Due Date:</strong> ${task.dueDate.toLocaleDateString()}</li>` : ''}
      </ul>
      <p>Click <a href="${process.env.FRONTEND_URL}/tasks/${task.id}">here</a> to view the task.</p>
    `;

    await this.sendEmail(
      assignee.email,
      'New Task Assignment',
      emailHtml
    );

    // Create in-app notification
    await this.createNotification(
      assignee.id,
      task.workspaceId,
      'TASK_ASSIGNED',
      {
        taskId: task.id,
        taskTitle: task.title
      }
    );
  }

  /**
   * Send task status update notification
   */
  static async sendTaskStatusNotification(task, previousStatus) {
    const [creator, assignee, workspace] = await Promise.all([
      User.findByPk(task.assignedBy),
      task.assignedTo ? User.findByPk(task.assignedTo) : null,
      Workspace.findByPk(task.workspaceId)
    ]);

    const statusChangeHtml = `
      <h2>Task Status Updated</h2>
      <p>Task status has been updated in workspace "${workspace.name}"</p>
      <h3>Task Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${task.title}</li>
        <li><strong>Previous Status:</strong> ${previousStatus}</li>
        <li><strong>New Status:</strong> ${task.status}</li>
      </ul>
      <p>Click <a href="${process.env.FRONTEND_URL}/tasks/${task.id}">here</a> to view the task.</p>
    `;

    // Notify creator
    if (creator && creator.id !== task.updatedBy) {
      await this.sendEmail(
        creator.email,
        'Task Status Updated',
        statusChangeHtml
      );

      await this.createNotification(
        creator.id,
        task.workspaceId,
        'TASK_STATUS_UPDATED',
        {
          taskId: task.id,
          taskTitle: task.title,
          newStatus: task.status
        }
      );
    }

    // Notify assignee
    if (assignee && assignee.id !== task.updatedBy) {
      await this.sendEmail(
        assignee.email,
        'Task Status Updated',
        statusChangeHtml
      );

      await this.createNotification(
        assignee.id,
        task.workspaceId,
        'TASK_STATUS_UPDATED',
        {
          taskId: task.id,
          taskTitle: task.title,
          newStatus: task.status
        }
      );
    }
  }

  /**
   * Send workspace invitation notification
   */
  static async sendWorkspaceInvitation(email, workspace, inviter) {
    const inviteHtml = `
      <h2>Workspace Invitation</h2>
      <p>You have been invited to join the workspace "${workspace.name}" by ${inviter.firstName} ${inviter.lastName}</p>
      <p>Click <a href="${process.env.FRONTEND_URL}/invite/accept/${workspace.id}">here</a> to accept the invitation.</p>
    `;

    await this.sendEmail(
      email,
      'Workspace Invitation',
      inviteHtml
    );
  }

  /**
   * Send task comment notification
   */
  static async sendTaskCommentNotification(task, comment, commentAuthor) {
    const [assignee, creator, workspace] = await Promise.all([
      task.assignedTo ? User.findByPk(task.assignedTo) : null,
      User.findByPk(task.assignedBy),
      Workspace.findByPk(task.workspaceId)
    ]);

    const commentHtml = `
      <h2>New Comment on Task</h2>
      <p>A new comment has been added to a task in workspace "${workspace.name}"</p>
      <h3>Task Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${task.title}</li>
        <li><strong>Comment by:</strong> ${commentAuthor.firstName} ${commentAuthor.lastName}</li>
        <li><strong>Comment:</strong> ${comment.content}</li>
      </ul>
      <p>Click <a href="${process.env.FRONTEND_URL}/tasks/${task.id}">here</a> to view the task.</p>
    `;

    // Notify relevant users (except comment author)
    const notifyUsers = [assignee, creator].filter(
      user => user && user.id !== commentAuthor.id
    );

    for (const user of notifyUsers) {
      await this.sendEmail(
        user.email,
        'New Comment on Task',
        commentHtml
      );

      await this.createNotification(
        user.id,
        task.workspaceId,
        'TASK_COMMENT_ADDED',
        {
          taskId: task.id,
          taskTitle: task.title,
          commentId: comment.id
        }
      );
    }
  }

  /**
   * Mark notifications as read
   */
  static async markNotificationsAsRead(userId, notificationIds) {
    await Notification.update(
      { isRead: true },
      {
        where: {
          id: notificationIds,
          userId
        }
      }
    );
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId, workspaceId = null, page = 1, limit = 20) {
    const where = { userId };
    if (workspaceId) where.workspaceId = workspaceId;

    const { rows: notifications, count: total } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = NotificationService;

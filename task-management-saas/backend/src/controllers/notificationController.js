const NotificationService = require('../services/notificationService');
const { APIError } = require('../middleware/errorHandler');

async function getUserNotifications(req, res, next) {
  try {
    const { workspaceId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await NotificationService.getUserNotifications(
      req.user.id,
      workspaceId,
      page,
      limit
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds)) {
      throw new APIError('Invalid notification IDs', 400);
    }

    await NotificationService.markNotificationsAsRead(
      req.user.id,
      notificationIds
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserNotifications,
  markAsRead
};

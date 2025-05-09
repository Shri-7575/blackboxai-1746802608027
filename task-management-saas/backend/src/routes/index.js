const express = require('express');
const authRoutes = require('./authRoutes');
const workspaceRoutes = require('./workspaceRoutes');
const taskRoutes = require('./taskRoutes');
const notificationRoutes = require('./notificationRoutes');
const { authenticateToken, isSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Auth routes
router.use('/auth', authRoutes);

// Workspace routes
router.use('/workspaces', workspaceRoutes);

// Task routes (nested under workspaces)
router.use('/workspaces/:workspaceId/tasks', taskRoutes);

// Notification routes
router.use('/notifications', authenticateToken, notificationRoutes);

// Super Admin routes
router.use('/admin', authenticateToken, isSuperAdmin);

router.get('/admin/workspaces', async (req, res) => {
  const { Workspace, User } = require('../models');
  const workspaces = await Workspace.findAll({
    include: [{
      model: User,
      as: 'owner',
      attributes: ['id', 'email', 'firstName', 'lastName']
    }]
  });
  res.json({ workspaces });
});

router.get('/admin/users', async (req, res) => {
  const { User } = require('../models');
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });
  res.json({ users });
});

router.get('/admin/stats', async (req, res) => {
  const { User, Workspace, Task } = require('../models');
  const [
    totalUsers,
    totalWorkspaces,
    totalTasks,
    activeSubscriptions
  ] = await Promise.all([
    User.count(),
    Workspace.count(),
    Task.count(),
    Workspace.count({ where: { subscriptionStatus: 'ACTIVE' } })
  ]);

  res.json({
    stats: {
      totalUsers,
      totalWorkspaces,
      totalTasks,
      activeSubscriptions
    }
  });
});

router.patch('/admin/workspaces/:workspaceId', async (req, res) => {
  const { Workspace } = require('../models');
  const workspace = await Workspace.findByPk(req.params.workspaceId);
  if (!workspace) {
    return res.status(404).json({ message: 'Workspace not found' });
  }
  await workspace.update(req.body);
  res.json({ workspace });
});

router.patch('/admin/users/:userId', async (req, res) => {
  const { User } = require('../models');
  const user = await User.findByPk(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  await user.update(req.body);
  res.json({ user });
});

module.exports = router;

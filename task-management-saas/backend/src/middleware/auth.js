const jwt = require('jsonwebtoken');
const { User, Workspace } = require('../models');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user with workspace memberships
    const user = await User.findByPk(decoded.userId, {
      include: [
        { 
          model: Workspace,
          as: 'workspaces',
          through: { attributes: ['role'] }
        }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    next(error);
  }
};

// Check if user is Super Admin
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Requires Super Admin privileges' });
  }
  next();
};

// Check if user is Workspace Admin
const isWorkspaceAdmin = async (req, res, next) => {
  const workspaceId = req.params.workspaceId || req.body.workspaceId;
  
  if (!workspaceId) {
    return res.status(400).json({ message: 'Workspace ID is required' });
  }

  const workspace = req.user.workspaces.find(w => w.id === workspaceId);
  
  if (!workspace || workspace.WorkspaceMember.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Requires Workspace Admin privileges' });
  }

  req.workspace = workspace;
  next();
};

// Check if user is Workspace Member
const isWorkspaceMember = async (req, res, next) => {
  const workspaceId = req.params.workspaceId || req.body.workspaceId;
  
  if (!workspaceId) {
    return res.status(400).json({ message: 'Workspace ID is required' });
  }

  const workspace = req.user.workspaces.find(w => w.id === workspaceId);
  
  if (!workspace) {
    return res.status(403).json({ message: 'Not a member of this workspace' });
  }

  if (!workspace.isSubscriptionActive()) {
    return res.status(403).json({ message: 'Workspace subscription is inactive' });
  }

  req.workspace = workspace;
  next();
};

// Validate workspace subscription
const validateSubscription = async (req, res, next) => {
  const workspace = req.workspace;

  if (!workspace.isSubscriptionActive()) {
    return res.status(403).json({ 
      message: 'Workspace subscription is inactive or trial period has expired'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  isSuperAdmin,
  isWorkspaceAdmin,
  isWorkspaceMember,
  validateSubscription
};

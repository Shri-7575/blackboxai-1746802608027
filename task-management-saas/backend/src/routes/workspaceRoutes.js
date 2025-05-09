const express = require('express');
const WorkspaceController = require('../controllers/workspaceController');
const {
  authenticateToken,
  isWorkspaceAdmin,
  isWorkspaceMember,
  validateSubscription
} = require('../middleware/auth');
const {
  validateRequest,
  workspaceCreate,
  idParam
} = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's workspaces
router.get('/', WorkspaceController.getUserWorkspaces);

// Create new workspace
router.post(
  '/',
  workspaceCreate,
  validateRequest,
  WorkspaceController.createWorkspace
);

// Workspace specific routes
router.use('/:workspaceId', idParam, validateRequest);

// Get workspace details (requires membership)
router.get(
  '/:workspaceId',
  isWorkspaceMember,
  WorkspaceController.getWorkspace
);

// Update workspace (requires admin)
router.patch(
  '/:workspaceId',
  isWorkspaceAdmin,
  WorkspaceController.updateWorkspace
);

// Member management (requires admin)
router.get(
  '/:workspaceId/members',
  isWorkspaceMember,
  WorkspaceController.getMembers
);

router.post(
  '/:workspaceId/members',
  isWorkspaceAdmin,
  validateSubscription,
  WorkspaceController.addMember
);

router.patch(
  '/:workspaceId/members/:userId',
  isWorkspaceAdmin,
  WorkspaceController.updateMemberRole
);

router.delete(
  '/:workspaceId/members/:userId',
  isWorkspaceAdmin,
  WorkspaceController.removeMember
);

// Workspace statistics (requires membership)
router.get(
  '/:workspaceId/stats',
  isWorkspaceMember,
  WorkspaceController.getWorkspaceStats
);

// Subscription management (requires admin)
router.post(
  '/:workspaceId/subscription/order',
  isWorkspaceAdmin,
  WorkspaceController.createSubscriptionOrder
);

router.post(
  '/:workspaceId/subscription/verify',
  isWorkspaceAdmin,
  WorkspaceController.verifySubscriptionPayment
);

router.post(
  '/:workspaceId/subscription/cancel',
  isWorkspaceAdmin,
  WorkspaceController.cancelSubscription
);

// Register team member in workspace
router.post(
  '/:workspaceId/register/team-member',
  isWorkspaceAdmin,
  validateSubscription,
  WorkspaceController.addMember
);

module.exports = router;

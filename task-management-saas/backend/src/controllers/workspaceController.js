const WorkspaceService = require('../services/workspaceService');
const NotificationService = require('../services/notificationService');
const { catchAsync } = require('../middleware/errorHandler');

class WorkspaceController {
  /**
   * Create a new workspace
   * @route POST /api/workspaces
   */
  static createWorkspace = catchAsync(async (req, res) => {
    const workspace = await WorkspaceService.createWorkspace(req.body, req.user.id);
    res.status(201).json({
      status: 'success',
      data: { workspace }
    });
  });

  /**
   * Get workspace details
   * @route GET /api/workspaces/:workspaceId
   */
  static getWorkspace = catchAsync(async (req, res) => {
    const workspace = await WorkspaceService.getWorkspace(
      req.params.workspaceId,
      true // include members
    );
    res.status(200).json({
      status: 'success',
      data: { workspace }
    });
  });

  /**
   * Update workspace
   * @route PATCH /api/workspaces/:workspaceId
   */
  static updateWorkspace = catchAsync(async (req, res) => {
    const workspace = await WorkspaceService.updateWorkspace(
      req.params.workspaceId,
      req.body
    );
    res.status(200).json({
      status: 'success',
      data: { workspace }
    });
  });

  /**
   * Add member to workspace
   * @route POST /api/workspaces/:workspaceId/members
   */
  static addMember = catchAsync(async (req, res) => {
    const { email, role } = req.body;
    const user = await WorkspaceService.addMember(
      req.params.workspaceId,
      email,
      role
    );

    // Send invitation email
    await NotificationService.sendWorkspaceInvitation(
      email,
      req.workspace,
      req.user
    );

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });

  /**
   * Remove member from workspace
   * @route DELETE /api/workspaces/:workspaceId/members/:userId
   */
  static removeMember = catchAsync(async (req, res) => {
    await WorkspaceService.removeMember(
      req.params.workspaceId,
      req.params.userId
    );
    res.status(200).json({
      status: 'success',
      message: 'Member removed successfully'
    });
  });

  /**
   * Update member role
   * @route PATCH /api/workspaces/:workspaceId/members/:userId
   */
  static updateMemberRole = catchAsync(async (req, res) => {
    const { role } = req.body;
    await WorkspaceService.updateMemberRole(
      req.params.workspaceId,
      req.params.userId,
      role
    );
    res.status(200).json({
      status: 'success',
      message: 'Member role updated successfully'
    });
  });

  /**
   * Get workspace statistics
   * @route GET /api/workspaces/:workspaceId/stats
   */
  static getWorkspaceStats = catchAsync(async (req, res) => {
    const stats = await WorkspaceService.getWorkspaceStats(req.params.workspaceId);
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  });

  /**
   * Create subscription order
   * @route POST /api/workspaces/:workspaceId/subscription/order
   */
  static createSubscriptionOrder = catchAsync(async (req, res) => {
    const { planId } = req.body;
    const order = await WorkspaceService.createSubscriptionOrder(
      req.params.workspaceId,
      planId
    );
    res.status(200).json({
      status: 'success',
      data: { order }
    });
  });

  /**
   * Verify subscription payment
   * @route POST /api/workspaces/:workspaceId/subscription/verify
   */
  static verifySubscriptionPayment = catchAsync(async (req, res) => {
    const { paymentId, orderId, signature } = req.body;
    const workspace = await WorkspaceService.verifySubscriptionPayment(
      req.params.workspaceId,
      paymentId,
      orderId,
      signature
    );
    res.status(200).json({
      status: 'success',
      data: { workspace }
    });
  });

  /**
   * Cancel workspace subscription
   * @route POST /api/workspaces/:workspaceId/subscription/cancel
   */
  static cancelSubscription = catchAsync(async (req, res) => {
    const workspace = await WorkspaceService.cancelSubscription(
      req.params.workspaceId
    );
    res.status(200).json({
      status: 'success',
      data: { workspace }
    });
  });

  /**
   * Get workspace members
   * @route GET /api/workspaces/:workspaceId/members
   */
  static getMembers = catchAsync(async (req, res) => {
    const workspace = await WorkspaceService.getWorkspace(
      req.params.workspaceId,
      true // include members
    );
    res.status(200).json({
      status: 'success',
      data: { members: workspace.members }
    });
  });

  /**
   * Get user workspaces
   * @route GET /api/workspaces
   */
  static getUserWorkspaces = catchAsync(async (req, res) => {
    // User workspaces are already loaded by auth middleware
    const workspaces = req.user.workspaces.map(w => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      role: w.WorkspaceMember.role,
      subscriptionStatus: w.subscriptionStatus,
      isActive: w.isActive
    }));

    res.status(200).json({
      status: 'success',
      data: { workspaces }
    });
  });
}

module.exports = WorkspaceController;

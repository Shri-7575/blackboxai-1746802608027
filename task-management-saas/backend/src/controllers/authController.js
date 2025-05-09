const AuthService = require('../services/authService');
const { catchAsync } = require('../middleware/errorHandler');

class AuthController {
  /**
   * Register a new admin user with workspace
   * @route POST /api/auth/register/admin
   */
  static registerAdmin = catchAsync(async (req, res) => {
    const result = await AuthService.registerAdmin(req.body);
    res.status(201).json({
      status: 'success',
      data: result
    });
  });

  /**
   * Register a new team member
   * @route POST /api/auth/register/team-member
   */
  static registerTeamMember = catchAsync(async (req, res) => {
    const { workspaceId } = req.params;
    const result = await AuthService.registerTeamMember(req.body, workspaceId);
    res.status(201).json({
      status: 'success',
      data: result
    });
  });

  /**
   * Login user
   * @route POST /api/auth/login
   */
  static login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  /**
   * Request password reset
   * @route POST /api/auth/forgot-password
   */
  static forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    await AuthService.requestPasswordReset(email);
    res.status(200).json({
      status: 'success',
      message: 'Password reset instructions sent to email'
    });
  });

  /**
   * Reset password
   * @route POST /api/auth/reset-password
   */
  static resetPassword = catchAsync(async (req, res) => {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);
    res.status(200).json({
      status: 'success',
      message: 'Password successfully reset'
    });
  });

  /**
   * Get current user profile
   * @route GET /api/auth/me
   */
  static getProfile = catchAsync(async (req, res) => {
    // User is already attached to req by auth middleware
    const user = req.user;
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          workspaces: user.workspaces.map(w => ({
            id: w.id,
            name: w.name,
            slug: w.slug,
            role: w.WorkspaceMember.role
          }))
        }
      }
    });
  });

  /**
   * Update user profile
   * @route PATCH /api/auth/me
   */
  static updateProfile = catchAsync(async (req, res) => {
    const { firstName, lastName, password } = req.body;
    const updateData = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (password) updateData.password = password;

    await req.user.update(updateData);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully'
    });
  });

  /**
   * Verify email
   * @route GET /api/auth/verify-email/:token
   */
  static verifyEmail = catchAsync(async (req, res) => {
    const { token } = req.params;
    await AuthService.verifyEmail(token);
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  });

  /**
   * Refresh token
   * @route POST /api/auth/refresh-token
   */
  static refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  /**
   * Logout
   * @route POST /api/auth/logout
   */
  static logout = catchAsync(async (req, res) => {
    // Clear refresh token if using refresh token rotation
    const { refreshToken } = req.body;
    if (refreshToken) {
      await AuthService.revokeRefreshToken(refreshToken);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  });
}

module.exports = AuthController;

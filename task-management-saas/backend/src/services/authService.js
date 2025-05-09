const jwt = require('jsonwebtoken');
const { User, Workspace } = require('../models');
const { APIError } = require('../middleware/errorHandler');

class AuthService {
  /**
   * Generate JWT token
   */
  static generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  /**
   * Register a new admin user and create their workspace
   */
  static async registerAdmin(userData) {
    const { email, password, firstName, lastName, workspaceName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new APIError(400, 'Email already registered');
    }

    // Create user with admin role
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'ADMIN'
    });

    // Create workspace for the admin
    const workspace = await Workspace.create({
      name: workspaceName,
      ownerId: user.id
    });

    // Add admin as workspace member
    await workspace.addMember(user, {
      through: { role: 'ADMIN' }
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug
      },
      token
    };
  }

  /**
   * Register a new team member
   */
  static async registerTeamMember(userData, workspaceId) {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new APIError(400, 'Email already registered');
    }

    // Find workspace
    const workspace = await Workspace.findByPk(workspaceId);
    if (!workspace) {
      throw new APIError(404, 'Workspace not found');
    }

    // Check workspace member limit
    const memberCount = await workspace.countMembers();
    if (!workspace.canAddMembers(memberCount)) {
      throw new APIError(400, 'Workspace member limit reached');
    }

    // Create user with team member role
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'TEAM_MEMBER'
    });

    // Add user to workspace
    await workspace.addMember(user, {
      through: { role: 'MEMBER' }
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    };
  }

  /**
   * Login user
   */
  static async login(email, password) {
    // Find user
    const user = await User.findOne({ 
      where: { email },
      include: [
        {
          model: Workspace,
          as: 'workspaces',
          through: { attributes: ['role'] }
        }
      ]
    });

    if (!user) {
      throw new APIError(401, 'Invalid credentials');
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new APIError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new APIError(403, 'Account is inactive');
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      workspaces: user.workspaces.map(w => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        role: w.WorkspaceMember.role
      })),
      token
    };
  }

  /**
   * Reset password request
   */
  static async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new APIError(404, 'User not found');
    }

    // Generate reset token (24h expiry)
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // TODO: Send reset password email
    // This would typically integrate with an email service

    return true;
  }

  /**
   * Reset password
   */
  static async resetPassword(resetToken, newPassword) {
    try {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        throw new APIError(404, 'User not found');
      }

      await user.update({ password: newPassword });
      return true;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new APIError(400, 'Invalid or expired reset token');
      }
      throw error;
    }
  }
}

module.exports = AuthService;

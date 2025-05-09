const { Workspace, WorkspaceMember, User } = require('../models');
const { Op } = require('sequelize');

// Initialize Razorpay only if the keys are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

const createWorkspace = async (userId, workspaceData) => {
  const workspace = await Workspace.create(workspaceData);
  
  // Add creator as workspace owner
  await WorkspaceMember.create({
    UserId: userId,
    WorkspaceId: workspace.id,
    role: 'OWNER'
  });

  return workspace;
};

const getWorkspaces = async (userId) => {
  return await Workspace.findAll({
    include: [{
      model: User,
      through: {
        where: { UserId: userId }
      }
    }]
  });
};

const getWorkspaceById = async (workspaceId, userId) => {
  const workspace = await Workspace.findOne({
    where: { id: workspaceId },
    include: [{
      model: User,
      through: WorkspaceMember
    }]
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  // Check if user is a member of the workspace
  const isMember = await WorkspaceMember.findOne({
    where: {
      WorkspaceId: workspaceId,
      UserId: userId
    }
  });

  if (!isMember) {
    throw new Error('Unauthorized access to workspace');
  }

  return workspace;
};

const updateWorkspace = async (workspaceId, userId, updateData) => {
  const workspace = await Workspace.findByPk(workspaceId);
  
  if (!workspace) {
    throw new Error('Workspace not found');
  }

  // Check if user has permission to update
  const member = await WorkspaceMember.findOne({
    where: {
      WorkspaceId: workspaceId,
      UserId: userId,
      role: {
        [Op.in]: ['OWNER', 'ADMIN']
      }
    }
  });

  if (!member) {
    throw new Error('Unauthorized to update workspace');
  }

  return await workspace.update(updateData);
};

const deleteWorkspace = async (workspaceId, userId) => {
  const workspace = await Workspace.findByPk(workspaceId);
  
  if (!workspace) {
    throw new Error('Workspace not found');
  }

  // Check if user is the owner
  const member = await WorkspaceMember.findOne({
    where: {
      WorkspaceId: workspaceId,
      UserId: userId,
      role: 'OWNER'
    }
  });

  if (!member) {
    throw new Error('Only workspace owner can delete workspace');
  }

  await workspace.destroy();
  return { message: 'Workspace deleted successfully' };
};

const addMember = async (workspaceId, adminId, memberData) => {
  // Check if admin has permission
  const admin = await WorkspaceMember.findOne({
    where: {
      WorkspaceId: workspaceId,
      UserId: adminId,
      role: {
        [Op.in]: ['OWNER', 'ADMIN']
      }
    }
  });

  if (!admin) {
    throw new Error('Unauthorized to add members');
  }

  // Check if user exists
  const user = await User.findOne({
    where: { email: memberData.email }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user is already a member
  const existingMember = await WorkspaceMember.findOne({
    where: {
      WorkspaceId: workspaceId,
      UserId: user.id
    }
  });

  if (existingMember) {
    throw new Error('User is already a member of this workspace');
  }

  return await WorkspaceMember.create({
    WorkspaceId: workspaceId,
    UserId: user.id,
    role: memberData.role || 'MEMBER'
  });
};

const removeMember = async (workspaceId, adminId, memberId) => {
  // Check if admin has permission
  const admin = await WorkspaceMember.findOne({
    where: {
      WorkspaceId: workspaceId,
      UserId: adminId,
      role: {
        [Op.in]: ['OWNER', 'ADMIN']
      }
    }
  });

  if (!admin) {
    throw new Error('Unauthorized to remove members');
  }

  // Cannot remove workspace owner
  const memberToRemove = await WorkspaceMember.findOne({
    where: {
      WorkspaceId: workspaceId,
      UserId: memberId
    }
  });

  if (!memberToRemove) {
    throw new Error('Member not found in workspace');
  }

  if (memberToRemove.role === 'OWNER') {
    throw new Error('Cannot remove workspace owner');
  }

  await memberToRemove.destroy();
  return { message: 'Member removed successfully' };
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember
};

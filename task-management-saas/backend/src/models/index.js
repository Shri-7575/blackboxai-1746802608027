const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Notification = require('./Notification');

// Define models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('USER', 'ADMIN'),
    defaultValue: 'USER'
  }
});

const Workspace = sequelize.define('Workspace', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT
});

const WorkspaceMember = sequelize.define('WorkspaceMember', {
  role: {
    type: DataTypes.ENUM('OWNER', 'ADMIN', 'MEMBER'),
    defaultValue: 'MEMBER'
  }
});

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    defaultValue: 'MEDIUM'
  },
  dueDate: DataTypes.DATE
});

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

// Define relationships
User.belongsToMany(Workspace, { through: WorkspaceMember });
Workspace.belongsToMany(User, { through: WorkspaceMember });

Workspace.hasMany(Task);
Task.belongsTo(Workspace);

Task.belongsTo(User, { as: 'assignee' });
Task.belongsTo(User, { as: 'creator' });

Task.hasMany(Comment);
Comment.belongsTo(Task);
Comment.belongsTo(User);

// Export models
module.exports = {
  sequelize,
  User,
  Workspace,
  WorkspaceMember,
  Task,
  Comment,
  Notification
};

// Set up Notification relationships
Notification.belongsTo(User);
Notification.belongsTo(Workspace);

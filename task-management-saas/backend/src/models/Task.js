const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  workspaceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Workspaces',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    defaultValue: 'MEDIUM'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  hooks: {
    beforeUpdate: async (task) => {
      if (task.changed('status') && task.status === 'COMPLETED') {
        task.completedAt = new Date();
      }
    }
  },
  indexes: [
    {
      fields: ['workspaceId']
    },
    {
      fields: ['assignedTo']
    },
    {
      fields: ['status']
    },
    {
      fields: ['dueDate']
    }
  ]
});

// Instance methods
Task.prototype.isOverdue = function() {
  return this.dueDate && new Date() > this.dueDate && this.status !== 'COMPLETED';
};

Task.prototype.getDuration = function() {
  if (!this.completedAt) return null;
  return (this.completedAt - this.createdAt) / (1000 * 60 * 60); // Duration in hours
};

module.exports = Task;

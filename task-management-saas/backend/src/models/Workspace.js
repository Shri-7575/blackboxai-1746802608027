const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('TRIAL', 'ACTIVE', 'INACTIVE', 'CANCELLED'),
    defaultValue: 'TRIAL'
  },
  subscriptionPlan: {
    type: DataTypes.STRING,
    defaultValue: 'FREE'
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  trialEndsAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  hooks: {
    beforeCreate: async (workspace) => {
      // Generate a unique slug from the workspace name
      workspace.slug = workspace.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Set trial end date (30 days from creation)
      workspace.trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
});

// Instance methods
Workspace.prototype.isSubscriptionActive = function() {
  return ['TRIAL', 'ACTIVE'].includes(this.subscriptionStatus) &&
    (this.subscriptionStatus === 'TRIAL' ? new Date() < this.trialEndsAt : true);
};

Workspace.prototype.canAddMembers = function(currentMemberCount) {
  return currentMemberCount < this.maxMembers;
};

module.exports = Workspace;

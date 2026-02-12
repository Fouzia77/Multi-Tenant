const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  role: {
    type: DataTypes.ENUM('super_admin', 'tenant_admin', 'user'),
    defaultValue: 'user'
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  tenantId: {
    type: DataTypes.UUID,
    allowNull: true
  },

}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email', 'tenantId']
    }
  ]
});

module.exports = User;
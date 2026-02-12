const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('todo', 'in_progress', 'completed'),
    defaultValue: 'todo'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  // FIX: Added assignedTo field
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: 'tasks'
});

module.exports = Task;
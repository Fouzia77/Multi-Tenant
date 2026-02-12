const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'other'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true
  },
  referenceNumber: {
    type: DataTypes.STRING
  },
  payerName: {
    type: DataTypes.STRING
  },
  payerEmail: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  payerPhone: {
    type: DataTypes.STRING(50)
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true,
  tableName: 'payments'
});

module.exports = Payment;


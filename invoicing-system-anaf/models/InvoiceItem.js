const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InvoiceItem = sequelize.define('InvoiceItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  vatRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 19
  },
  lineTotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  lineVat: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'buc'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = InvoiceItem;

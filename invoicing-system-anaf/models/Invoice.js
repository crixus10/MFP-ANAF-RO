const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('customer', 'supplier'),
    allowNull: false
  },
  partnerId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to Company model for the other party'
  },
  invoiceDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'RON'
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  vatAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'issued', 'paid', 'cancelled'),
    defaultValue: 'draft'
  },
  anafStatus: {
    type: DataTypes.ENUM('pending', 'sent', 'confirmed', 'error'),
    defaultValue: 'pending'
  },
  anafMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  anafUploadId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  xmlContent: {
    type: DataTypes.LONGTEXT,
    allowNull: true
  },
  pdfPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true
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

module.exports = Invoice;

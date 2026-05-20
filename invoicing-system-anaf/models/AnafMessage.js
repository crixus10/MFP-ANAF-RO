const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AnafMessage = sequelize.define('AnafMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  messageType: {
    type: DataTypes.ENUM('upload', 'status_check', 'download', 'error'),
    allowNull: false
  },
  direction: {
    type: DataTypes.ENUM('sent', 'received'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'error', 'warning'),
    defaultValue: 'pending'
  },
  anafCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  anafMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  uploadId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  requestData: {
    type: DataTypes.LONGTEXT,
    allowNull: true
  },
  responseData: {
    type: DataTypes.LONGTEXT,
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

module.exports = AnafMessage;

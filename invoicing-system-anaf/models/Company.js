const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  taxNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  registrationNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  county: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'RO'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fax: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bank: {
    type: DataTypes.STRING,
    allowNull: true
  },
  iban: {
    type: DataTypes.STRING,
    allowNull: true
  },
  currency: {
    type: DataTypes.ENUM('RON', 'EUR', 'USD', 'GBP'),
    defaultValue: 'RON'
  },
  language: {
    type: DataTypes.ENUM('ro', 'en'),
    defaultValue: 'ro'
  },
  isTaxPayer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  anafStatus: {
    type: DataTypes.ENUM('pending', 'active', 'inactive', 'error'),
    defaultValue: 'pending'
  },
  anafLastCheck: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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

module.exports = Company;

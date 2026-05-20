const { sequelize } = require('../config/database');
const User = require('./User');
const Company = require('./Company');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const AnafConfig = require('./AnafConfig');
const AnafMessage = require('./AnafMessage');
const UserCompany = require('./UserCompany');

// Define associations
User.hasMany(UserCompany, { foreignKey: 'userId', as: 'companies' });
UserCompany.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Company.hasMany(UserCompany, { foreignKey: 'companyId', as: 'users' });
UserCompany.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Company.hasMany(Invoice, { foreignKey: 'companyId', as: 'invoices' });
Invoice.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

Company.hasOne(AnafConfig, { foreignKey: 'companyId', as: 'anafConfig' });
AnafConfig.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Invoice.hasMany(AnafMessage, { foreignKey: 'invoiceId', as: 'anafMessages' });
AnafMessage.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

module.exports = {
  sequelize,
  User,
  Company,
  Invoice,
  InvoiceItem,
  AnafConfig,
  AnafMessage,
  UserCompany
};

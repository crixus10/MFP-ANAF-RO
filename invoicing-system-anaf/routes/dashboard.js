const express = require('express');
const { sequelize } = require('../config/database');
const Invoice = require('../models/Invoice');
const Company = require('../models/Company');
const UserCompany = require('../models/UserCompany');
const { authMiddleware, requireCompanyAccess } = require('../middleware/auth');

const router = express.Router();

// Get dashboard data for company
router.get('/company/:companyId', authMiddleware, requireCompanyAccess, async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Invoice statistics
    const totalInvoices = await Invoice.count({
      where: { companyId }
    });

    const draftInvoices = await Invoice.count({
      where: { companyId, status: 'draft' }
    });

    const issuedInvoices = await Invoice.count({
      where: { companyId, status: 'issued' }
    });

    const paidInvoices = await Invoice.count({
      where: { companyId, status: 'paid' }
    });

    // This month revenue
    const thisMonthRevenue = await sequelize.query(`
      SELECT SUM(total) as total FROM Invoices
      WHERE companyId = :companyId
      AND type = 'customer'
      AND invoiceDate >= :startDate
    `, {
      replacements: {
        companyId,
        startDate: thisMonth
      },
      type: sequelize.QueryTypes.SELECT
    });

    // Last month revenue
    const lastMonthRevenue = await sequelize.query(`
      SELECT SUM(total) as total FROM Invoices
      WHERE companyId = :companyId
      AND type = 'customer'
      AND invoiceDate >= :startDate
      AND invoiceDate <= :endDate
    `, {
      replacements: {
        companyId,
        startDate: lastMonth,
        endDate: lastMonthEnd
      },
      type: sequelize.QueryTypes.SELECT
    });

    // Recent invoices
    const recentInvoices = await Invoice.findAll({
      where: { companyId },
      limit: 10,
      order: [['invoiceDate', 'DESC']]
    });

    // ANAF status
    const anafPendingCount = await Invoice.count({
      where: { companyId, anafStatus: 'pending' }
    });

    const anafErrorCount = await Invoice.count({
      where: { companyId, anafStatus: 'error' }
    });

    res.json({
      success: true,
      data: {
        invoices: {
          total: totalInvoices,
          draft: draftInvoices,
          issued: issuedInvoices,
          paid: paidInvoices
        },
        revenue: {
          thisMonth: thisMonthRevenue[0]?.total || 0,
          lastMonth: lastMonthRevenue[0]?.total || 0
        },
        anaf: {
          pending: anafPendingCount,
          errors: anafErrorCount
        },
        recentInvoices
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user dashboard
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userCompanies = await UserCompany.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Company,
          as: 'company'
        }
      ]
    });

    const stats = await Promise.all(
      userCompanies.map(async (uc) => {
        const totalInvoices = await Invoice.count({
          where: { companyId: uc.companyId }
        });

        const totalRevenue = await sequelize.query(`
          SELECT SUM(total) as total FROM Invoices
          WHERE companyId = :companyId AND type = 'customer'
        `, {
          replacements: { companyId: uc.companyId },
          type: sequelize.QueryTypes.SELECT
        });

        return {
          companyId: uc.companyId,
          companyName: uc.company.name,
          totalInvoices,
          totalRevenue: totalRevenue[0]?.total || 0
        };
      })
    );

    res.json({
      success: true,
      data: {
        companies: userCompanies.map(uc => ({
          id: uc.company.id,
          name: uc.company.name,
          taxNumber: uc.company.taxNumber,
          role: uc.role
        })),
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

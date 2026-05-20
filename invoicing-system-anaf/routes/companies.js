const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Company = require('../models/Company');
const UserCompany = require('../models/UserCompany');
const anafService = require('../services/anafService');
const { authMiddleware, requireCompanyAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get user's companies
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userCompanies = await UserCompany.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Company,
        as: 'company'
      }]
    });

    res.json({
      success: true,
      data: userCompanies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create company
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      taxNumber,
      registrationNumber,
      address,
      city,
      county,
      postalCode,
      email,
      phone,
      fax,
      website,
      bank,
      iban,
      currency,
      language
    } = req.body;

    if (!name || !taxNumber) {
      return res.status(400).json({
        success: false,
        message: 'Name and tax number are required'
      });
    }

    // Check if tax number already exists
    const existingCompany = await Company.findOne({
      where: { taxNumber }
    });

    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: 'Company with this tax number already exists'
      });
    }

    // Verify with ANAF
    const anafCheck = await anafService.verifyTaxStatus(taxNumber, new Date());

    const company = await Company.create({
      name,
      taxNumber,
      registrationNumber,
      address,
      city,
      county,
      postalCode,
      country: 'RO',
      email,
      phone,
      fax,
      website,
      bank,
      iban,
      currency: currency || 'RON',
      language: language || 'ro',
      isTaxPayer: anafCheck.success ? anafCheck.isTaxPayer : false,
      anafStatus: anafCheck.success ? 'active' : 'error',
      anafLastCheck: new Date()
    });

    // Add user as company owner
    await UserCompany.create({
      userId: req.user.id,
      companyId: company.id,
      role: 'owner',
      isDefault: true
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get company details
router.get('/:companyId', authMiddleware, requireCompanyAccess, async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update company
router.put('/:companyId', authMiddleware, requireCompanyAccess, requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    await company.update(req.body);

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify tax status with ANAF
router.post('/:companyId/verify-tax-status', authMiddleware, requireCompanyAccess, async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const result = await anafService.verifyTaxStatus(company.taxNumber, new Date());

    if (result.success) {
      await company.update({
        isTaxPayer: result.isTaxPayer,
        anafStatus: 'active',
        anafLastCheck: new Date()
      });
    }

    res.json({
      success: result.success,
      data: {
        isTaxPayer: result.isTaxPayer,
        companyData: result.data,
        message: result.message
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

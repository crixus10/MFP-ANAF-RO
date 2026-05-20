const express = require('express');
const Company = require('../models/Company');
const { authMiddleware, requireCompanyAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// List suppliers for a company
router.get('/company/:companyId', authMiddleware, requireCompanyAccess, async (req, res) => {
  try {
    const suppliers = await Company.findAll({
      attributes: ['id', 'name', 'taxNumber', 'email', 'phone', 'address', 'city']
    });

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add supplier
router.post('/company/:companyId', authMiddleware, requireCompanyAccess, requireRole(['manager', 'accountant']), async (req, res) => {
  try {
    const {
      name,
      taxNumber,
      email,
      phone,
      address,
      city,
      county,
      postalCode,
      iban
    } = req.body;

    if (!name || !taxNumber) {
      return res.status(400).json({
        success: false,
        message: 'Name and tax number are required'
      });
    }

    let supplier = await Company.findOne({
      where: { taxNumber }
    });

    if (!supplier) {
      supplier = await Company.create({
        name,
        taxNumber,
        email,
        phone,
        address,
        city,
        county,
        postalCode,
        iban,
        country: 'RO',
        currency: 'RON'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Supplier added successfully',
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Invoice = require('../models/Invoice');
const InvoiceItem = require('../models/InvoiceItem');
const Company = require('../models/Company');
const invoiceXmlService = require('../services/invoiceXmlService');
const { authMiddleware, requireCompanyAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get invoices for a company
router.get('/company/:companyId', authMiddleware, requireCompanyAccess, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = { companyId: req.params.companyId };

    if (type) where.type = type;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate.$gte = new Date(startDate);
      if (endDate) where.invoiceDate.$lte = new Date(endDate);
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [{
        model: InvoiceItem,
        as: 'items'
      }],
      offset,
      limit: parseInt(limit),
      order: [['invoiceDate', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create invoice
router.post('/', authMiddleware, requireCompanyAccess, requireRole(['manager', 'accountant']), async (req, res) => {
  try {
    const {
      type,
      partnerId,
      invoiceDate,
      dueDate,
      currency,
      notes,
      items
    } = req.body;

    const companyId = req.body.companyId;

    if (!type || !partnerId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Calculate totals
    let subtotal = 0;
    let vatAmount = 0;

    const itemsData = items.map(item => {
      const lineTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
      const lineVat = lineTotal * (parseFloat(item.vatRate) / 100);
      subtotal += lineTotal;
      vatAmount += lineVat;

      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate || 19,
        lineTotal: lineTotal,
        lineVat: lineVat,
        unit: item.unit || 'buc'
      };
    });

    // Generate invoice number
    const invoiceNumber = `${new Date().getFullYear()}-${Math.floor(Math.random() * 10000000)}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      companyId,
      type,
      partnerId,
      invoiceDate: new Date(invoiceDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      currency: currency || 'RON',
      subtotal,
      vatAmount,
      total: subtotal + vatAmount,
      notes,
      status: 'draft',
      createdBy: req.user.id
    });

    // Create invoice items
    const createdItems = await Promise.all(
      itemsData.map(item =>
        InvoiceItem.create({
          invoiceId: invoice.id,
          ...item
        })
      )
    );

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: {
        ...invoice.toJSON(),
        items: createdItems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get invoice details
router.get('/:invoiceId', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.invoiceId, {
      include: [{
        model: InvoiceItem,
        as: 'items'
      }, {
        model: Company,
        as: 'company'
      }]
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check access
    const userCompany = await UserCompany.findOne({
      where: {
        userId: req.user.id,
        companyId: invoice.companyId
      }
    });

    if (!userCompany) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Generate invoice XML
router.post('/:invoiceId/generate-xml', authMiddleware, requireRole(['manager', 'accountant']), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.invoiceId, {
      include: [{
        model: InvoiceItem,
        as: 'items'
      }]
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const sellerCompany = await Company.findByPk(invoice.companyId);
    const buyerCompany = await Company.findByPk(invoice.partnerId);

    if (!sellerCompany || !buyerCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const xmlContent = invoiceXmlService.generateUBLInvoice(
      invoice,
      invoice.items,
      sellerCompany,
      buyerCompany
    );

    await invoice.update({
      xmlContent,
      status: 'issued'
    });

    res.json({
      success: true,
      message: 'XML generated successfully',
      data: {
        invoiceId: invoice.id,
        xmlContent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update invoice
router.put('/:invoiceId', authMiddleware, requireRole(['manager', 'accountant']), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify issued invoices'
      });
    }

    await invoice.update(req.body);

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

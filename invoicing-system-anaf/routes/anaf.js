const express = require('express');
const Invoice = require('../models/Invoice');
const AnafConfig = require('../models/AnafConfig');
const AnafMessage = require('../models/AnafMessage');
const Company = require('../models/Company');
const anafService = require('../services/anafService');
const { authMiddleware, requireCompanyAccess } = require('../middleware/auth');

const router = express.Router();

// Configure ANAF for company
router.post('/:companyId/configure', authMiddleware, requireCompanyAccess, async (req, res) => {
  try {
    const {
      clientId,
      clientSecret,
      certificatePath,
      certificatePassword
    } = req.body;

    const companyId = req.params.companyId;

    // Test connection with provided credentials
    const tokenResult = await anafService.getAccessToken(
      clientId,
      clientSecret,
      certificatePath,
      certificatePassword
    );

    if (!tokenResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to authenticate with ANAF',
        error: tokenResult.error
      });
    }

    let config = await AnafConfig.findOne({
      where: { companyId }
    });

    if (!config) {
      config = await AnafConfig.create({
        companyId,
        clientId,
        clientSecret,
        certificatePath,
        certificatePassword,
        accessToken: tokenResult.accessToken,
        tokenExpiresAt: new Date(Date.now() + tokenResult.expiresIn * 1000),
        isConfigured: true
      });
    } else {
      await config.update({
        clientId,
        clientSecret,
        certificatePath,
        certificatePassword,
        accessToken: tokenResult.accessToken,
        tokenExpiresAt: new Date(Date.now() + tokenResult.expiresIn * 1000),
        isConfigured: true
      });
    }

    res.json({
      success: true,
      message: 'ANAF configuration saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get ANAF configuration
router.get('/:companyId/config', authMiddleware, requireCompanyAccess, async (req, res) => {
  try {
    const config = await AnafConfig.findOne({
      where: { companyId: req.params.companyId },
      attributes: {
        exclude: ['clientSecret', 'certificatePassword', 'accessToken', 'refreshToken']
      }
    });

    res.json({
      success: true,
      data: config || {
        isConfigured: false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload invoice to ANAF
router.post('/:companyId/upload-invoice/:invoiceId', authMiddleware, requireCompanyAccess, async (req, res) => {
  try {
    const { companyId, invoiceId } = req.params;

    const invoice = await Invoice.findByPk(invoiceId);
    const config = await AnafConfig.findOne({ where: { companyId } });
    const company = await Company.findByPk(companyId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (!config || !config.isConfigured) {
      return res.status(400).json({
        success: false,
        message: 'ANAF is not configured for this company'
      });
    }

    if (!invoice.xmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Invoice XML must be generated first'
      });
    }

    // Refresh token if needed
    let token = config.accessToken;
    if (new Date() > new Date(config.tokenExpiresAt)) {
      const tokenResult = await anafService.getAccessToken(
        config.clientId,
        config.clientSecret,
        config.certificatePath,
        config.certificatePassword
      );

      if (tokenResult.success) {
        token = tokenResult.accessToken;
        await config.update({
          accessToken: token,
          tokenExpiresAt: new Date(Date.now() + tokenResult.expiresIn * 1000)
        });
      }
    }

    // Upload to ANAF
    const uploadResult = await anafService.uploadInvoice(
      invoice.xmlContent,
      token,
      company.taxNumber
    );

    // Record the message
    await AnafMessage.create({
      invoiceId,
      messageType: 'upload',
      direction: 'sent',
      status: uploadResult.success ? 'success' : 'error',
      uploadId: uploadResult.uploadId,
      anafMessage: uploadResult.error || uploadResult.response,
      requestData: invoice.xmlContent
    });

    if (uploadResult.success) {
      await invoice.update({
        anafStatus: 'sent',
        anafUploadId: uploadResult.uploadId
      });
    } else {
      await invoice.update({
        anafStatus: 'error',
        anafMessage: uploadResult.error
      });
    }

    res.json({
      success: uploadResult.success,
      message: uploadResult.success ? 'Invoice uploaded to ANAF' : 'Failed to upload invoice',
      data: {
        uploadId: uploadResult.uploadId,
        error: uploadResult.error
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Check invoice status with ANAF
router.get('/:companyId/invoice-status/:invoiceId', authMiddleware, requireCompanyAccess, async (req, res) => {
  try {
    const { companyId, invoiceId } = req.params;

    const invoice = await Invoice.findByPk(invoiceId);
    const config = await AnafConfig.findOne({ where: { companyId } });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (!config || !config.isConfigured) {
      return res.status(400).json({
        success: false,
        message: 'ANAF is not configured for this company'
      });
    }

    if (!invoice.anafUploadId) {
      return res.status(400).json({
        success: false,
        message: 'Invoice has not been uploaded to ANAF'
      });
    }

    // Check status
    const statusResult = await anafService.checkInvoiceStatus(
      invoice.anafUploadId,
      config.accessToken
    );

    // Record the message
    await AnafMessage.create({
      invoiceId,
      messageType: 'status_check',
      direction: 'received',
      status: statusResult.success ? 'success' : 'error',
      anafMessage: statusResult.message,
      responseData: JSON.stringify(statusResult.data)
    });

    if (statusResult.success) {
      // Update invoice status based on ANAF response
      if (statusResult.status === 'CONFIRMED' || statusResult.status === 'DELIVERED') {
        await invoice.update({
          anafStatus: 'confirmed',
          anafMessage: statusResult.message
        });
      }
    }

    res.json({
      success: statusResult.success,
      data: {
        status: statusResult.status,
        message: statusResult.message,
        details: statusResult.data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get ANAF messages for invoice
router.get('/:companyId/messages/:invoiceId', authMiddleware, requireCompanyAccess, async (req, res) => {
  try {
    const messages = await AnafMessage.findAll({
      where: { invoiceId: req.params.invoiceId },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

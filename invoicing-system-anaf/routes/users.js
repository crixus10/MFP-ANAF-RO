const express = require('express');
const User = require('../models/User');
const UserCompany = require('../models/UserCompany');
const { authMiddleware, requireCompanyAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, language } = req.body;

    const user = await req.user.update({
      firstName,
      lastName,
      language
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...user.toJSON(),
        password: undefined
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// List company users
router.get('/company/:companyId', authMiddleware, requireCompanyAccess, requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const userCompanies = await UserCompany.findAll({
      where: { companyId: req.params.companyId },
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
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

// Add user to company
router.post('/company/:companyId/invite', authMiddleware, requireCompanyAccess, requireRole(['owner']), async (req, res) => {
  try {
    const { email, role } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existing = await UserCompany.findOne({
      where: {
        userId: user.id,
        companyId: req.params.companyId
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'User already has access to this company'
      });
    }

    const userCompany = await UserCompany.create({
      userId: user.id,
      companyId: req.params.companyId,
      role: role || 'viewer'
    });

    res.json({
      success: true,
      message: 'User added to company successfully',
      data: userCompany
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Remove user from company
router.delete('/company/:companyId/users/:userId', authMiddleware, requireCompanyAccess, requireRole(['owner']), async (req, res) => {
  try {
    await UserCompany.destroy({
      where: {
        userId: req.params.userId,
        companyId: req.params.companyId
      }
    });

    res.json({
      success: true,
      message: 'User removed from company'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

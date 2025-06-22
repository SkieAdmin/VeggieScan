import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        settings: true,
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Get only the 5 most recent scans
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Count total scans
    const scanCounts = await prisma.scan.groupBy({
      by: ['isSafe'],
      where: { userId: req.user.id },
      _count: {
        id: true
      }
    });

    // Format the scan counts
    const goodScans = scanCounts.find(count => count.isSafe === true)?._count?.id || 0;
    const badScans = scanCounts.find(count => count.isSafe === false)?._count?.id || 0;

    // Remove password from response
    const { password, ...userData } = user;

    res.json({
      user: userData,
      scanStats: {
        total: goodScans + badScans,
        good: goodScans,
        bad: badScans
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  [
    authenticate,
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email')
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email } = req.body;

      // Check if email is already in use by another user
      if (email) {
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(409).json({ error: 'Email is already in use' });
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(name && { name }),
          ...(email && { email })
        }
      });

      // Remove password from response
      const { password, ...userData } = updatedUser;

      res.json({
        message: 'Profile updated successfully',
        user: userData
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/password',
  [
    authenticate,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      // Check if current password is correct
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
      });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/users/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put('/settings', authenticate, async (req, res, next) => {
  try {
    const { notificationsOn, darkModeEnabled, languagePreference } = req.body;

    // Update settings
    const updatedSettings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: {
        ...(notificationsOn !== undefined && { notificationsOn }),
        ...(darkModeEnabled !== undefined && { darkModeEnabled }),
        ...(languagePreference && { languagePreference })
      },
      create: {
        userId: req.user.id,
        ...(notificationsOn !== undefined && { notificationsOn }),
        ...(darkModeEnabled !== undefined && { darkModeEnabled }),
        ...(languagePreference && { languagePreference })
      }
    });

    res.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    next(error);
  }
});

export default router;

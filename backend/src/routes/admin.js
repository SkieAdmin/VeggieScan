import express from 'express';
import { prisma } from '../index.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';

const router = express.Router();

// Apply authentication and admin-only middleware to all routes in this router
router.use(authenticate, adminOnly);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/users', async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Search parameter
    const search = req.query.search || '';

    // Get users with pagination and search
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            scans: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Count total users for pagination
    const totalUsers = await prisma.user.count({
      where: {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } }
        ]
      }
    });

    // Format user data
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      scanCount: user._count.scans
    }));

    res.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        totalItems: totalUsers
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user details by ID (admin only)
 * @access  Private/Admin
 */
router.get('/users/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        _count: {
          select: {
            scans: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get scan statistics
    const scanCounts = await prisma.scan.groupBy({
      by: ['isSafe'],
      where: { userId },
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
      user: {
        ...userData,
        scanCount: userData._count.scans,
        scanStats: {
          total: goodScans + badScans,
          good: goodScans,
          bad: badScans
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user (admin only)
 * @access  Private/Admin
 */
router.put(
  '/users/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('role').optional().isIn(['USER', 'ADMIN']).withMessage('Role must be either USER or ADMIN')
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const { name, email, role } = req.body;

      // Check if user exists
      const userExists = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!userExists) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if email is already in use by another user
      if (email) {
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ error: 'Email is already in use' });
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(role && { role })
        }
      });

      // Remove password from response
      const { password, ...userData } = updatedUser;

      res.json({
        message: 'User updated successfully',
        user: userData
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (admin only)
 * @access  Private/Admin
 */
router.delete('/users/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting your own account
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/scans
 * @desc    Get all scans (admin only)
 * @access  Private/Admin
 */
router.get('/scans', async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const userId = req.query.userId ? parseInt(req.query.userId) : undefined;
    const vegetableName = req.query.vegetableName;
    const isSafe = req.query.isSafe !== undefined ? req.query.isSafe === 'true' : undefined;

    // Build filter object
    const filter = {
      ...(userId && { userId }),
      ...(vegetableName && { vegetableName }),
      ...(isSafe !== undefined && { isSafe })
    };

    // Get scans with pagination and filters
    const scans = await prisma.scan.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Count total scans for pagination
    const totalScans = await prisma.scan.count({
      where: filter
    });

    // Add image URLs to the scan results
    const scansWithImageUrls = scans.map(scan => ({
      ...scan,
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/${scan.imagePath}`
    }));

    res.json({
      scans: scansWithImageUrls,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalScans / limit),
        totalItems: totalScans
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/system/status
 * @desc    Get system status (admin only)
 * @access  Private/Admin
 */
router.get('/system/status', async (req, res, next) => {
  try {
    // Get counts
    const userCount = await prisma.user.count();
    const scanCount = await prisma.scan.count();
    const datasetCount = await prisma.dataset.count();

    // Get scan statistics
    const scanCounts = await prisma.scan.groupBy({
      by: ['isSafe'],
      _count: {
        id: true
      }
    });

    // Format the scan counts
    const goodScans = scanCounts.find(count => count.isSafe === true)?._count?.id || 0;
    const badScans = scanCounts.find(count => count.isSafe === false)?._count?.id || 0;

    // Get most common vegetables
    const commonVegetables = await prisma.scan.groupBy({
      by: ['vegetableName'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    // Get most common diseases
    const commonDiseases = await prisma.scan.groupBy({
      by: ['diseaseName'],
      where: {
        diseaseName: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    // Get recent activity
    const recentScans = await prisma.scan.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      counts: {
        users: userCount,
        scans: scanCount,
        dataset: datasetCount
      },
      scanStats: {
        total: goodScans + badScans,
        good: goodScans,
        bad: badScans,
        ratio: scanCount > 0 ? (goodScans / scanCount) * 100 : 0
      },
      commonVegetables: commonVegetables.map(veg => ({
        name: veg.vegetableName,
        count: veg._count.id
      })),
      commonDiseases: commonDiseases.map(disease => ({
        name: disease.diseaseName || 'Unknown',
        count: disease._count.id
      })),
      recentActivity: recentScans.map(scan => ({
        id: scan.id,
        userId: scan.userId,
        userName: scan.user.name,
        vegetableName: scan.vegetableName,
        isSafe: scan.isSafe,
        createdAt: scan.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;

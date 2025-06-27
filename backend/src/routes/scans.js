import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';
import { generateUniqueFilename } from '../utils/fileSystem.js';
import { analyzeVegetableImage } from '../services/llmService.js';

const router = express.Router();

// Get current file directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', process.env.UPLOAD_PATH || 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname));
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  }
});

/**
 * @route   POST /api/scans/upload
 * @desc    Upload and analyze a vegetable image
 * @access  Private
 */
router.post('/upload', authenticate, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Get the uploaded file path
    const imagePath = req.file.filename;
    
    // Analyze the image using LLM
    const analysisResult = await analyzeVegetableImage(
      `${req.protocol}://${req.get('host')}/uploads/${imagePath}`
    );

    // If the image is not a vegetable
    if (analysisResult.vegetableName === 'invalid_image') {
      return res.status(400).json({
        error: 'Invalid image',
        message: 'The uploaded image does not appear to be a vegetable'
      });
    }

    // Save the scan result to database
    const scan = await prisma.scan.create({
      data: {
        userId: req.user.id,
        vegetableName: analysisResult.vegetableName,
        isSafe: analysisResult.safeToEat,
        diseaseName: analysisResult.diseaseName || null,
        recommendation: analysisResult.recommendation,
        imagePath: imagePath,
        freshnessLevel: analysisResult.freshnessLevel || 'NOT_RECOMMENDED',
        freshnessScore: analysisResult.freshnessScore || 0
      }
    });

    // Also save to dataset for future reference
    await prisma.dataset.create({
      data: {
        vegetableName: analysisResult.vegetableName,
        isSafe: analysisResult.safeToEat,
        diseaseName: analysisResult.diseaseName || null,
        recommendation: analysisResult.recommendation,
        imagePath: imagePath,
        freshnessLevel: analysisResult.freshnessLevel || 'NOT_RECOMMENDED',
        freshnessScore: analysisResult.freshnessScore || 0
      }
    });

    res.status(201).json({
      message: 'Image analyzed successfully',
      scan: {
        ...scan,
        imageUrl: `${req.protocol}://${req.get('host')}/uploads/${imagePath}`
      },
      analysis: analysisResult
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/scans
 * @desc    Get all scans for the current user
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get scans with pagination
    const scans = await prisma.scan.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Count total scans for pagination
    const totalScans = await prisma.scan.count({
      where: { userId: req.user.id }
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
 * @route   GET /api/scans/:id
 * @desc    Get a specific scan by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const scanId = parseInt(req.params.id);
    
    if (isNaN(scanId)) {
      return res.status(400).json({ error: 'Invalid scan ID' });
    }

    // Get the scan
    const scan = await prisma.scan.findUnique({
      where: { id: scanId }
    });

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    // Check if the scan belongs to the current user
    if (scan.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add image URL to the scan result
    const scanWithImageUrl = {
      ...scan,
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/${scan.imagePath}`
    };

    res.json(scanWithImageUrl);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/scans/:id
 * @desc    Delete a scan
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const scanId = parseInt(req.params.id);
    
    if (isNaN(scanId)) {
      return res.status(400).json({ error: 'Invalid scan ID' });
    }

    // Get the scan to check ownership
    const scan = await prisma.scan.findUnique({
      where: { id: scanId }
    });

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    // Check if the scan belongs to the current user
    if (scan.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete the scan
    await prisma.scan.delete({
      where: { id: scanId }
    });

    res.json({ message: 'Scan deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/scans/stats/summary
 * @desc    Get scan statistics summary for the current user
 * @access  Private
 */
router.get('/stats/summary', authenticate, async (req, res, next) => {
  try {
    // Count total scans
    const scanCounts = await prisma.scan.groupBy({
      by: ['isSafe'],
      where: { userId: req.user.id },
      _count: {
        id: true
      }
    });

    // Count scans by freshness level
    const freshnessCounts = await prisma.scan.groupBy({
      by: ['freshnessLevel'],
      where: { userId: req.user.id },
      _count: {
        id: true
      }
    });

    // Format the scan counts
    const goodScans = scanCounts.find(count => count.isSafe === true)?._count?.id || 0;
    const badScans = scanCounts.find(count => count.isSafe === false)?._count?.id || 0;

    // Format freshness counts
    const goodFreshness = freshnessCounts.find(count => count.freshnessLevel === 'GOOD')?._count?.id || 0;
    const acceptableFreshness = freshnessCounts.find(count => count.freshnessLevel === 'ACCEPTABLE')?._count?.id || 0;
    const notRecommendedFreshness = freshnessCounts.find(count => count.freshnessLevel === 'NOT_RECOMMENDED')?._count?.id || 0;

    // Get average freshness score
    const avgFreshnessResult = await prisma.scan.aggregate({
      where: { 
        userId: req.user.id,
        freshnessScore: {
          not: null
        }
      },
      _avg: {
        freshnessScore: true
      }
    });

    // Get most recent scan
    const recentScan = await prisma.scan.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Get most common vegetables
    const commonVegetables = await prisma.scan.groupBy({
      by: ['vegetableName'],
      where: { userId: req.user.id },
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

    res.json({
      totalScans: goodScans + badScans,
      goodScans,
      badScans,
      freshness: {
        good: goodFreshness,
        acceptable: acceptableFreshness,
        notRecommended: notRecommendedFreshness,
        averageScore: Math.round(avgFreshnessResult._avg.freshnessScore || 0)
      },
      recentScan: recentScan ? {
        ...recentScan,
        imageUrl: `${req.protocol}://${req.get('host')}/uploads/${recentScan.imagePath}`
      } : null,
      commonVegetables: commonVegetables.map(veg => ({
        name: veg.vegetableName,
        count: veg._count.id
      }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;

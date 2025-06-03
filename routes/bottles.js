const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const AIService = require('../services/aiService');
const Bottle = require('../models/Bottle');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const aiService = new AIService();

router.post('/scan', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image provided' 
      });
    }

    const resizedImage = await sharp(req.file.buffer)
      .resize(1024, 1024, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toBuffer();

    const imageBase64 = resizedImage.toString('base64');
    
    const extractedData = await aiService.extractWineData(imageBase64);
    
    if (extractedData.confidence === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Could not extract wine data from image',
        fallback: true,
        extractedData
      });
    }

    const enrichedData = await aiService.enrichWineData(extractedData);
    
    const finalWineData = {
      ...extractedData,
      description: enrichedData.description
    };

    res.json({
      success: true,
      wineData: finalWineData,
      confidence: extractedData.confidence,
      canSave: extractedData.confidence > 0.3
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process image: ' + error.message 
    });
  }
});

router.post('/save', auth, async (req, res) => {
  try {
    const { wineData, wsetNotes, rating, personalNotes, imageUrl } = req.body;

    if (!wineData || !wineData.name || !wineData.winemaker) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wine name and winemaker are required' 
      });
    }

    const bottle = new Bottle({
      userId: req.userId,
      wineData: {
        name: wineData.name,
        winemaker: wineData.winemaker,
        vintage: wineData.vintage,
        country: wineData.country,
        region: wineData.region,
        wineType: wineData.wineType || 'red',
        alcoholContent: wineData.alcoholContent,
        grapeVariety: wineData.grapeVariety || [],
        description: wineData.description
      },
      imageUrl: imageUrl || null,
      aiData: {
        confidence: wineData.confidence || 0,
        extractedText: wineData.extractedText,
        processingTime: wineData.processingTime
      },
      personalData: {
        rating: rating || null,
        personalNotes: personalNotes || null,
        isPublic: false
      },
      wsetNotes: wsetNotes || {},
      coinsEarned: 10
    });

    await bottle.save();

    let bonusCoins = 0;
    if (rating) bonusCoins += 5;
    if (wsetNotes && Object.keys(wsetNotes).length > 0) bonusCoins += 10;
    if (personalNotes && personalNotes.length > 10) bonusCoins += 5;

    const totalCoins = 10 + bonusCoins;

    await User.findByIdAndUpdate(req.userId, {
      $inc: { 
        'profile.coins': totalCoins, 
        'profile.totalBottles': 1 
      }
    });

    res.json({ 
      success: true, 
      bottle,
      coinsEarned: totalCoins,
      breakdown: {
        base: 10,
        rating: rating ? 5 : 0,
        wsetNotes: Object.keys(wsetNotes || {}).length > 0 ? 10 : 0,
        personalNotes: (personalNotes && personalNotes.length > 10) ? 5 : 0
      }
    });

  } catch (error) {
    console.error('Save bottle error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save bottle' 
    });
  }
});

router.get('/collection', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, wineType, rating } = req.query;
    
    const query = { userId: req.userId };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (wineType && wineType !== 'all') {
      query['wineData.wineType'] = wineType;
    }
    
    if (rating) {
      query['personalData.rating'] = { $gte: parseInt(rating) };
    }

    const bottles = await Bottle.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bottle.countDocuments(query);

    res.json({
      success: true,
      bottles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get collection' 
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const bottle = await Bottle.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!bottle) {
      return res.status(404).json({ 
        success: false, 
        error: 'Bottle not found' 
      });
    }

    res.json({
      success: true,
      bottle
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get bottle' 
    });
  }
});

module.exports = router;

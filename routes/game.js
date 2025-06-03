const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/vineyard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const hoursOffline = Math.floor(
      (Date.now() - user.gameData.lastHarvest) / (1000 * 60 * 60)
    );
    
    const coinsPerHour = user.gameData.vineyardLevel;
    const maxOfflineHours = 24;
    const idleEarnings = Math.min(hoursOffline * coinsPerHour, maxOfflineHours * coinsPerHour);
    
    const upgradeCost = user.gameData.vineyardLevel * 50;
    const canUpgrade = user.profile.coins >= upgradeCost;
    
    res.json({
      success: true,
      vineyard: {
        level: user.gameData.vineyardLevel,
        coinsPerHour,
        idleEarnings,
        hoursOffline: Math.min(hoursOffline, maxOfflineHours),
        upgradeCost,
        canUpgrade,
        totalHarvests: user.gameData.totalHarvests
      },
      user: {
        coins: user.profile.coins,
        totalBottles: user.profile.totalBottles
      }
    });

  } catch (error) {
    console.error('Get vineyard error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get vineyard status' 
    });
  }
});

router.post('/harvest', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const hoursOffline = Math.floor(
      (Date.now() - user.gameData.lastHarvest) / (1000 * 60 * 60)
    );
    
    if (hoursOffline < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'Must wait at least 1 hour between harvests' 
      });
    }

    const coinsPerHour = user.gameData.vineyardLevel;
    const maxOfflineHours = 24;
    const earnings = Math.min(hoursOffline * coinsPerHour, maxOfflineHours * coinsPerHour);

    await User.findByIdAndUpdate(req.userId, {
      $inc: { 
        'profile.coins': earnings,
        'gameData.totalHarvests': 1
      },
      $set: {
        'gameData.lastHarvest': new Date()
      }
    });

    res.json({
      success: true,
      coinsEarned: earnings,
      hoursOffline: Math.min(hoursOffline, maxOfflineHours),
      newCoinBalance: user.profile.coins + earnings
    });

  } catch (error) {
    console.error('Harvest error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to harvest coins' 
    });
  }
});

router.post('/upgrade', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const upgradeCost = user.gameData.vineyardLevel * 50;
    
    if (user.profile.coins < upgradeCost) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient coins. Need ${upgradeCost} coins.` 
      });
    }

    const newLevel = user.gameData.vineyardLevel + 1;
    const newCoinBalance = user.profile.coins - upgradeCost;

    await User.findByIdAndUpdate(req.userId, {
      $set: {
        'profile.coins': newCoinBalance,
        'gameData.vineyardLevel': newLevel
      }
    });

    res.json({
      success: true,
      newLevel,
      coinsSpent: upgradeCost,
      newCoinBalance,
      nextUpgradeCost: newLevel * 50
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upgrade vineyard' 
    });
  }
});

module.exports = router;

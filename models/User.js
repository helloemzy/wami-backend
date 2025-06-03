const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    coins: {
      type: Number,
      default: 50
    },
    totalBottles: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    }
  },
  gameData: {
    vineyardLevel: {
      type: Number,
      default: 1
    },
    lastHarvest: {
      type: Date,
      default: Date.now
    },
    totalHarvests: {
      type: Number,
      default: 0
    }
  },
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    privacy: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'friends'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

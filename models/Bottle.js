const mongoose = require('mongoose');

const bottleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wineData: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    winemaker: {
      type: String,
      required: true,
      trim: true
    },
    vintage: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear() + 2
    },
    country: {
      type: String,
      trim: true
    },
    region: {
      type: String,
      trim: true
    },
    wineType: {
      type: String,
      enum: ['red', 'white', 'rosé', 'sparkling', 'fortified', 'dessert'],
      required: true
    },
    alcoholContent: {
      type: Number,
      min: 0,
      max: 50
    },
    grapeVariety: [String],
    description: String
  },
  imageUrl: String,
  aiData: {
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    extractedText: String,
    processingTime: Number
  },
  personalData: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    personalNotes: String,
    acquisitionDate: {
      type: Date,
      default: Date.now
    },
    acquisitionLocation: String,
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  wsetNotes: {
    appearance: {
      clarity: {
        type: String,
        enum: ['clear', 'hazy']
      },
      intensity: {
        type: String,
        enum: ['pale', 'medium', 'deep']
      },
      color: String,
      otherObservations: String
    },
    nose: {
      condition: {
        type: String,
        enum: ['clean', 'unclean']
      },
      intensity: {
        type: String,
        enum: ['light', 'medium(-)', 'medium', 'medium(+)', 'pronounced']
      },
      aromaCharacteristics: [String],
      development: {
        type: String,
        enum: ['youthful', 'developing', 'fully developed', 'tired/past its best']
      }
    },
    palate: {
      sweetness: {
        type: String,
        enum: ['dry', 'off-dry', 'medium-dry', 'medium-sweet', 'sweet', 'luscious']
      },
      acidity: {
        type: String,
        enum: ['low', 'medium(-)', 'medium', 'medium(+)', 'high']
      },
      tannin: {
        type: String,
        enum: ['low', 'medium(-)', 'medium', 'medium(+)', 'high']
      },
      alcohol: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      body: {
        type: String,
        enum: ['light', 'medium(-)', 'medium', 'medium(+)', 'full']
      },
      flavorCharacteristics: [String],
      finish: {
        type: String,
        enum: ['short', 'medium(-)', 'medium', 'medium(+)', 'long']
      }
    },
    conclusions: {
      qualityLevel: {
        type: String,
        enum: ['faulty', 'poor', 'acceptable', 'good', 'very good', 'outstanding']
      },
      readinessLevel: {
        type: String,
        enum: ['drink now', 'not suitable for ageing', 'has potential', 'suitable for ageing', 'too old']
      }
    }
  },
  coinsEarned: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

bottleSchema.index({
  'wineData.name': 'text',
  'wineData.winemaker': 'text',
  'wineData.country': 'text',
  'personalData.personalNotes': 'text'
});

module.exports = mongoose.model('Bottle', bottleSchema);

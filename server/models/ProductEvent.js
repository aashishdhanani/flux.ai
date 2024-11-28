const mongoose = require('mongoose');

const ProductEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: { 
    type: String, 
    required: true,
    index: true 
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  platform: {
    type: String,
    required: true,
    index: true
  },
  productUrl: {
    type: String,
    required: true
  },
  productTitle: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

ProductEventSchema.index({ userId: 1, timestamp: -1 });
ProductEventSchema.index({ platform: 1, userId: 1 });
ProductEventSchema.index({ sessionId: 1, timestamp: -1 });

module.exports = mongoose.model('ProductEvent', ProductEventSchema);
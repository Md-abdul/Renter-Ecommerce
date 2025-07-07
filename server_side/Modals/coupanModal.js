const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  couponCode: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  discountPercentage: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  minimumPurchaseAmount: { 
    type: Number, 
    required: true,
    min: 0
  },
  maxDiscountAmount: { 
    type: Number, 
    required: true,
    min: 0
  },
  expiryDate: { 
    type: Date, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  usageLimit: { 
    type: Number, 
    default: 1 
  },
  usedCount: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add a pre-save hook to automatically deactivate if expired
couponSchema.pre('save', function(next) {
  const now = new Date();
  const istOffset = 330 * 60 * 1000; // IST is UTC+5:30
  const istNow = new Date(now.getTime() + istOffset);
  
  if (this.expiryDate < istNow) {
    this.isActive = false;
  }
  next();
});

const CouponModel = mongoose.model("coupon", couponSchema);

module.exports = CouponModel;
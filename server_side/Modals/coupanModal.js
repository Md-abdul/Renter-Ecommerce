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

const CouponModel = mongoose.model("coupon", couponSchema);

module.exports = CouponModel;

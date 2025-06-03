const express = require('express');
const CouponModel = require('../Modals/coupanModal');
const { UserModel } = require('../Modals/UserModal');
const { verifyToken, verifyAdmin } = require('../Middlewares/VerifyToken');

const couponRoutes = express.Router();

// Get all coupons (admin only)
couponRoutes.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const coupons = await CouponModel.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new coupon (admin only)
couponRoutes.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {
      couponCode,
      discountPercentage,
      minimumPurchaseAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await CouponModel.findOne({ couponCode: couponCode.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new CouponModel({
      couponCode: couponCode.toUpperCase(),
      discountPercentage,
      minimumPurchaseAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update coupon (admin only)
couponRoutes.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If updating coupon code, check for duplicates
    if (updateData.couponCode) {
      const existingCoupon = await CouponModel.findOne({
        couponCode: updateData.couponCode.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
      updateData.couponCode = updateData.couponCode.toUpperCase();
    }

    const coupon = await CouponModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete coupon (admin only)
couponRoutes.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await CouponModel.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply coupon
couponRoutes.post('/apply', verifyToken, async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user.userId;

    // Find the coupon
    const coupon = await CouponModel.findOne({
      couponCode: couponCode.toUpperCase(),
      isActive: true,
      expiryDate: { $gt: new Date() }
    });

    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or expired coupon code' });
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Get user's cart from the request
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate cart total from the cart items
    let cartTotal = 0;
    if (user.cart && user.cart instanceof Map) {
      cartTotal = Array.from(user.cart.values()).reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    }

    // Check minimum purchase amount
    if (cartTotal < coupon.minimumPurchaseAmount) {
      return res.status(400).json({
        message: `Minimum purchase amount of ₹${coupon.minimumPurchaseAmount} required`
      });
    }

    // Return the coupon details
    res.status(200).json({
      message: 'Coupon applied successfully',
      coupon: {
        couponCode: coupon.couponCode,
        discountPercentage: coupon.discountPercentage,
        maxDiscountAmount: coupon.maxDiscountAmount,
        minimumPurchaseAmount: coupon.minimumPurchaseAmount
      }
    });
  } catch (error) {
    console.error('Coupon application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = { couponRoutes }; 
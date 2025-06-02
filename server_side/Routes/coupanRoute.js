const express = require("express");
const coupanRoutes = express.Router();
const coupanModal = require("../Modals/coupanModal");

// Create a new coupon
coupanRoutes.post("/create", async (req, res) => {
  try {
    const {
      coupanCode,
      discountPercentage,
      minimumPurchaseAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit
    } = req.body;

    const newCoupon = new coupanModal({
      coupanCode,
      discountPercentage,
      minimumPurchaseAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit
    });

    await newCoupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ message: "Error creating coupon", error: error.message });
  }
});

// Get all coupons
coupanRoutes.get("/all", async (req, res) => {
  try {
    const coupons = await coupanModal.find();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coupons", error: error.message });
  }
});

// Validate and apply coupon
coupanRoutes.post("/validate", async (req, res) => {
  try {
    const { coupanCode, totalAmount } = req.body;
    const coupon = await coupanModal.findOne({ coupanCode });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "Coupon is inactive" });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (totalAmount < coupon.minimumPurchaseAmount) {
      return res.status(400).json({ 
        message: `Minimum purchase amount of ₹${coupon.minimumPurchaseAmount} required` 
      });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    const discountAmount = Math.min(
      (totalAmount * coupon.discountPercentage) / 100,
      coupon.maxDiscountAmount
    );

    res.status(200).json({
      message: "Coupon is valid",
      discountAmount,
      coupon
    });
  } catch (error) {
    res.status(500).json({ message: "Error validating coupon", error: error.message });
  }
});

// Update coupon status
coupanRoutes.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const coupon = await coupanModal.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({ message: "Coupon status updated", coupon });
  } catch (error) {
    res.status(500).json({ message: "Error updating coupon status", error: error.message });
  }
});

// Delete coupon
coupanRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await coupanModal.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting coupon", error: error.message });
  }
});

module.exports = { coupanRoutes };

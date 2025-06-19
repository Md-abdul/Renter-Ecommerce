const express = require("express");
const { verifyToken } = require("../Middlewares/VerifyToken");
const { verifyAdmin } = require("../Middlewares/VerifyAdmin");
const {
  initiatePayment,
  verifyPayment,
} = require("../Services/phonepeService");
const { OrderModel } = require("../Modals/UserModal");

const PaymentRoutes = express.Router();

// Initiate PhonePe payment
PaymentRoutes.post("/initiate", verifyToken, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const userId = req.user.userId;

    if (!amount || !orderId) {
      return res
        .status(400)
        .json({ message: "Amount and orderId are required" });
    }

    // Check if order exists
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if payment is already initiated
    if (order.paymentDetails?.paymentStatus === "INITIATED") {
      // If payment was initiated more than 30 minutes ago, allow retry
      const initiatedAt = new Date(order.paymentDetails.initiatedAt);
      const now = new Date();
      const diffInMinutes = (now - initiatedAt) / (1000 * 60);

      if (diffInMinutes < 30) {
        // If we have a stored payment URL, return it
        if (order.paymentDetails.paymentUrl) {
          return res.status(200).json({
            success: true,
            data: {
              instrumentResponse: {
                redirectInfo: {
                  url: order.paymentDetails.paymentUrl
                }
              }
            }
          });
        }
      }
    }

    // Generate a unique merchant transaction ID
    const merchantTransactionId = `ORDER_${orderId}_${Date.now()}`;

    // Initiate payment
    const paymentResponse = await initiatePayment(
      amount,
      merchantTransactionId,
      userId
    );

    if (!paymentResponse.success) {
      return res.status(400).json({
        success: false,
        message: "Payment initiation failed",
        error: paymentResponse.error,
      });
    }

    // Store the payment URL
    const paymentUrl = paymentResponse.data.instrumentResponse.redirectInfo.url;

    // Update order with payment details
    await OrderModel.findByIdAndUpdate(orderId, {
      paymentDetails: {
        merchantTransactionId,
        paymentStatus: "INITIATED",
        paymentMethod: "PHONEPE",
        amount: amount,
        initiatedAt: new Date(),
        paymentUrl: paymentUrl
      },
    });

    res.status(200).json({
      success: true,
      data: paymentResponse.data,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({
      success: false,
      message: "Payment initiation failed",
      error: error.message,
    });
  }
});

// Verify payment
PaymentRoutes.post("/verify", verifyToken, async (req, res) => {
  try {
    const { merchantTransactionId, orderId } = req.body;

    if (!merchantTransactionId || !orderId) {
      return res
        .status(400)
        .json({ message: "Merchant transaction ID and order ID are required" });
    }

    // Verify payment with PhonePe
    const verificationResponse = await verifyPayment(merchantTransactionId);

    if (!verificationResponse.success) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
        error: verificationResponse.error,
      });
    }

    // Update order status based on payment verification
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const paymentStatus = verificationResponse.data.state === "COMPLETED" ? "COMPLETED" : "FAILED";

    // Update order with payment verification details
    order.paymentDetails = {
      ...order.paymentDetails,
      paymentStatus,
      transactionId: merchantTransactionId,
      verificationResponse: verificationResponse.data,
      verifiedAt: new Date(),
    };

    // If payment is successful, update order status
    if (paymentStatus === "COMPLETED") {
      order.status = "CONFIRMED";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Payment ${paymentStatus.toLowerCase()}`,
      data: verificationResponse.data,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
});

// Get all payments (Admin only)
PaymentRoutes.get("/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await OrderModel.find({
      "paymentDetails.paymentStatus": { $exists: true }
    })
    .sort({ "paymentDetails.initiatedAt": -1 })
    .select("paymentDetails status totalAmount user createdAt");

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
});

// Get payment details by order ID (Admin only)
PaymentRoutes.get("/order/:orderId", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderModel.findById(orderId)
      .select("paymentDetails status totalAmount user createdAt");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message,
    });
  }
});

module.exports = { PaymentRoutes };

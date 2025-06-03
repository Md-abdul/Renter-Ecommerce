const express = require("express");
const { verifyToken } = require("../Middlewares/VerifyToken");
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

    // Generate a unique merchant transaction ID
    const merchantTransactionId = `ORDER_${orderId}_${Date.now()}`;

    // Initiate payment
    const paymentResponse = await initiatePayment(
      amount,
      merchantTransactionId,
      userId
    );

    // Update order with payment details
    await OrderModel.findByIdAndUpdate(orderId, {
      paymentDetails: {
        merchantTransactionId,
        paymentStatus: "INITIATED",
        paymentMethod: "PHONEPE",
      },
    });

    // Check if payment response has the required data
    if (!paymentResponse.data || !paymentResponse.data.instrumentResponse) {
      throw new Error("Invalid payment response from PhonePe");
    }

    res.status(200).json({
      success: true,
      data: paymentResponse.data,
    });
  } catch (error) {
    console.error(
      "Payment initiation error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Payment initiation failed",
      error: error.response?.data?.message || error.message,
    });
  }
});

// Verify PhonePe payment
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

    // Update order status based on payment verification
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (verificationResponse.success) {
      order.paymentDetails = {
        ...order.paymentDetails,
        paymentStatus: "COMPLETED",
        transactionId: merchantTransactionId,
        verificationResponse: verificationResponse,
      };
      order.status = "processing"; // Update order status
      await order.save();

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: verificationResponse,
      });
    } else {
      order.paymentDetails = {
        ...order.paymentDetails,
        paymentStatus: "FAILED",
        transactionId: merchantTransactionId,
        verificationResponse: verificationResponse,
      };
      await order.save();

      res.status(400).json({
        success: false,
        message: "Payment verification failed",
        data: verificationResponse,
      });
    }
  } catch (error) {
    console.error(
      "Payment verification error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.response?.data?.message || error.message,
    });
  }
});

module.exports = { PaymentRoutes };

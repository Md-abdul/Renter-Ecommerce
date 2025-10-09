// Routes/phonepeRoutes.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const { verifyToken } = require("../Middlewares/VerifyToken");
const { UserModel, OrderModel } = require("../Modals/UserModal");
const PaymentTransactionModel = require("../Modals/paymentModal");

// Production PhonePe configuration
const PHONEPE_HOST =
  process.env.NODE_ENV === "production"
    ? "https://api.phonepe.com/apis/pg-sandbox" // Use production URL when ready
    : "https://api-preprod.phonepe.com/apis/pg-sandbox";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

/**
 * ✅ Utility to build checksum (X-VERIFY)
 * Formula:
 *   SHA256( base64EncodedPayload + "/pg/v1/pay" + SALT_KEY ) + "###" + SALT_INDEX
 */
function buildPhonePeChecksum(encodedReq, uri = "/pg/v1/pay") {
  const payload = encodedReq + uri + SALT_KEY;
  const sha = crypto.createHash("sha256").update(payload).digest("hex");
  return `${sha}###${SALT_INDEX}`;
}

/**
 * ✅ Utility to verify PhonePe response checksum
 */
function verifyPhonePeChecksum(
  encodedResponse,
  checksum,
  uri = "/pg/v1/status"
) {
  const payload = encodedResponse + uri + SALT_KEY;
  const sha = crypto.createHash("sha256").update(payload).digest("hex");
  const expectedChecksum = `${sha}###${SALT_INDEX}`;
  return expectedChecksum === checksum;
}

/**
 * 📌 Create a PhonePe order and return the redirect payment URL
 * POST /api/phonepe/createOrder
 * body: { shippingAddress, couponCode }
 */
router.post("/createOrder", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shippingAddress, couponCode } = req.body;

    // Validate required fields
    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.address ||
      !shippingAddress.address.street ||
      !shippingAddress.address.city ||
      !shippingAddress.address.zipCode ||
      !shippingAddress.phoneNumber
    ) {
      return res.status(400).json({
        message: "Missing required shipping information",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.cart.size === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Convert cart items to array
    const items = Array.from(user.cart.values()).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      image: item.image,
      size: item.size,
      color: item.color,
      sku: item.sku,
      packageWeight: item.packageWeight,
      packageLength: item.packageLength,
      packageBreadth: item.packageBreadth,
      packageHeight: item.packageHeight,
    }));

    // Calculate total amount
    let totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Apply coupon if provided
    let appliedCoupon = null;
    let discountAmount = 0;

    if (couponCode) {
      const CouponModel = require("../Modals/coupanModal");
      const coupon = await CouponModel.findOne({
        couponCode: couponCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gt: new Date() },
      });

      if (coupon) {
        if (totalAmount >= coupon.minimumPurchaseAmount) {
          discountAmount = (totalAmount * coupon.discountPercentage) / 100;
          const finalDiscount = Math.min(
            discountAmount,
            coupon.maxDiscountAmount
          );
          totalAmount -= finalDiscount;
          appliedCoupon = coupon;
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // Create order with pending status
    const order = new OrderModel({
      userId,
      items,
      totalAmount,
      shippingAddress: {
        name: shippingAddress.name,
        address: {
          street: shippingAddress.address.street || "",
          city: shippingAddress.address.city || "",
          zipCode: shippingAddress.address.zipCode || "",
          state: shippingAddress.address.state || "",
          alternatePhone: shippingAddress.address.alternatePhone || "",
          addressType: shippingAddress.address.addressType || "home",
        },
        phoneNumber: shippingAddress.phoneNumber || "",
      },
      paymentMethod: "phonepe",
      status: "pending",
      orderNumber: await getNextOrderNumber(),
      appliedCoupon: appliedCoupon
        ? {
            couponCode: appliedCoupon.couponCode,
            discountPercentage: appliedCoupon.discountPercentage,
            discountAmount: discountAmount,
          }
        : null,
    });

    await order.save();

    // Generate unique merchant transaction ID
    const merchantTransactionId = `ORD_${order._id}_${Date.now()}`;

    // Convert amount to paise
    const amountPaise = Math.round(Number(totalAmount) * 100);

    // Create redirect URL
    const redirectUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/phonepe-callback?merchantTransactionId=${merchantTransactionId}`;

    // ✅ Payment payload
    const requestBody = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      amount: amountPaise,
      redirectUrl,
      redirectMode: "POST",
      merchantUserId: userId.toString(),
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // Base64 encode the payload
    const requestStr = JSON.stringify(requestBody);
    const encodedReq = Buffer.from(requestStr).toString("base64");

    // Build checksum
    const checksum = buildPhonePeChecksum(encodedReq);

    const phonepeUrl = `${PHONEPE_HOST}/pg/v1/pay`;

    // Call PhonePe API
    const resp = await axios.post(
      phonepeUrl,
      { request: encodedReq },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          accept: "application/json",
        },
        timeout: 15000,
      }
    );

    const data = resp.data;
    if (!data || !data.success) {
      console.error("PhonePe createOrder error:", data);
      // Delete the order if payment initiation fails
      await OrderModel.findByIdAndDelete(order._id);
      return res
        .status(500)
        .json({ message: "PhonePe returned error", phonepe: data });
    }

    // Extract redirect URL
    const redirectInfo = data?.data?.instrumentResponse?.redirectInfo;
    const paymentUrl =
      redirectInfo?.url || data?.data?.redirectInfo?.url || null;

    if (!paymentUrl) {
      // Delete the order if no payment URL
      await OrderModel.findByIdAndDelete(order._id);
      return res.status(500).json({
        message: "Could not find redirect URL in PhonePe response",
        phonepe: data,
      });
    }

    // Create payment transaction record
    const paymentTransaction = new PaymentTransactionModel({
      orderId: order._id,
      userId: userId,
      merchantTransactionId: merchantTransactionId,
      amount: totalAmount,
      paymentStatus: "INITIATED",
      phonepeResponse: data,
      userDetails: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      productDetails: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        color: item.color,
        size: item.size,
      })),
    });

    await paymentTransaction.save();

    return res.json({
      paymentUrl,
      orderId: order._id,
      merchantTransactionId: merchantTransactionId,
      amount: totalAmount,
      raw: data,
    });
  } catch (err) {
    console.error(
      "PhonePe createOrder error:",
      err?.response?.data || err.message || err
    );
    return res.status(500).json({
      message: "Server error creating PhonePe order",
      error: err?.response?.data || err.message,
    });
  }
});

// Helper function to generate order number
const getNextOrderNumber = async () => {
  try {
    const { CounterModel } = require("../Modals/UserModal");
    const counter = await CounterModel.findByIdAndUpdate(
      "orderNumber",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return `${String(counter.seq).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating order number:", error);
    throw new Error("Failed to generate order number");
  }
};

/**
 * 📌 Payment verification endpoint
 * POST /api/phonepe/verify
 */
router.post("/verify", async (req, res) => {
  try {
    const { merchantTransactionId } = req.body;

    if (!merchantTransactionId) {
      return res
        .status(400)
        .json({ message: "merchantTransactionId is required" });
    }

    // Find payment transaction
    const paymentTransaction = await PaymentTransactionModel.findOne({
      merchantTransactionId: merchantTransactionId,
    }).populate("orderId");

    if (!paymentTransaction) {
      return res.status(404).json({ message: "Payment transaction not found" });
    }

    // Verify payment with PhonePe
    const requestBody = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
    };

    const requestStr = JSON.stringify(requestBody);
    const encodedReq = Buffer.from(requestStr).toString("base64");
    const checksum = buildPhonePeChecksum(encodedReq, "/pg/v1/status");

    const phonepeUrl = `${PHONEPE_HOST}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;

    const resp = await axios.get(phonepeUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": MERCHANT_ID,
        accept: "application/json",
      },
      timeout: 15000,
    });

    const data = resp.data;

    if (!data || !data.success) {
      return res.status(500).json({
        message: "PhonePe verification failed",
        phonepe: data,
      });
    }

    // Verify checksum
    const responseChecksum = resp.headers["x-verify"];
    const encodedResponse = Buffer.from(JSON.stringify(data.data)).toString(
      "base64"
    );

    if (!verifyPhonePeChecksum(encodedResponse, responseChecksum)) {
      return res.status(400).json({ message: "Checksum verification failed" });
    }

    const paymentInfo = data.data;
    const isPaymentSuccessful = paymentInfo.state === "COMPLETED";

    // Update payment transaction
    paymentTransaction.paymentStatus = isPaymentSuccessful
      ? "COMPLETED"
      : "FAILED";
    paymentTransaction.phonepeTransactionId = paymentInfo.transactionId;
    paymentTransaction.verificationResponse = data;
    paymentTransaction.completedAt = new Date();
    await paymentTransaction.save();

    if (isPaymentSuccessful) {
      // Update order status
      const order = paymentTransaction.orderId;
      if (order) {
        order.status = "processing";
        order.paymentDetails = {
          merchantTransactionId: merchantTransactionId,
          paymentStatus: "COMPLETED",
          transactionId: paymentInfo.transactionId,
          verificationResponse: data,
        };
        await order.save();

        // Clear user's cart
        const user = await UserModel.findById(paymentTransaction.userId);
        if (user) {
          user.cart = new Map();
          await user.save();
        }

        // Send order confirmation email
        try {
          const {
            sendOrderConfirmationEmail,
          } = require("../utils/orderProdctService");
          await sendOrderConfirmationEmail(order._id);
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
        }
      }
    } else {
      // Payment failed - delete the order
      if (paymentTransaction.orderId) {
        await OrderModel.findByIdAndDelete(paymentTransaction.orderId._id);
      }
    }

    return res.json({
      success: isPaymentSuccessful,
      paymentStatus: paymentTransaction.paymentStatus,
      orderId: paymentTransaction.orderId?._id,
      transactionId: paymentInfo.transactionId,
      data: paymentInfo,
    });
  } catch (err) {
    console.error(
      "Payment verification error:",
      err?.response?.data || err.message
    );
    return res.status(500).json({
      message: "Server error during payment verification",
      error: err?.response?.data || err.message,
    });
  }
});

/**
 * 📌 Callback endpoint to handle PhonePe redirect response
 * POST /api/phonepe/callback
 */
router.post("/callback", async (req, res) => {
  try {
    console.log("📥 PhonePe redirect callback received:", req.body);

    const { merchantTransactionId, code, message } = req.body;

    if (!merchantTransactionId) {
      return res
        .status(400)
        .json({ message: "merchantTransactionId is required" });
    }

    // Find payment transaction
    const paymentTransaction = await PaymentTransactionModel.findOne({
      merchantTransactionId: merchantTransactionId,
    });

    if (!paymentTransaction) {
      return res.status(404).json({ message: "Payment transaction not found" });
    }

    // Update payment status based on callback
    if (code === "PAYMENT_SUCCESS") {
      paymentTransaction.paymentStatus = "COMPLETED";
    } else {
      paymentTransaction.paymentStatus = "FAILED";
    }

    paymentTransaction.metadata = {
      callbackCode: code,
      callbackMessage: message,
      callbackReceivedAt: new Date(),
    };

    await paymentTransaction.save();

    return res.json({
      received: true,
      status: paymentTransaction.paymentStatus,
    });
  } catch (err) {
    console.error("callback error", err);
    return res.status(500).json({ received: false, error: err.message });
  }
});

/**
 * 📌 Get payment transactions (Admin)
 * GET /api/phonepe/transactions
 */
router.get("/transactions", verifyToken, async (req, res) => {
  try {
    // Check if user is admin (you can implement your admin check here)
    const transactions = await PaymentTransactionModel.find()
      .populate("orderId", "orderNumber status totalAmount")
      .populate("userId", "name email phoneNumber")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = { phonepeRoutes: router };

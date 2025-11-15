const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const router = express.Router();
const axios = require("axios");

const { verifyToken } = require("../Middlewares/VerifyToken");
const { UserModel, OrderModel, CounterModel } = require("../Modals/UserModal");
const PaymentTransactionModel = require("../Modals/paymentModal");
const ProductModal = require("../Modals/productModal");
const { sendOrderConfirmationEmail } = require("../utils/orderProdctService");

// ✅ Dynamic PhonePe URLs
const PHONEPE_AUTH_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";

const PHONEPE_CHECKOUT_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.phonepe.com/apis/pg/checkout/v2/pay"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay";

// ✅ OAuth Credentials
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || "1";

// --------------------------------------------------------
// 🔹 STEP 1: Get OAuth Token
// --------------------------------------------------------
async function getPhonePeAccessToken() {
  try {
    console.log("📡 Getting PhonePe access token...");
    const response = await axios.post(
      PHONEPE_AUTH_URL,
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        client_version: CLIENT_VERSION,
        grant_type: "client_credentials",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 10000,
      }
    );

    if (!response.data.access_token) {
      throw new Error("Access token not received from PhonePe");
    }

    console.log("✅ Access token received");
    return response.data.access_token;
  } catch (err) {
    console.error(
      "❌ Error getting PhonePe access token:",
      err.response?.data || err.message
    );
    throw new Error("Failed to get PhonePe access token");
  }
}

// --------------------------------------------------------
// 🔹 STEP 2: Generate Sequential Order Number
// --------------------------------------------------------
async function getNextOrderNumber() {
  try {
    const counter = await CounterModel.findByIdAndUpdate(
      "orderNumber",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return String(counter.seq).padStart(4, "0");
  } catch (err) {
    console.error("Error generating order number:", err);
    throw new Error("Failed to generate order number");
  }
}

// --------------------------------------------------------
// 🔹 CREATE ORDER - Simplified, Dynamic, and Token-Based
// --------------------------------------------------------
router.post("/createOrder", verifyToken, async (req, res) => {
  try {
    console.log("\n=== 🟣 CREATE ORDER START ===");
    console.log("Environment:", process.env.NODE_ENV);

    const userId = req.user.userId;
    const { shippingDetails, couponCode } = req.body;

    if (
      !shippingDetails ||
      !shippingDetails.name ||
      !shippingDetails.phoneNumber
    ) {
      return res
        .status(400)
        .json({ message: "Missing required shipping information" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cartItems = Array.from(user.cart?.values?.() || user.cart || []);
    if (!cartItems.length)
      return res.status(400).json({ message: "Cart is empty" });

    // 🔹 Prepare product details
    const items = cartItems.map((c) => ({
      productId: c.productId?._id || c.productId,
      name: c.name,
      quantity: c.quantity,
      price: c.price,
      color: c.color || null,
      size: c.size || null,
      image: c.image || c.productId?.image || "",
      sku: c.sku || null,
    }));

    let totalAmount = items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
      0
    );

    // 🔹 Apply coupon if any
    let appliedCoupon = null;
    if (couponCode) {
      try {
        const CouponModel = require("../Modals/coupanModal");
        const coupon = await CouponModel.findOne({
          couponCode: couponCode.toUpperCase(),
          isActive: true,
          expiryDate: { $gt: new Date() },
        });
        if (coupon && totalAmount >= (coupon.minimumPurchaseAmount || 0)) {
          const discountAmount = Math.min(
            (totalAmount * (coupon.discountPercentage || 0)) / 100,
            coupon.maxDiscountAmount || totalAmount
          );
          totalAmount -= discountAmount;
          appliedCoupon = {
            couponCode: coupon.couponCode,
            discountPercentage: coupon.discountPercentage,
            discountAmount,
          };
          coupon.usedCount = (coupon.usedCount || 0) + 1;
          await coupon.save();
        }
      } catch (err) {
        console.warn("⚠️ Coupon error:", err.message);
      }
    }

    // 🔹 Generate order reference
    const merchantOrderId = `ORD_${Date.now()}_${Math.floor(
      Math.random() * 1000
    )}`;
    const amountInPaise = Math.round(totalAmount * 100);

    // 🔹 Get OAuth token
    const accessToken = await getPhonePeAccessToken();

    // 🔹 Prepare Checkout Payload
    const paymentPayload = {
      merchantOrderId,
      amount: amountInPaise,
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Order Payment Initialization",
        merchantUrls: {
          redirectUrl: `${
            process.env.BACKEND_URL || "http://localhost:5000"
          }/api/phonepe/frontend-callback?merchantOrderId=${merchantOrderId}`,
        },
      },
    };

    console.log("📤 Sending Checkout Request to:", PHONEPE_CHECKOUT_URL);

    // 🔹 Call Checkout API
    const phonePeResponse = await axios.post(
      PHONEPE_CHECKOUT_URL,
      paymentPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${accessToken}`,
        },
        timeout: 15000,
      }
    );

    const responseData = phonePeResponse.data;
    console.log("📥 PhonePe Response:", responseData);

    const redirectUrl = responseData.redirectUrl;
    if (!redirectUrl) {
      return res
        .status(500)
        .json({ message: "Redirect URL missing from PhonePe response" });
    }

    // 🔹 Save transaction for reference
    const paymentTransaction = new PaymentTransactionModel({
      userId,
      merchantTransactionId: merchantOrderId,
      amount: totalAmount,
      paymentStatus: "INITIATED",
      phonepeResponse: responseData,
      userDetails: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      shippingDetails: {
        name: shippingDetails.name,
        address: {
          street: shippingDetails.address?.street,
          city: shippingDetails.address?.city,
          state: shippingDetails.address?.state,
          zipCode: shippingDetails.address?.zipCode,
          alternatePhone: shippingDetails.address?.alternatePhone || "",
          addressType: shippingDetails.address?.addressType || "home",
        },
        phoneNumber: shippingDetails.phoneNumber,
      },
      productDetails: items,
      appliedCoupon,
    });

    await paymentTransaction.save();

    // 🔹 Send redirect URL to frontend
    res.json({
      success: true,
      redirectUrl,
      merchantOrderId,
      amount: totalAmount,
    });
  } catch (err) {
    console.error("❌ createOrder error:", err.response?.data || err.message);
    res.status(500).json({
      message: "Server error during order creation",
      error: err.response?.data?.message || err.message,
    });
  }
});

// ✅ VERIFY PAYMENT STATUS - Updated with dynamic endpoints
// ✅ VERIFY PAYMENT STATUS - Fixed with correct PhonePe API
router.post("/verify", async (req, res) => {
  try {
    const { merchantTransactionId } = req.body;

    if (!merchantTransactionId) {
      return res
        .status(400)
        .json({ message: "merchantTransactionId is required" });
    }

    const paymentTransaction = await PaymentTransactionModel.findOne({
      merchantTransactionId,
    });
    if (!paymentTransaction) {
      return res.status(404).json({ message: "Payment transaction not found" });
    }

    if (
      paymentTransaction.paymentStatus === "COMPLETED" &&
      paymentTransaction.orderId
    ) {
      return res.json({
        success: true,
        paymentStatus: "COMPLETED",
        orderId: paymentTransaction.orderId,
        message: "Payment already verified/processed",
      });
    }

    // Get OAuth token first
    const accessToken = await getPhonePeAccessToken();

    // ✅ FIXED: Use correct PhonePe status API endpoint
    const statusEndpoint =
      process.env.NODE_ENV === "production"
        ? `https://api.phonepe.com/apis/pg/checkout/v2/order/${merchantTransactionId}/status`
        : `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${merchantTransactionId}/status`;

    console.log("🔍 Verification API Call:", {
      environment: process.env.NODE_ENV,
      url: statusEndpoint,
      merchantTransactionId: merchantTransactionId,
    });

    // ✅ FIXED: Use only OAuth token (no checksum needed for this API)
    const response = await axios.get(statusEndpoint, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${accessToken}`,
        accept: "application/json",
      },
      timeout: 15000,
    });

    const data = response.data;
    console.log("📥 PhonePe Status Response:", data);

    if (!data) {
      console.error("PhonePe verification failed: No response data");
      return res
        .status(500)
        .json({ message: "PhonePe verification failed - no response" });
    }

    const paymentInfo = data;
    const isPaymentSuccessful = paymentInfo.state === "COMPLETED";

    console.log("💰 Payment Status:", {
      state: paymentInfo.state,
      isSuccessful: isPaymentSuccessful,
      amount: paymentInfo.amount,
      transactionId: paymentInfo.paymentDetails?.[0]?.transactionId
    });

    // Update payment transaction
    const atomicUpdate = {
      $set: {
        paymentStatus: isPaymentSuccessful ? "COMPLETED" : "FAILED",
        phonepeTransactionId: paymentInfo.paymentDetails?.[0]?.transactionId || null,
        verificationResponse: data,
        completedAt: new Date(),
        processedAt: new Date(),
      },
    };

    const updatedPaymentTransaction = await PaymentTransactionModel.findOneAndUpdate(
      {
        merchantTransactionId,
        paymentStatus: { $ne: "COMPLETED" }, // Only update if not already completed
      },
      atomicUpdate,
      { new: true }
    );

    if (!updatedPaymentTransaction) {
      const existing = await PaymentTransactionModel.findOne({
        merchantTransactionId,
      }).populate("orderId");
      return res.json({
        success: existing.paymentStatus === "COMPLETED",
        paymentStatus: existing.paymentStatus,
        orderId: existing.orderId,
        message: "Transaction already processed by another request",
      });
    }

    let order = null;
    
    // ✅ Only create order if payment is successful
    if (isPaymentSuccessful) {
      try {
        const shippingDetails = updatedPaymentTransaction.shippingDetails || {};
        const shippingAddress = {
          name: shippingDetails.name || "Not Provided",
          address: {
            street: shippingDetails.address?.street || "Not Provided",
            city: shippingDetails.address?.city || "Not Provided",
            zipCode: shippingDetails.address?.zipCode || "000000",
            state: shippingDetails.address?.state || "Not Provided",
            alternatePhone: shippingDetails.address?.alternatePhone || "",
            addressType: shippingDetails.address?.addressType || "home",
          },
          phoneNumber: shippingDetails.phoneNumber || "Not Provided",
        };

        const orderNumber = await getNextOrderNumber();

        order = new OrderModel({
          userId: updatedPaymentTransaction.userId,
          items: updatedPaymentTransaction.productDetails,
          totalAmount: updatedPaymentTransaction.amount,
          shippingAddress,
          paymentMethod: "prepaid",
          status: "processing",
          orderNumber,
          paymentDetails: {
            merchantTransactionId,
            paymentStatus: "COMPLETED",
            transactionId: paymentInfo.paymentDetails?.[0]?.transactionId,
            verificationResponse: data,
          },
          appliedCoupon: updatedPaymentTransaction.appliedCoupon,
        });

        await order.save();
        console.log("✅ Order created successfully:", order.orderNumber);

        // Update payment transaction with order ID
        updatedPaymentTransaction.orderId = order._id;
        await updatedPaymentTransaction.save();

        // Generate AWB
        try {
          console.log("🚚 Generating AWB for online order:", order.orderNumber);
          const { createShipment } = require("../utils/xpressbeesService");
          const shipmentRes = await createShipment(order);
          if (shipmentRes.status && shipmentRes.data?.awb_number) {
            order.awbNumber = shipmentRes.data.awb_number;
            order.shippingLabelUrl = shipmentRes.data.label || null;
            await order.save();
            console.log("✅ AWB generated:", shipmentRes.data.awb_number);
          }
        } catch (awbErr) {
          console.error("❌ Xpressbees AWB generation error:", awbErr?.message || awbErr);
        }

        // Update product inventory
        for (const item of updatedPaymentTransaction.productDetails) {
          try {
            const product = await ProductModal.findById(item.productId);
            if (!product) continue;
            
            const colorIndex = product.colors.findIndex(
              (c) => c.name === item.color
            );
            if (colorIndex === -1) continue;
            
            const sizeIndex = product.colors[colorIndex].sizes.findIndex(
              (s) => s.size === item.size
            );
            if (sizeIndex === -1) continue;
            
            product.colors[colorIndex].sizes[sizeIndex].quantity -= item.quantity;
            await product.save();
          } catch (updateError) {
            console.error(`❌ Error updating product ${item.productId}:`, updateError);
          }
        }

        // Clear user cart
        try {
          const user = await UserModel.findById(updatedPaymentTransaction.userId);
          if (user) {
            user.cart = new Map();
            await user.save();
            console.log("✅ User cart cleared");
          }
        } catch (cartErr) {
          console.error("❌ Failed to clear user cart:", cartErr);
        }

        // Send confirmation email
        try {
          await sendOrderConfirmationEmail(order._id);
          console.log("✅ Order confirmation email sent");
        } catch (emailError) {
          console.error("❌ Email sending failed:", emailError);
        }

      } catch (orderError) {
        console.error("❌ Error creating order:", orderError);
        // Don't fail the entire verification if order creation fails
      }
    }

    return res.json({
      success: isPaymentSuccessful,
      paymentStatus: updatedPaymentTransaction.paymentStatus,
      orderId: updatedPaymentTransaction.orderId || (order && order._id),
      transactionId: paymentInfo.paymentDetails?.[0]?.transactionId,
      data: paymentInfo,
      message: isPaymentSuccessful ? "Payment verified successfully" : "Payment failed or pending"
    });

  } catch (err) {
    console.error(
      "❌ Payment verification error:",
      err?.response?.data || err.message || err
    );
    
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      return res.status(401).json({
        message: "Unauthorized — invalid OAuth token",
        phonepe: err?.response?.data || {},
      });
    }
    
    if (err?.response?.status === 404) {
      return res.status(404).json({
        message: "Transaction not found at PhonePe",
        error: err?.response?.data || err.message,
      });
    }

    return res.status(500).json({
      message: "Server error during payment verification",
      error: err?.response?.data?.message || err.message,
    });
  }
});

// ✅ CALLBACK HANDLER (remains the same)
router.post("/callback", async (req, res) => {
  try {
    console.log("📥 PhonePe redirect callback received:", req.body);
    const { merchantTransactionId, code, message } = req.body;

    if (!merchantTransactionId) {
      return res
        .status(400)
        .json({ message: "merchantTransactionId is required" });
    }

    const paymentTransaction = await PaymentTransactionModel.findOne({
      merchantTransactionId,
    });
    if (!paymentTransaction) {
      return res.status(404).json({ message: "Payment transaction not found" });
    }

    paymentTransaction.paymentStatus =
      code === "PAYMENT_SUCCESS" ? "COMPLETED" : "FAILED";
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

// ✅ ADMIN TRANSACTIONS (remains the same)
router.get("/transactions", verifyToken, async (req, res) => {
  try {
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

// ✅ FRONTEND CALLBACK REDIRECT HANDLER (remains the same)
// const handleFrontendCallback = async (req, res) => {
//   try {
//     const merchantTransactionId =
//       req.query.merchantTransactionId || req.body.merchantTransactionId || null;

//     if (!merchantTransactionId) {
//       return res.status(400).send("Missing merchantTransactionId");
//     }

//     const frontendUrl = `${
//       process.env.FRONTEND_URL || "http://localhost:5173"
//     }/phonepe-callback?merchantTransactionId=${merchantTransactionId}`;

//     return res.redirect(frontendUrl);
//   } catch (error) {
//     console.error("Error redirecting from PhonePe callback:", error);
//     return res.status(500).send("Internal server error");
//   }
// };

const handleFrontendCallback = async (req, res) => {
  try {
    // FIX: Use merchantOrderId instead of merchantTransactionId
    const merchantOrderId =
      req.query.merchantOrderId || req.body.merchantOrderId || null;

    if (!merchantOrderId) {
      return res.status(400).send("Missing merchantOrderId");
    }

    const frontendUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/phonepe-callback?merchantTransactionId=${merchantOrderId}`;

    console.log("🔀 Redirecting to frontend:", frontendUrl);
    return res.redirect(frontendUrl);
  } catch (error) {
    console.error("Error redirecting from PhonePe callback:", error);
    return res.status(500).send("Internal server error");
  }
};

router.get("/frontend-callback", handleFrontendCallback);
router.post("/frontend-callback", handleFrontendCallback);

module.exports = { phonepeRoutes: router };

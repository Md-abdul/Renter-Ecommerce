




// const dotenv = require("dotenv");
// dotenv.config();
// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const crypto = require("crypto");
// const { verifyToken } = require("../Middlewares/VerifyToken");
// const { UserModel, OrderModel, CounterModel } = require("../Modals/UserModal");
// const PaymentTransactionModel = require("../Modals/paymentModal");
// const ProductModal = require("../Modals/productModal");
// const { sendOrderConfirmationEmail } = require("../utils/orderProdctService");

// // ✅ PhonePe configuration - FIXED
// const PHONEPE_HOST = "https://api-preprod.phonepe.com/apis/pg-sandbox";
// const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
// const SALT_KEY = process.env.PHONEPE_SALT_KEY;
// const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

// /**
//  * ✅ Utility to build checksum (X-VERIFY) - FIXED for sandbox
//  * Sandbox uses /pg/v1/pay, Production uses /v1/pay
//  */
// function buildPhonePeChecksum(encodedReq, uri = "/pg/v1/pay") {
//   const payload = encodedReq + uri + SALT_KEY;
//   const sha = crypto.createHash("sha256").update(payload).digest("hex");
//   return `${sha}###${SALT_INDEX}`;
// }

// /**
//  * ✅ Utility to verify PhonePe response checksum - FIXED
//  */
// function verifyPhonePeChecksum(encodedResponse, checksum, uri = "/pg/v1/status") {
//   const payload = encodedResponse + uri + SALT_KEY;
//   const sha = crypto.createHash("sha256").update(payload).digest("hex");
//   const expectedChecksum = `${sha}###${SALT_INDEX}`;
//   return expectedChecksum === checksum;
// }

// const getNextOrderNumber = async () => {
//   try {
//     const { CounterModel } = require("../Modals/UserModal");
//     const counter = await CounterModel.findByIdAndUpdate(
//       "orderNumber",
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true }
//     );
//     return `${String(counter.seq).padStart(4, "0")}`;
//   } catch (error) {
//     console.error("Error generating order number:", error);
//     throw new Error("Failed to generate order number");
//   }
// };

// // ✅ CREATE ORDER - FIXED
// router.post("/createOrder", verifyToken, async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { shippingDetails, couponCode } = req.body;

//     console.log("PhonePe createOrder request body:", { shippingDetails, couponCode });

//     // Validate shipping details
//     if (
//       !shippingDetails ||
//       !shippingDetails.name ||
//       !shippingDetails.phoneNumber ||
//       !shippingDetails.address ||
//       !shippingDetails.address.street ||
//       !shippingDetails.address.city ||
//       !shippingDetails.address.zipCode
//     ) {
//       return res.status(400).json({ message: "Missing required shipping information" });
//     }

//     const user = await UserModel.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const cartItems = Array.from(user.cart.values ? user.cart.values() : user.cart || []);
//     if (!cartItems || cartItems.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     const items = [];
//     for (const c of cartItems) {
//       const productId = c.productId?._id || c.productId;
//       const image = c.image || c.productId?.image || "";
//       items.push({
//         productId,
//         name: c.name,
//         quantity: c.quantity,
//         price: c.price,
//         color: c.color || null,
//         size: c.size || null,
//         image,
//         sku: c.sku || null,
//         packageWeight: c.packageWeight || null,
//         packageLength: c.packageLength || null,
//         packageBreadth: c.packageBreadth || null,
//         packageHeight: c.packageHeight || null,
//       });
//     }

//     let totalAmount = items.reduce(
//       (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
//       0
//     );

//     let appliedCoupon = null;
//     let discountAmount = 0;
//     if (couponCode) {
//       const CouponModel = require("../Modals/coupanModal");
//       const coupon = await CouponModel.findOne({
//         couponCode: couponCode.toUpperCase(),
//         isActive: true,
//         expiryDate: { $gt: new Date() },
//       });
//       if (coupon && totalAmount >= (coupon.minimumPurchaseAmount || 0)) {
//         discountAmount = (totalAmount * (coupon.discountPercentage || 0)) / 100;
//         const finalDiscount = Math.min(discountAmount, coupon.maxDiscountAmount || discountAmount);
//         totalAmount -= finalDiscount;
//         appliedCoupon = {
//           couponCode: coupon.couponCode,
//           discountPercentage: coupon.discountPercentage,
//           discountAmount: finalDiscount,
//         };
//         coupon.usedCount = (coupon.usedCount || 0) + 1;
//         await coupon.save().catch((e) => console.warn("Coupon save failed:", e.message));
//       }
//     }

//     const merchantTransactionId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
//     const amountPaise = Math.round(Number(totalAmount) * 100);

//     const redirectUrl = `${
//       process.env.BACKEND_URL || "http://localhost:5000"
//     }/api/phonepe/frontend-callback?merchantTransactionId=${merchantTransactionId}`;

//     const requestBody = {
//       merchantId: MERCHANT_ID,
//       merchantTransactionId,
//       amount: amountPaise,
//       redirectUrl,
//       redirectMode: "POST",
//       merchantUserId: userId.toString(),
//       paymentInstrument: { type: "PAY_PAGE" },
//       validityTime: "600000", // 10 minutes
//     };

//     const requestStr = JSON.stringify(requestBody);
//     const encodedReq = Buffer.from(requestStr).toString("base64");
    
//     // FIXED: Use correct URI for sandbox
//     const checksum = buildPhonePeChecksum(encodedReq, "/pg/v1/pay");

//     const phonepeUrl = `${PHONEPE_HOST}/pg/v1/pay`;

//     console.log("PhonePe API Call Details:", {
//       url: phonepeUrl,
//       merchantId: MERCHANT_ID,
//       amount: amountPaise,
//       checksumLength: checksum.length
//     });

//     const resp = await axios.post(
//       phonepeUrl,
//       { request: encodedReq },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "X-VERIFY": checksum,
//           accept: "application/json",
//         },
//         timeout: 15000,
//       }
//     );

//     const data = resp.data;
//     console.log("PhonePe Response:", data);

//     if (!data || !data.success) {
//       console.error("PhonePe createOrder error:", data);
//       return res.status(500).json({ message: "PhonePe returned error", phonepe: data });
//     }

//     const redirectInfo = data?.data?.instrumentResponse?.redirectInfo || data?.data?.redirectInfo;
//     const paymentUrl = redirectInfo?.url || null;
//     if (!paymentUrl) {
//       return res.status(500).json({
//         message: "Could not find redirect URL in PhonePe response",
//         phonepe: data,
//       });
//     }

//     const paymentTransaction = new PaymentTransactionModel({
//       userId,
//       merchantTransactionId,
//       amount: totalAmount,
//       paymentStatus: "INITIATED",
//       phonepeResponse: data,
//       userDetails: {
//         name: user.name || "",
//         email: user.email || "",
//         phoneNumber: user.phoneNumber || "",
//       },
//       shippingDetails: {
//         name: shippingDetails.name,
//         address: {
//           street: shippingDetails.address.street,
//           city: shippingDetails.address.city,
//           zipCode: shippingDetails.address.zipCode,
//           state: shippingDetails.address.state || "",
//           alternatePhone: shippingDetails.address.alternatePhone || "",
//           addressType: shippingDetails.address.addressType || "home",
//         },
//         phoneNumber: shippingDetails.phoneNumber,
//       },
//       productDetails: items,
//       appliedCoupon,
//     });

//     await paymentTransaction.save();

//     return res.json({ 
//       success: true,
//       paymentUrl, 
//       merchantTransactionId, 
//       amount: totalAmount, 
//       raw: data 
//     });
//   } catch (err) {
//     console.error("PhonePe createOrder error:", err?.response?.data || err.message || err);
//     return res
//       .status(500)
//       .json({ 
//         message: "Server error creating PhonePe order", 
//         error: err?.response?.data?.message || err.message 
//       });
//   }
// });

// // ... rest of your routes (verify, callback, etc.) remain the same
// // Make sure to update the verify endpoint URI to use "/pg/v1/status" as well

// // ✅ VERIFY PAYMENT STATUS - FIXED
// router.post("/verify", async (req, res) => {
//   try {
//     const { merchantTransactionId } = req.body;

//     if (!merchantTransactionId) {
//       return res.status(400).json({ message: "merchantTransactionId is required" });
//     }

//     const paymentTransaction = await PaymentTransactionModel.findOne({ merchantTransactionId });
//     if (!paymentTransaction) {
//       return res.status(404).json({ message: "Payment transaction not found" });
//     }

//     if (paymentTransaction.paymentStatus === "COMPLETED" && paymentTransaction.orderId) {
//       return res.json({
//         success: true,
//         paymentStatus: "COMPLETED",
//         orderId: paymentTransaction.orderId,
//         message: "Payment already verified/processed",
//       });
//     }

//     // FIXED: Use correct URI for sandbox
//     const uri = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
//     const phonepeUrl = `${PHONEPE_HOST}${uri}`;

//     const payload = uri + SALT_KEY;
//     const sha = crypto.createHash("sha256").update(payload).digest("hex");
//     const checksum = `${sha}###${SALT_INDEX}`;

//     const resp = await axios.get(phonepeUrl, {
//       headers: {
//         "Content-Type": "application/json",
//         "X-VERIFY": checksum,
//         "X-MERCHANT-ID": MERCHANT_ID,
//         accept: "application/json",
//       },
//       timeout: 15000,
//     });

//     const data = resp.data;
//     if (!data || !data.success) {
//       console.error("PhonePe verification failed:", data);
//       return res.status(500).json({ message: "PhonePe verification failed", phonepe: data });
//     }

//     // ... rest of your verify logic remains the same
//     const paymentInfo = data.data;
//     const isPaymentSuccessful = paymentInfo.state === "COMPLETED";

//     const atomicUpdate = {
//       $set: {
//         paymentStatus: isPaymentSuccessful ? "COMPLETED" : "FAILED",
//         phonepeTransactionId: paymentInfo.transactionId,
//         verificationResponse: data,
//         completedAt: new Date(),
//         processedAt: new Date(),
//       },
//     };

//     const updatedPaymentTransaction = await PaymentTransactionModel.findOneAndUpdate(
//       { merchantTransactionId, orderId: { $exists: false }, paymentStatus: { $ne: "COMPLETED" } },
//       atomicUpdate,
//       { new: true }
//     );

//     if (!updatedPaymentTransaction) {
//       const existing = await PaymentTransactionModel.findOne({ merchantTransactionId }).populate("orderId");
//       return res.json({
//         success: existing.paymentStatus === "COMPLETED",
//         paymentStatus: existing.paymentStatus,
//         orderId: existing.orderId,
//         message: "Transaction already processed by another request",
//       });
//     }

//     let order = null;
//     if (isPaymentSuccessful) {
//       const shippingDetails = updatedPaymentTransaction.shippingDetails || {};
//       const shippingAddress = {
//         name: shippingDetails.name || "Not Provided",
//         address: {
//           street: shippingDetails.address?.street || "Not Provided",
//           city: shippingDetails.address?.city || "Not Provided",
//           zipCode: shippingDetails.address?.zipCode || "000000",
//           state: shippingDetails.address?.state || "Not Provided",
//           alternatePhone: shippingDetails.address?.alternatePhone || "",
//           addressType: shippingDetails.address?.addressType || "home",
//         },
//         phoneNumber: shippingDetails.phoneNumber || "Not Provided",
//       };

//       const orderNumber = await getNextOrderNumber();

//       order = new OrderModel({
//         userId: updatedPaymentTransaction.userId,
//         items: updatedPaymentTransaction.productDetails,
//         totalAmount: updatedPaymentTransaction.amount,
//         shippingAddress,
//         paymentMethod: "prepaid",
//         status: "processing",
//         orderNumber,
//         paymentDetails: {
//           merchantTransactionId,
//           paymentStatus: "COMPLETED",
//           transactionId: paymentInfo.transactionId,
//           verificationResponse: data,
//         },
//         appliedCoupon: updatedPaymentTransaction.appliedCoupon,
//       });

//       await order.save();

//       try {
//         console.log("Generating AWB for online order:", order.orderNumber);
//         const { createShipment } = require("../utils/xpressbeesService");
//         const shipmentRes = await createShipment(order);
//         if (shipmentRes.status && shipmentRes.data?.awb_number) {
//           order.awbNumber = shipmentRes.data.awb_number;
//           order.shippingLabelUrl = shipmentRes.data.label || null;
//           await order.save();
//         }
//       } catch (awbErr) {
//         console.error("Xpressbees AWB generation error:", awbErr?.message || awbErr);
//       }

//       for (const item of updatedPaymentTransaction.productDetails) {
//         try {
//           const product = await ProductModal.findById(item.productId);
//           if (!product) continue;
//           const colorIndex = product.colors.findIndex((c) => c.name === item.color);
//           if (colorIndex === -1) continue;
//           const sizeIndex = product.colors[colorIndex].sizes.findIndex((s) => s.size === item.size);
//           if (sizeIndex === -1) continue;
//           product.colors[colorIndex].sizes[sizeIndex].quantity -= item.quantity;
//           await product.save();
//         } catch (updateError) {
//           console.error(`Error updating product ${item.productId}:`, updateError);
//         }
//       }

//       updatedPaymentTransaction.orderId = order._id;
//       await updatedPaymentTransaction.save();

//       try {
//         const user = await UserModel.findById(updatedPaymentTransaction.userId);
//         if (user) {
//           user.cart = new Map();
//           await user.save();
//         }
//       } catch (cartErr) {
//         console.error("Failed to clear user cart:", cartErr);
//       }

//       try {
//         await sendOrderConfirmationEmail(order._id);
//       } catch (emailError) {
//         console.error("Email sending failed:", emailError);
//       }
//     }

//     return res.json({
//       success: isPaymentSuccessful,
//       paymentStatus: updatedPaymentTransaction.paymentStatus,
//       orderId: updatedPaymentTransaction.orderId || (order && order._id),
//       transactionId: paymentInfo.transactionId,
//       data: paymentInfo,
//     });
//   } catch (err) {
//     console.error("Payment verification error:", err?.response?.data || err.message || err);
//     if (err?.response?.status === 401 || err?.response?.status === 403) {
//       return res.status(401).json({
//         message: "Unauthorized — invalid checksum or credentials",
//         phonepe: err?.response?.data || {},
//       });
//     }
//     return res
//       .status(500)
//       .json({ message: "Server error during payment verification", error: err?.response?.data || err.message });
//   }
// });


// // ✅ CALLBACK HANDLER
// router.post("/callback", async (req, res) => {
//   try {
//     console.log("📥 PhonePe redirect callback received:", req.body);
//     const { merchantTransactionId, code, message } = req.body;

//     if (!merchantTransactionId) {
//       return res.status(400).json({ message: "merchantTransactionId is required" });
//     }

//     const paymentTransaction = await PaymentTransactionModel.findOne({ merchantTransactionId });
//     if (!paymentTransaction) {
//       return res.status(404).json({ message: "Payment transaction not found" });
//     }

//     paymentTransaction.paymentStatus = code === "PAYMENT_SUCCESS" ? "COMPLETED" : "FAILED";
//     paymentTransaction.metadata = {
//       callbackCode: code,
//       callbackMessage: message,
//       callbackReceivedAt: new Date(),
//     };
//     await paymentTransaction.save();

//     return res.json({ received: true, status: paymentTransaction.paymentStatus });
//   } catch (err) {
//     console.error("callback error", err);
//     return res.status(500).json({ received: false, error: err.message });
//   }
// });

// // ✅ ADMIN TRANSACTIONS
// router.get("/transactions", verifyToken, async (req, res) => {
//   try {
//     const transactions = await PaymentTransactionModel.find()
//       .populate("orderId", "orderNumber status totalAmount")
//       .populate("userId", "name email phoneNumber")
//       .sort({ createdAt: -1 })
//       .limit(100);
//     res.json(transactions);
//   } catch (err) {
//     console.error("Error fetching transactions:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ✅ FRONTEND CALLBACK REDIRECT HANDLER
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

// router.get("/frontend-callback", handleFrontendCallback);
// router.post("/frontend-callback", handleFrontendCallback);

// module.exports = { phonepeRoutes: router };



const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const { verifyToken } = require("../Middlewares/VerifyToken");
const { UserModel, OrderModel, CounterModel } = require("../Modals/UserModal");
const PaymentTransactionModel = require("../Modals/paymentModal");
const ProductModal = require("../Modals/productModal");
const { sendOrderConfirmationEmail } = require("../utils/orderProdctService");

// ✅ PhonePe configuration - Separate credentials for OAuth and Payment APIs
const PHONEPE_IDENTITY_HOST = "https://api.phonepe.com/apis/identity-manager";
const PHONEPE_PG_HOST = process.env.NODE_ENV === "production" 
  ? "https://api.phonepe.com/apis/pg"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox";

// OAuth Credentials (for token generation)
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || "1";

// Payment API Credentials (different from OAuth credentials)
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

/**
 * ✅ Get OAuth Token from PhonePe
 */
async function getPhonePeAccessToken() {
  try {
    console.log("Getting PhonePe access token...");
    
    const tokenResponse = await axios.post(
      `${PHONEPE_IDENTITY_HOST}/v1/oauth/token`,
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_version: CLIENT_VERSION,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    const tokenData = tokenResponse.data;
    console.log("PhonePe token received successfully");
    
    return {
      accessToken: tokenData.access_token,
      encryptedAccessToken: tokenData.encrypted_access_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type
    };
  } catch (error) {
    console.error("Error getting PhonePe access token:", error.response?.data || error.message);
    throw new Error(`Failed to get PhonePe access token: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * ✅ Utility to build checksum (X-VERIFY) for Payment APIs
 * Uses SALT_KEY (different from CLIENT_SECRET)
 */
function buildPhonePeChecksum(encodedReq, endpoint = "pay") {
  const uri = process.env.NODE_ENV === "production" 
    ? `/v1/${endpoint}`
    : `/pg/v1/${endpoint}`;
  
  const payload = encodedReq + uri + SALT_KEY;
  const sha = crypto.createHash("sha256").update(payload).digest("hex");
  return `${sha}###${SALT_INDEX}`;
}

/**
 * ✅ Utility to verify PhonePe response checksum
 */
function verifyPhonePeChecksum(encodedResponse, checksum, endpoint = "status") {
  const uri = process.env.NODE_ENV === "production" 
    ? `/v1/${endpoint}`
    : `/pg/v1/${endpoint}`;
  
  const payload = encodedResponse + uri + SALT_KEY;
  const sha = crypto.createHash("sha256").update(payload).digest("hex");
  const expectedChecksum = `${sha}###${SALT_INDEX}`;
  return expectedChecksum === checksum;
}

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

// ✅ CREATE ORDER - Using proper credentials
router.post("/createOrder", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shippingDetails, couponCode } = req.body;

    console.log("PhonePe createOrder request body:", { shippingDetails, couponCode });

    // Validate shipping details
    if (
      !shippingDetails ||
      !shippingDetails.name ||
      !shippingDetails.phoneNumber ||
      !shippingDetails.address ||
      !shippingDetails.address.street ||
      !shippingDetails.address.city ||
      !shippingDetails.address.zipCode
    ) {
      return res.status(400).json({ message: "Missing required shipping information" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cartItems = Array.from(user.cart.values ? user.cart.values() : user.cart || []);
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = [];
    for (const c of cartItems) {
      const productId = c.productId?._id || c.productId;
      const image = c.image || c.productId?.image || "";
      items.push({
        productId,
        name: c.name,
        quantity: c.quantity,
        price: c.price,
        color: c.color || null,
        size: c.size || null,
        image,
        sku: c.sku || null,
        packageWeight: c.packageWeight || null,
        packageLength: c.packageLength || null,
        packageBreadth: c.packageBreadth || null,
        packageHeight: c.packageHeight || null,
      });
    }

    let totalAmount = items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
      0
    );

    let appliedCoupon = null;
    let discountAmount = 0;
    if (couponCode) {
      const CouponModel = require("../Modals/coupanModal");
      const coupon = await CouponModel.findOne({
        couponCode: couponCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gt: new Date() },
      });
      if (coupon && totalAmount >= (coupon.minimumPurchaseAmount || 0)) {
        discountAmount = (totalAmount * (coupon.discountPercentage || 0)) / 100;
        const finalDiscount = Math.min(discountAmount, coupon.maxDiscountAmount || discountAmount);
        totalAmount -= finalDiscount;
        appliedCoupon = {
          couponCode: coupon.couponCode,
          discountPercentage: coupon.discountPercentage,
          discountAmount: finalDiscount,
        };
        coupon.usedCount = (coupon.usedCount || 0) + 1;
        await coupon.save().catch((e) => console.warn("Coupon save failed:", e.message));
      }
    }

    const merchantTransactionId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const amountPaise = Math.round(Number(totalAmount) * 100);

    const redirectUrl = `${
      process.env.BACKEND_URL || "http://localhost:5000"
    }/api/phonepe/frontend-callback?merchantTransactionId=${merchantTransactionId}`;

    const requestBody = {
      merchantId: MERCHANT_ID, // Using MERCHANT_ID (not CLIENT_ID)
      merchantTransactionId,
      amount: amountPaise,
      redirectUrl,
      redirectMode: "POST",
      merchantUserId: userId.toString(),
      paymentInstrument: { type: "PAY_PAGE" },
      validityTime: "600000", // 10 minutes
    };

    const requestStr = JSON.stringify(requestBody);
    const encodedReq = Buffer.from(requestStr).toString("base64");
    
    // Get OAuth token first
    const tokenData = await getPhonePeAccessToken();
    
    // Build checksum with SALT_KEY (not CLIENT_SECRET)
    const checksum = buildPhonePeChecksum(encodedReq, "pay");

    // Dynamic endpoint based on environment
    const payEndpoint = process.env.NODE_ENV === "production" ? "/v1/pay" : "/pg/v1/pay";
    const phonepeUrl = `${PHONEPE_PG_HOST}${payEndpoint}`;

    console.log("PhonePe API Call Details:", {
      url: phonepeUrl,
      environment: process.env.NODE_ENV,
      merchantId: MERCHANT_ID,
      amount: amountPaise,
      hasToken: !!tokenData.encryptedAccessToken
    });

    const resp = await axios.post(
      phonepeUrl,
      { request: encodedReq },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "Authorization": `O-Bearer ${tokenData.encryptedAccessToken}`,
          "accept": "application/json",
        },
        timeout: 15000,
      }
    );

    const data = resp.data;
    console.log("PhonePe Response:", data);

    if (!data || !data.success) {
      console.error("PhonePe createOrder error:", data);
      return res.status(500).json({ message: "PhonePe returned error", phonepe: data });
    }

    const redirectInfo = data?.data?.instrumentResponse?.redirectInfo || data?.data?.redirectInfo;
    const paymentUrl = redirectInfo?.url || null;
    if (!paymentUrl) {
      return res.status(500).json({
        message: "Could not find redirect URL in PhonePe response",
        phonepe: data,
      });
    }

    const paymentTransaction = new PaymentTransactionModel({
      userId,
      merchantTransactionId,
      amount: totalAmount,
      paymentStatus: "INITIATED",
      phonepeResponse: data,
      userDetails: {
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      },
      shippingDetails: {
        name: shippingDetails.name,
        address: {
          street: shippingDetails.address.street,
          city: shippingDetails.address.city,
          zipCode: shippingDetails.address.zipCode,
          state: shippingDetails.address.state || "",
          alternatePhone: shippingDetails.address.alternatePhone || "",
          addressType: shippingDetails.address.addressType || "home",
        },
        phoneNumber: shippingDetails.phoneNumber,
      },
      productDetails: items,
      appliedCoupon,
    });

    await paymentTransaction.save();

    return res.json({ 
      success: true,
      paymentUrl, 
      merchantTransactionId, 
      amount: totalAmount, 
      raw: data 
    });
  } catch (err) {
    console.error("PhonePe createOrder error:", err?.response?.data || err.message || err);
    return res
      .status(500)
      .json({ 
        message: "Server error creating PhonePe order", 
        error: err?.response?.data?.message || err.message 
      });
  }
});

// ✅ VERIFY PAYMENT STATUS - Using proper credentials
router.post("/verify", async (req, res) => {
  try {
    const { merchantTransactionId } = req.body;

    if (!merchantTransactionId) {
      return res.status(400).json({ message: "merchantTransactionId is required" });
    }

    const paymentTransaction = await PaymentTransactionModel.findOne({ merchantTransactionId });
    if (!paymentTransaction) {
      return res.status(404).json({ message: "Payment transaction not found" });
    }

    if (paymentTransaction.paymentStatus === "COMPLETED" && paymentTransaction.orderId) {
      return res.json({
        success: true,
        paymentStatus: "COMPLETED",
        orderId: paymentTransaction.orderId,
        message: "Payment already verified/processed",
      });
    }

    // Get OAuth token first
    const tokenData = await getPhonePeAccessToken();

    // Dynamic endpoint based on environment
    const statusEndpoint = process.env.NODE_ENV === "production" 
      ? `/v1/status/${MERCHANT_ID}/${merchantTransactionId}`
      : `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
    
    const phonepeUrl = `${PHONEPE_PG_HOST}${statusEndpoint}`;

    // Use SALT_KEY for checksum (not CLIENT_SECRET)
    const payload = statusEndpoint + SALT_KEY;
    const sha = crypto.createHash("sha256").update(payload).digest("hex");
    const checksum = `${sha}###${SALT_INDEX}`;

    const resp = await axios.get(phonepeUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "Authorization": `O-Bearer ${tokenData.encryptedAccessToken}`,
        "accept": "application/json",
      },
      timeout: 15000,
    });

    const data = resp.data;
    if (!data || !data.success) {
      console.error("PhonePe verification failed:", data);
      return res.status(500).json({ message: "PhonePe verification failed", phonepe: data });
    }

    const paymentInfo = data.data;
    const isPaymentSuccessful = paymentInfo.state === "COMPLETED";

    const atomicUpdate = {
      $set: {
        paymentStatus: isPaymentSuccessful ? "COMPLETED" : "FAILED",
        phonepeTransactionId: paymentInfo.transactionId,
        verificationResponse: data,
        completedAt: new Date(),
        processedAt: new Date(),
      },
    };

    const updatedPaymentTransaction = await PaymentTransactionModel.findOneAndUpdate(
      { merchantTransactionId, orderId: { $exists: false }, paymentStatus: { $ne: "COMPLETED" } },
      atomicUpdate,
      { new: true }
    );

    if (!updatedPaymentTransaction) {
      const existing = await PaymentTransactionModel.findOne({ merchantTransactionId }).populate("orderId");
      return res.json({
        success: existing.paymentStatus === "COMPLETED",
        paymentStatus: existing.paymentStatus,
        orderId: existing.orderId,
        message: "Transaction already processed by another request",
      });
    }

    let order = null;
    if (isPaymentSuccessful) {
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
          transactionId: paymentInfo.transactionId,
          verificationResponse: data,
        },
        appliedCoupon: updatedPaymentTransaction.appliedCoupon,
      });

      await order.save();

      try {
        console.log("Generating AWB for online order:", order.orderNumber);
        const { createShipment } = require("../utils/xpressbeesService");
        const shipmentRes = await createShipment(order);
        if (shipmentRes.status && shipmentRes.data?.awb_number) {
          order.awbNumber = shipmentRes.data.awb_number;
          order.shippingLabelUrl = shipmentRes.data.label || null;
          await order.save();
        }
      } catch (awbErr) {
        console.error("Xpressbees AWB generation error:", awbErr?.message || awbErr);
      }

      for (const item of updatedPaymentTransaction.productDetails) {
        try {
          const product = await ProductModal.findById(item.productId);
          if (!product) continue;
          const colorIndex = product.colors.findIndex((c) => c.name === item.color);
          if (colorIndex === -1) continue;
          const sizeIndex = product.colors[colorIndex].sizes.findIndex((s) => s.size === item.size);
          if (sizeIndex === -1) continue;
          product.colors[colorIndex].sizes[sizeIndex].quantity -= item.quantity;
          await product.save();
        } catch (updateError) {
          console.error(`Error updating product ${item.productId}:`, updateError);
        }
      }

      updatedPaymentTransaction.orderId = order._id;
      await updatedPaymentTransaction.save();

      try {
        const user = await UserModel.findById(updatedPaymentTransaction.userId);
        if (user) {
          user.cart = new Map();
          await user.save();
        }
      } catch (cartErr) {
        console.error("Failed to clear user cart:", cartErr);
      }

      try {
        await sendOrderConfirmationEmail(order._id);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    }

    return res.json({
      success: isPaymentSuccessful,
      paymentStatus: updatedPaymentTransaction.paymentStatus,
      orderId: updatedPaymentTransaction.orderId || (order && order._id),
      transactionId: paymentInfo.transactionId,
      data: paymentInfo,
    });
  } catch (err) {
    console.error("Payment verification error:", err?.response?.data || err.message || err);
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      return res.status(401).json({
        message: "Unauthorized — invalid checksum or credentials",
        phonepe: err?.response?.data || {},
      });
    }
    return res
      .status(500)
      .json({ message: "Server error during payment verification", error: err?.response?.data || err.message });
  }
});

// ... rest of the routes remain the same

// module.exports = { phonepeRoutes: router };


// ✅ CALLBACK HANDLER (remains the same)
router.post("/callback", async (req, res) => {
  try {
    console.log("📥 PhonePe redirect callback received:", req.body);
    const { merchantTransactionId, code, message } = req.body;

    if (!merchantTransactionId) {
      return res.status(400).json({ message: "merchantTransactionId is required" });
    }

    const paymentTransaction = await PaymentTransactionModel.findOne({ merchantTransactionId });
    if (!paymentTransaction) {
      return res.status(404).json({ message: "Payment transaction not found" });
    }

    paymentTransaction.paymentStatus = code === "PAYMENT_SUCCESS" ? "COMPLETED" : "FAILED";
    paymentTransaction.metadata = {
      callbackCode: code,
      callbackMessage: message,
      callbackReceivedAt: new Date(),
    };
    await paymentTransaction.save();

    return res.json({ received: true, status: paymentTransaction.paymentStatus });
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
const handleFrontendCallback = async (req, res) => {
  try {
    const merchantTransactionId =
      req.query.merchantTransactionId || req.body.merchantTransactionId || null;

    if (!merchantTransactionId) {
      return res.status(400).send("Missing merchantTransactionId");
    }

    const frontendUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/phonepe-callback?merchantTransactionId=${merchantTransactionId}`;

    return res.redirect(frontendUrl);
  } catch (error) {
    console.error("Error redirecting from PhonePe callback:", error);
    return res.status(500).send("Internal server error");
  }
};

router.get("/frontend-callback", handleFrontendCallback);
router.post("/frontend-callback", handleFrontendCallback);

module.exports = { phonepeRoutes: router };
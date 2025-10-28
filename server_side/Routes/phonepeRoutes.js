// // Routes/phonepeRoutes.js
// const dotenv = require("dotenv");
// dotenv.config();
// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const crypto = require("crypto");
// const { verifyToken } = require("../Middlewares/VerifyToken");
// const { UserModel, OrderModel, CounterModel } = require("../Modals/UserModal");
// // const CounterModel = require("../Modals/counterModal");
// const PaymentTransactionModel = require("../Modals/paymentModal");
// const ProductModal = require("../Modals/productModal");
// const { sendOrderConfirmationEmail } = require("../utils/orderProdctService");
// // // Production PhonePe configuration
// const PHONEPE_HOST =
//   process.env.NODE_ENV === "production"
//     ? "https://api.phonepe.com/apis/pg" // Use production URL when ready
//     : "https://api-preprod.phonepe.com/apis/pg-sandbox";

// // const PHONEPE_HOST =
// //   process.env.NODE_ENV === "production"
// //     ? "https://api.phonepe.com/apis/pg"
// //     : "https://api-preprod.phonepe.com/apis/pg-sandbox";

// const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
// const SALT_KEY = process.env.PHONEPE_SALT_KEY;
// const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

// /**
//  * ✅ Utility to build checksum (X-VERIFY)
//  * Formula:
//  *   SHA256( base64EncodedPayload + "/pg/v1/pay" + SALT_KEY ) + "###" + SALT_INDEX
//  */
// // after deployment
// // function buildPhonePeChecksum(encodedReq, uri = "/v1/pay") {
// // local testing
// function buildPhonePeChecksum(encodedReq, uri = "/pg/v1/pay") {
//   const payload = encodedReq + uri + SALT_KEY;
//   const sha = crypto.createHash("sha256").update(payload).digest("hex");
//   return `${sha}###${SALT_INDEX}`;
// }

// /**
//  * ✅ Utility to verify PhonePe response checksum
//  */
// function verifyPhonePeChecksum(
//   encodedResponse,
//   checksum,
//   uri = "/pg/v1/status"
// ) {
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

// router.post("/createOrder", verifyToken, async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { shippingDetails, couponCode } = req.body;

//     console.log("PhonePe createOrder request body:", {
//       shippingDetails,
//       couponCode,
//     });

//     // Validate shipping details strictly (order schema requires these)
//     if (
//       !shippingDetails ||
//       !shippingDetails.name ||
//       !shippingDetails.phoneNumber ||
//       !shippingDetails.address ||
//       !shippingDetails.address.street ||
//       !shippingDetails.address.city ||
//       !shippingDetails.address.zipCode
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Missing required shipping information" });
//     }

//     const user = await UserModel.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // user.cart is a Map in your schema: convert to array of values
//     const cartItems = Array.from(
//       user.cart.values ? user.cart.values() : user.cart || []
//     );
//     if (!cartItems || cartItems.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     // Build items array for transaction and order (ensure image present)
//     const items = [];
//     for (const c of cartItems) {
//       // If cart stores productId as object or id, normalize
//       const productId = c.productId?._id || c.productId;
//       const image = c.image || c.productId?.image || null || ""; // fallback to empty string (order requires image)
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

//     // Calculate total
//     let totalAmount = items.reduce(
//       (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
//       0
//     );

//     // Apply coupon if provided (safe check)
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
//         const finalDiscount = Math.min(
//           discountAmount,
//           coupon.maxDiscountAmount || discountAmount
//         );
//         totalAmount -= finalDiscount;
//         appliedCoupon = {
//           couponCode: coupon.couponCode,
//           discountPercentage: coupon.discountPercentage,
//           discountAmount: finalDiscount,
//         };
//         coupon.usedCount = (coupon.usedCount || 0) + 1;
//         await coupon
//           .save()
//           .catch((e) => console.warn("Coupon save failed:", e.message));
//       }
//     }

//     // Generate merchant transaction id
//     const merchantTransactionId = `ORD_${Date.now()}_${Math.floor(
//       Math.random() * 1000
//     )}`;

//     // Build PhonePe payload
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
//       validityTime: "600000",
//     };

//     const requestStr = JSON.stringify(requestBody);
//     const encodedReq = Buffer.from(requestStr).toString("base64");
//     // buildPhonePeChecksum should handle salt/key/index concats — fallback to inline if absent
//     const checksum =
//       typeof buildPhonePeChecksum === "function"
//         ? buildPhonePeChecksum(encodedReq)
//         : crypto
//             .createHash("sha256")
//             .update(encodedReq + SALT_KEY)
//             .digest("hex") +
//           "###" +
//           SALT_INDEX;

//     const phonepeUrl = `${PHONEPE_HOST}/pg/v1/pay`;

//     // Call PhonePe pay API
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
//     if (!data || !data.success) {
//       console.error("PhonePe createOrder error:", data);
//       return res
//         .status(500)
//         .json({ message: "PhonePe returned error", phonepe: data });
//     }

//     const redirectInfo =
//       data?.data?.instrumentResponse?.redirectInfo || data?.data?.redirectInfo;
//     const paymentUrl = redirectInfo?.url || null;
//     if (!paymentUrl) {
//       return res
//         .status(500)
//         .json({
//           message: "Could not find redirect URL in PhonePe response",
//           phonepe: data,
//         });
//     }

//     // Save payment transaction (do not create Order yet)
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
//       productDetails: items.map((it) => ({
//         productId: it.productId,
//         name: it.name,
//         quantity: it.quantity,
//         price: it.price,
//         color: it.color,
//         size: it.size,
//         image: it.image || "",
//         sku: it.sku || null,
//         packageWeight: it.packageWeight || null,
//         packageLength: it.packageLength || null,
//         packageBreadth: it.packageBreadth || null,
//         packageHeight: it.packageHeight || null,
//       })),
//       appliedCoupon,
//     });

//     await paymentTransaction.save();

//     // await paymentTransaction.save();

//     // Return PhonePe redirect info to frontend
//     return res.json({
//       paymentUrl,
//       merchantTransactionId,
//       amount: totalAmount,
//       raw: data,
//     });
//   } catch (err) {
//     console.error(
//       "PhonePe createOrder error:",
//       err?.response?.data || err.message || err
//     );
//     return res
//       .status(500)
//       .json({
//         message: "Server error creating PhonePe order",
//         error: err?.response?.data || err.message,
//       });
//   }
// });

// // router.post("/verify", async (req, res) => {
// //   try {
// //     const { merchantTransactionId } = req.body;

// //     if (!merchantTransactionId) {
// //       return res
// //         .status(400)
// //         .json({ message: "merchantTransactionId is required" });
// //     }

// //     // Find payment transaction
// //     const paymentTransaction = await PaymentTransactionModel.findOne({
// //       merchantTransactionId,
// //     });

// //     if (!paymentTransaction) {
// //       return res.status(404).json({ message: "Payment transaction not found" });
// //     }

// //     // If payment is already completed, don't process again
// //     if (paymentTransaction.paymentStatus === "COMPLETED") {
// //       return res.json({
// //         success: true,
// //         paymentStatus: "COMPLETED",
// //         orderId: paymentTransaction.orderId,
// //         message: "Payment already verified",
// //       });
// //     }

// //     // ✅ Build proper URL & checksum for GET status
// //     const uri = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
// //     const phonepeUrl = `${PHONEPE_HOST}${uri}`;

// //     const payload = uri + SALT_KEY;
// //     const sha = crypto.createHash("sha256").update(payload).digest("hex");
// //     const checksum = `${sha}###${SALT_INDEX}`;

// //     // ✅ Request PhonePe status
// //     const resp = await axios.get(phonepeUrl, {
// //       headers: {
// //         "Content-Type": "application/json",
// //         "X-VERIFY": checksum,
// //         "X-MERCHANT-ID": MERCHANT_ID,
// //         accept: "application/json",
// //       },
// //       timeout: 15000,
// //     });

// //     const data = resp.data;

// //     if (!data || !data.success) {
// //       console.error("PhonePe verification failed:", data);
// //       return res.status(500).json({
// //         message: "PhonePe verification failed",
// //         phonepe: data,
// //       });
// //     }

// //     const paymentInfo = data.data;
// //     const isPaymentSuccessful = paymentInfo.state === "COMPLETED";

// //     // ✅ Update payment transaction
// //     paymentTransaction.paymentStatus = isPaymentSuccessful
// //       ? "COMPLETED"
// //       : "FAILED";
// //     paymentTransaction.phonepeTransactionId = paymentInfo.transactionId;
// //     paymentTransaction.verificationResponse = data;
// //     paymentTransaction.completedAt = new Date();

// //     let order = null;

// //     if (isPaymentSuccessful) {
// //       // ✅ Create order only if it doesn't exist
// //       if (!paymentTransaction.orderId) {
// //         // Get next order number
// //         const orderNumber = await getNextOrderNumber();
        
// //         // Create proper shipping address from stored shippingDetails with safety checks
// //         const shippingDetails = paymentTransaction.shippingDetails || {};
// //         const shippingAddress = {
// //           name: shippingDetails.name || "Not Provided",
// //           address: {
// //             street: shippingDetails.address?.street || "Not Provided",
// //             city: shippingDetails.address?.city || "Not Provided", 
// //             zipCode: shippingDetails.address?.zipCode || "000000",
// //             state: shippingDetails.address?.state || "Not Provided",
// //             alternatePhone: shippingDetails.address?.alternatePhone || "",
// //             addressType: shippingDetails.address?.addressType || "home",
// //           },
// //           phoneNumber: shippingDetails.phoneNumber || "Not Provided",
// //         };

// //         console.log("Creating order with shipping address:", shippingAddress);

// //         // Create new order
// //         order = new OrderModel({
// //           userId: paymentTransaction.userId,
// //           items: paymentTransaction.productDetails,
// //           totalAmount: paymentTransaction.amount,
// //           shippingAddress: shippingAddress,
// //           paymentMethod: "prepaid",
// //           status: "processing",
// //           orderNumber: orderNumber,
// //           paymentDetails: {
// //             merchantTransactionId,
// //             paymentStatus: "COMPLETED",
// //             transactionId: paymentInfo.transactionId,
// //             verificationResponse: data,
// //           },
// //           appliedCoupon: paymentTransaction.appliedCoupon,
// //         });

// //         await order.save();

// //         // ✅ Generate AWB for online orders too
// //         try {
// //           console.log('Generating AWB for online order:', order.orderNumber);
// //           const { createShipment } = require("../utils/xpressbeesService");
// //           const shipmentRes = await createShipment(order);
// //           console.log("Xpressbees response for online order:", shipmentRes);

// //           if (shipmentRes.status && shipmentRes.data?.awb_number) {
// //             order.awbNumber = shipmentRes.data.awb_number;
// //             order.shippingLabelUrl = shipmentRes.data.label || null;
// //             await order.save();
// //             console.log("AWB generated successfully for online order:", order.awbNumber);
// //           } else {
// //             console.error("AWB generation failed for online order:", shipmentRes);
// //           }
// //         } catch (err) {
// //           console.error("Xpressbees AWB generation error for online order:", err.message);
// //         }

// //         // Update product quantities
// //         for (const item of paymentTransaction.productDetails) {
// //           try {
// //             const product = await ProductModal.findById(item.productId);
// //             if (!product) {
// //               console.error(`Product ${item.productId} not found`);
// //               continue;
// //             }

// //             const colorIndex = product.colors.findIndex(
// //               (c) => c.name === item.color
// //             );

// //             if (colorIndex === -1) {
// //               console.error(`Color not found for product ${item.productId}`);
// //               continue;
// //             }

// //             const sizeIndex = product.colors[colorIndex].sizes.findIndex(
// //               (s) => s.size === item.size
// //             );

// //             if (sizeIndex === -1) {
// //               console.error(
// //                 `Size ${item.size} not found for product ${item.productId}`
// //               );
// //               continue;
// //             }

// //             product.colors[colorIndex].sizes[sizeIndex].quantity -= item.quantity;
// //             await product.save();
// //           } catch (updateError) {
// //             console.error(`Error updating product ${item.productId}:`, updateError);
// //           }
// //         }

// //         // Link order to payment transaction
// //         paymentTransaction.orderId = order._id;
        
// //         // Clear user's cart
// //         const user = await UserModel.findById(paymentTransaction.userId);
// //         if (user) {
// //           user.cart = new Map();
// //           await user.save();
// //         }

// //         // Send confirmation email (non-blocking)
// //         try {
// //           await sendOrderConfirmationEmail(order._id);
// //         } catch (emailError) {
// //           console.error("Email sending failed:", emailError);
// //         }
// //       } else {
// //         // Order already exists, just fetch it
// //         order = await OrderModel.findById(paymentTransaction.orderId);
// //       }
// //     }

// //     await paymentTransaction.save();

// //     return res.json({
// //       success: isPaymentSuccessful,
// //       paymentStatus: paymentTransaction.paymentStatus,
// //       orderId: paymentTransaction.orderId,
// //       transactionId: paymentInfo.transactionId,
// //       data: paymentInfo,
// //     });
// //   } catch (err) {
// //     console.error(
// //       "Payment verification error:",
// //       err?.response?.data || err.message
// //     );

// //     if (err?.response?.status === 401 || err?.response?.status === 403) {
// //       return res.status(401).json({
// //         message: "Unauthorized — invalid checksum or credentials",
// //         phonepe: err?.response?.data || {},
// //       });
// //     }

// //     return res.status(500).json({
// //       message: "Server error during payment verification",
// //       error: err?.response?.data || err.message,
// //     });
// //   }
// // });

// router.post("/verify", async (req, res) => {
//   try {
//     const { merchantTransactionId } = req.body;

//     if (!merchantTransactionId) {
//       return res.status(400).json({ message: "merchantTransactionId is required" });
//     }

//     // Find payment transaction first (fast fail)
//     const paymentTransaction = await PaymentTransactionModel.findOne({ merchantTransactionId });
//     if (!paymentTransaction) {
//       return res.status(404).json({ message: "Payment transaction not found" });
//     }

//     // If it's already COMPLETED and linked to an order, return idempotently
//     if (paymentTransaction.paymentStatus === "COMPLETED" && paymentTransaction.orderId) {
//       return res.json({
//         success: true,
//         paymentStatus: "COMPLETED",
//         orderId: paymentTransaction.orderId,
//         message: "Payment already verified/processed",
//       });
//     }

//     // Build checksum & call PhonePe status endpoint
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

//     const paymentInfo = data.data;
//     const isPaymentSuccessful = paymentInfo.state === "COMPLETED";

//     // === Atomic update to mark this payment transaction processed (prevents double-creation) ===
//     // We only allow the update to succeed if orderId is null and paymentStatus !== "COMPLETED".
//     const atomicUpdate = {
//       $set: {
//         paymentStatus: isPaymentSuccessful ? "COMPLETED" : "FAILED",
//         phonepeTransactionId: paymentInfo.transactionId,
//         verificationResponse: data,
//         completedAt: new Date(),
//         // optional processing flag/time
//         processedAt: new Date(),
//       },
//     };

//     const updatedPaymentTransaction = await PaymentTransactionModel.findOneAndUpdate(
//       {
//         merchantTransactionId,
//         orderId: { $exists: false }, // no order yet
//         paymentStatus: { $ne: "COMPLETED" }, // not already completed
//       },
//       atomicUpdate,
//       { new: true }
//     );

//     // If atomicUpdate didn't match, that means another request already processed this transaction.
//     if (!updatedPaymentTransaction) {
//       const existing = await PaymentTransactionModel.findOne({ merchantTransactionId }).populate("orderId");
//       return res.json({
//         success: existing.paymentStatus === "COMPLETED",
//         paymentStatus: existing.paymentStatus,
//         orderId: existing.orderId,
//         message: "Transaction already processed by another request",
//       });
//     }

//     // Proceed to create order only for the request that won the atomic update
//     let order = null;
//     if (isPaymentSuccessful) {
//       // Build shipping address safely from stored paymentTransaction
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

//       // Generate an order number atomically (your getNextOrderNumber should be safe as it's using findByIdAndUpdate with upsert)
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

//       // Try generate AWB (non-blocking)
//       try {
//         console.log("Generating AWB for online order:", order.orderNumber);
//         const { createShipment } = require("../utils/xpressbeesService");
//         const shipmentRes = await createShipment(order);
//         console.log("Xpressbees response for online order:", shipmentRes);

//         if (shipmentRes.status && shipmentRes.data?.awb_number) {
//           order.awbNumber = shipmentRes.data.awb_number;
//           order.shippingLabelUrl = shipmentRes.data.label || null;
//           await order.save();
//           console.log("AWB generated successfully for online order:", order.awbNumber);
//         } else {
//           console.error("AWB generation failed for online order (response):", shipmentRes);
//         }
//       } catch (awbErr) {
//         console.error("Xpressbees AWB generation error for online order:", awbErr?.message || awbErr);
//       }

//       // Update product quantities (best-effort)
//       for (const item of updatedPaymentTransaction.productDetails) {
//         try {
//           const product = await ProductModal.findById(item.productId);
//           if (!product) {
//             console.error(`Product ${item.productId} not found`);
//             continue;
//           }

//           const colorIndex = product.colors.findIndex((c) => c.name === item.color);
//           if (colorIndex === -1) {
//             console.error(`Color not found for product ${item.productId}`);
//             continue;
//           }

//           const sizeIndex = product.colors[colorIndex].sizes.findIndex((s) => s.size === item.size);
//           if (sizeIndex === -1) {
//             console.error(`Size ${item.size} not found for product ${item.productId}`);
//             continue;
//           }

//           product.colors[colorIndex].sizes[sizeIndex].quantity -= item.quantity;
//           await product.save();
//         } catch (updateError) {
//           console.error(`Error updating product ${item.productId}:`, updateError);
//         }
//       }

//       // Link order to payment transaction (save)
//       updatedPaymentTransaction.orderId = order._id;
//       await updatedPaymentTransaction.save();

//       // Clear user's cart
//       try {
//         const user = await UserModel.findById(updatedPaymentTransaction.userId);
//         if (user) {
//           user.cart = new Map();
//           await user.save();
//         }
//       } catch (cartErr) {
//         console.error("Failed to clear user cart:", cartErr);
//       }

//       // Send confirmation email (non-blocking)
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
//     return res.status(500).json({ message: "Server error during payment verification", error: err?.response?.data || err.message });
//   }
// });


// router.post("/callback", async (req, res) => {
//   try {
//     console.log("📥 PhonePe redirect callback received:", req.body);

//     const { merchantTransactionId, code, message } = req.body;

//     if (!merchantTransactionId) {
//       return res
//         .status(400)
//         .json({ message: "merchantTransactionId is required" });
//     }

//     // Find payment transaction
//     const paymentTransaction = await PaymentTransactionModel.findOne({
//       merchantTransactionId: merchantTransactionId,
//     });

//     if (!paymentTransaction) {
//       return res.status(404).json({ message: "Payment transaction not found" });
//     }

//     // Update payment status based on callback
//     if (code === "PAYMENT_SUCCESS") {
//       paymentTransaction.paymentStatus = "COMPLETED";
//     } else {
//       paymentTransaction.paymentStatus = "FAILED";
//     }

//     paymentTransaction.metadata = {
//       callbackCode: code,
//       callbackMessage: message,
//       callbackReceivedAt: new Date(),
//     };

//     await paymentTransaction.save();

//     return res.json({
//       received: true,
//       status: paymentTransaction.paymentStatus,
//     });
//   } catch (err) {
//     console.error("callback error", err);
//     return res.status(500).json({ received: false, error: err.message });
//   }
// });

// /**
//  * 📌 Get payment transactions (Admin)
//  * GET /api/phonepe/transactions
//  */
// router.get("/transactions", verifyToken, async (req, res) => {
//   try {
//     // Check if user is admin (you can implement your admin check here)
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

// /**
//  * 📌 Route to safely redirect users from PhonePe to frontend (handles both GET & POST)
//  */
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

// // Handle both GET and POST
// router.get("/frontend-callback", handleFrontendCallback);
// router.post("/frontend-callback", handleFrontendCallback);

// module.exports = { phonepeRoutes: router };


// Routes/phonepeRoutes.js
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

// ✅ Production PhonePe configuration
const PHONEPE_HOST =
  process.env.NODE_ENV === "production"
    ? "https://api.phonepe.com/apis/pg"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

/**
 * ✅ Utility to build checksum (X-VERIFY)
 * Formula:
 *   SHA256( base64EncodedPayload + "/v1/pay" + SALT_KEY ) + "###" + SALT_INDEX
 */
function buildPhonePeChecksum(encodedReq, uri = "/v1/pay") {
  const payload = encodedReq + uri + SALT_KEY;
  const sha = crypto.createHash("sha256").update(payload).digest("hex");
  return `${sha}###${SALT_INDEX}`;
}

/**
 * ✅ Utility to verify PhonePe response checksum
 */
function verifyPhonePeChecksum(encodedResponse, checksum, uri = "/v1/status") {
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

// ✅ CREATE ORDER
router.post("/createOrder", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shippingDetails, couponCode } = req.body;

    console.log("PhonePe createOrder request body:", { shippingDetails, couponCode });

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
      merchantId: MERCHANT_ID,
      merchantTransactionId,
      amount: amountPaise,
      redirectUrl,
      redirectMode: "POST",
      merchantUserId: userId.toString(),
      paymentInstrument: { type: "PAY_PAGE" },
      validityTime: "600000",
    };

    const requestStr = JSON.stringify(requestBody);
    const encodedReq = Buffer.from(requestStr).toString("base64");
    const checksum = buildPhonePeChecksum(encodedReq, "/v1/pay");

    const phonepeUrl = `${PHONEPE_HOST}/v1/pay`;

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
      return res.status(500).json({ message: "PhonePe returned error", phonepe: data });
    }

    const redirectInfo =
      data?.data?.instrumentResponse?.redirectInfo || data?.data?.redirectInfo;
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

    return res.json({ paymentUrl, merchantTransactionId, amount: totalAmount, raw: data });
  } catch (err) {
    console.error("PhonePe createOrder error:", err?.response?.data || err.message || err);
    return res
      .status(500)
      .json({ message: "Server error creating PhonePe order", error: err?.response?.data || err.message });
  }
});

// ✅ VERIFY PAYMENT STATUS
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

    const uri = `/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
    const phonepeUrl = `${PHONEPE_HOST}${uri}`;

    const payload = uri + SALT_KEY;
    const sha = crypto.createHash("sha256").update(payload).digest("hex");
    const checksum = `${sha}###${SALT_INDEX}`;

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

// ✅ CALLBACK HANDLER
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

// ✅ ADMIN TRANSACTIONS
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

// ✅ FRONTEND CALLBACK REDIRECT HANDLER
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

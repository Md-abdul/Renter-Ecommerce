// // const express = require("express");
// // const phonepeRoutes = express.Router();
// // const axios = require("axios");
// // const sha256 = require("sha256");
// // const uniqid = require("uniqid");
// // const { OrderModel } = require("../Modals/UserModal");
// // const dotenv = require("dotenv");

// // // UAT environment - Move these to .env later
// // const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT";
// // const PHONE_PE_HOST_URL = process.env.PHONEPE_HOST_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";
// // const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
// // const SALT_KEY = process.env.PHONEPE_SALT_KEY || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";

// // // Endpoint to initiate a payment
// // phonepeRoutes.post("/initiate", async function (req, res) {
// //   try {
// //     const { amount, orderId, userId } = req.body;

// //     if (!amount || !orderId || !userId) {
// //       return res.status(400).json({ error: "Missing required fields" });
// //     }

// //     // Generate a unique merchant transaction ID for each transaction
// //     let merchantTransactionId = uniqid();

// //     const payload = {
// //       merchantId: MERCHANT_ID,
// //       merchantTransactionId: merchantTransactionId,
// //       merchantUserId: userId,
// //       amount: amount * 100, // converting to paise
// //       redirectUrl: `${process.env.BACKEND_URL}/api/payments/validate/${merchantTransactionId}`,
// //       redirectMode: "POST",
// //       mobileNumber: "9999999999", // You can get this from user profile
// //       paymentInstrument: {
// //         type: "PAY_PAGE",
// //       },
// //     };

// //     // make base64 encoded payload
// //     const base64EncodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64");

// //     // Generate X-VERIFY header
// //     const string = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
// //     const sha256_val = sha256(string);
// //     const xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

// //     const response = await axios.post(
// //       `${PHONE_PE_HOST_URL}/pg/v1/pay`,
// //       { request: base64EncodedPayload },
// //       {
// //         headers: {
// //           "Content-Type": "application/json",
// //           "X-VERIFY": xVerifyChecksum,
// //           accept: "application/json",
// //         },
// //       }
// //     );

// //     // Update order with payment details
// //     await OrderModel.findOneAndUpdate(
// //       { _id: orderId },
// //       {
// //         "paymentDetails.merchantTransactionId": merchantTransactionId,
// //         "paymentDetails.paymentStatus": "INITIATED",
// //       }
// //     );

// //     res.json({
// //       success: true,
// //       paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
// //     });
// //   } catch (error) {
// //     console.error("Payment initiation error:", error);
// //     res.status(500).json({ error: "Payment initiation failed" });
// //   }
// // });

// // // Endpoint to validate payment
// // phonepeRoutes.post("/validate/:merchantTransactionId", async function (req, res) {
// //   try {
// //     const { merchantTransactionId } = req.params;

// //     if (!merchantTransactionId) {
// //       return res.status(400).json({ error: "Missing merchant transaction ID" });
// //     }

// //     const statusUrl = `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;

// //     // Generate X-VERIFY header
// //     const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY;
// //     const sha256_val = sha256(string);
// //     const xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

// //     const response = await axios.get(statusUrl, {
// //       headers: {
// //         "Content-Type": "application/json",
// //         "X-VERIFY": xVerifyChecksum,
// //         "X-MERCHANT-ID": merchantTransactionId,
// //         accept: "application/json",
// //       },
// //     });

// //     const paymentData = response.data;

// //     // Update order status based on payment status
// //     if (paymentData.code === "PAYMENT_SUCCESS") {
// //       const order = await OrderModel.findOneAndUpdate(
// //         { "paymentDetails.merchantTransactionId": merchantTransactionId },
// //         {
// //           "paymentDetails.paymentStatus": "COMPLETED",
// //           "paymentDetails.transactionId": paymentData.transactionId,
// //           "paymentDetails.verificationResponse": paymentData,
// //           status: "processing", // Update order status to processing
// //         },
// //         { new: true }
// //       );

// //       return res.json({
// //         success: true,
// //         order,
// //         paymentStatus: "COMPLETED",
// //       });
// //     } else {
// //       await OrderModel.findOneAndUpdate(
// //         { "paymentDetails.merchantTransactionId": merchantTransactionId },
// //         {
// //           "paymentDetails.paymentStatus": "FAILED",
// //           "paymentDetails.verificationResponse": paymentData,
// //         }
// //       );

// //       return res.json({
// //         success: false,
// //         paymentStatus: "FAILED",
// //         message: paymentData.message || "Payment failed",
// //       });
// //     }
// //   } catch (error) {
// //     console.error("Payment validation error:", error);
// //     res.status(500).json({ error: "Payment validation failed" });
// //   }
// // });

// // module.exports = phonepeRoutes;

// const express = require("express");
// const phonepeRoutes = express.Router();
// const axios = require("axios");
// const sha256 = require("sha256");
// const uniqid = require("uniqid");
// const { OrderModel } = require("../Modals/UserModal");

// // PhonePe configuration
// const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT";
// const PHONE_PE_HOST_URL =
//   process.env.PHONEPE_HOST_URL ||
//   "https://api-preprod.phonepe.com/apis/pg-sandbox";
// const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
// const PHONEPE_SALT_KEY =
//   process.env.PHONEPE_SALT_KEY || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";

// // Initiate PhonePe payment
// phonepeRoutes.post("/initiate", async (req, res) => {
//   try {
//     const { orderId, amount, userId } = req.body;

//     if (!orderId || !amount || !userId) {
//       return res.status(400).json({
//         success: false,
//         message: "Order ID, amount and user ID are required",
//       });
//     }

//     // Generate a unique merchant transaction ID
//     const merchantTransactionId = uniqid();

//     // Create payload for PhonePe
//     const payload = {
//       merchantId: PHONEPE_MERCHANT_ID,
//       merchantTransactionId,
//       merchantUserId: userId,
//       amount: amount * 100, // Convert to paise
//       redirectUrl: `${process.env.BACKEND_URL}/api/phonepe/validate/${merchantTransactionId}`,
//       redirectMode: "POST",
//       paymentInstrument: {
//         type: "PAY_PAGE",
//       },
//     };

//     // Base64 encode the payload
//     const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
//       "base64"
//     );

//     // Generate X-VERIFY header
//     const string = base64Payload + "/pg/v1/pay" + PHONEPE_SALT_KEY;
//     const sha256Hash = sha256(string);
//     const xVerifyHeader = sha256Hash + "###" + PHONEPE_SALT_INDEX;

//     // Call PhonePe API
//     const response = await axios.post(
//       `${PHONE_PE_HOST_URL}/pg/v1/pay`,
//       { request: base64Payload },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "X-VERIFY": xVerifyHeader,
//           accept: "application/json",
//         },
//       }
//     );

//     // Update order with payment details
//     await OrderModel.findByIdAndUpdate(orderId, {
//       "paymentDetails.merchantTransactionId": merchantTransactionId,
//       "paymentDetails.paymentStatus": "INITIATED",
//       "paymentDetails.initiatedAt": new Date(),
//       "paymentDetails.paymentUrl":
//         response.data.data.instrumentResponse.redirectInfo.url,
//     });

//     res.json({
//       success: true,
//       data: response.data,
//       message: "Payment initiated successfully",
//     });
//   } catch (error) {
//     console.error("Payment initiation error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.response?.data?.message || "Failed to initiate payment",
//     });
//   }
// });

// // Validate PhonePe payment
// phonepeRoutes.post("/validate/:merchantTransactionId", async (req, res) => {
//   try {
//     const { merchantTransactionId } = req.params;

//     if (!merchantTransactionId) {
//       return res.status(400).json({
//         success: false,
//         message: "Merchant transaction ID is required",
//       });
//     }

//     // Generate X-VERIFY header for status check
//     const statusString =
//       `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}` +
//       PHONEPE_SALT_KEY;
//     const statusHash = sha256(statusString);
//     const xVerifyHeader = statusHash + "###" + PHONEPE_SALT_INDEX;

//     // Check payment status with PhonePe
//     const statusResponse = await axios.get(
//       `${PHONE_PE_HOST_URL}/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "X-VERIFY": xVerifyHeader,
//           accept: "application/json",
//         },
//       }
//     );

//     const paymentData = statusResponse.data;

//     // Find and update the order based on payment status
//     const order = await OrderModel.findOneAndUpdate(
//       { "paymentDetails.merchantTransactionId": merchantTransactionId },
//       {
//         "paymentDetails.paymentStatus":
//           paymentData.code === "PAYMENT_SUCCESS" ? "COMPLETED" : "FAILED",
//         "paymentDetails.transactionId": paymentData.transactionId,
//         "paymentDetails.verificationResponse": paymentData,
//         status:
//           paymentData.code === "PAYMENT_SUCCESS" ? "processing" : "pending",
//         updatedAt: new Date(),
//       },
//       { new: true }
//     );

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     if (paymentData.code === "PAYMENT_SUCCESS") {
//       // Redirect to success page on frontend
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/orders?payment=success&orderId=${order._id}`
//       );
//     } else {
//       // Redirect to failure page on frontend
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/checkout?payment=failed&orderId=${order._id}`
//       );
//     }
//   } catch (error) {
//     console.error("Payment validation error:", error);
//     // Redirect to error page on frontend
//     return res.redirect(`${process.env.FRONTEND_URL}/checkout?payment=error`);
//   }
// });

// module.exports = phonepeRoutes;





const { newPayment, checkStatus } = require('../Services/phonepeService');
const express = require('express');
const phonepeRoutes = express.Router();

phonepeRoutes.post('/payment', newPayment);
phonepeRoutes.post('/validate/:merchantTransactionId', checkStatus);

module.exports = phonepeRoutes;
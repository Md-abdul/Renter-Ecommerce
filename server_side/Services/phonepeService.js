// const crypto = require("crypto");
// const axios = require("axios");

// const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
// const SALT_KEY = process.env.PHONEPE_SALT_KEY;
// const SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
// // Update to UAT environment URL
// //https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay
// // const BASE_URL = "https://api.phonepe.com/apis/hermes/pg/v1";
// const BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1";

// const generateXVerify = (payload) => {
//   const data = payload + SALT_KEY;
//   const sha256 = crypto.createHash("sha256").update(data).digest("hex");
//   return sha256 + "###" + SALT_INDEX;
// };

// const generatePayload = (amount, merchantTransactionId, userId) => {
//   return {
//     merchantId: MERCHANT_ID,
//     merchantTransactionId: merchantTransactionId,
//     merchantUserId: userId,
//     amount: amount * 100, // Convert to paise
//     redirectUrl: `${process.env.FRONTEND_URL}/payment-status`,
//     redirectMode: "POST",
//     callbackUrl: `${process.env.FRONTEND_URL}/payment-status`,
//     mobileNumber: "",
//     paymentInstrument: {
//       type: "PAY_PAGE",
//     },
//   };
// };

// const initiatePayment = async (amount, merchantTransactionId, userId) => {
//   try {
//     const payload = generatePayload(amount, merchantTransactionId, userId);
//     const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
//     const xVerify = generateXVerify(base64Payload);

//     console.log("Initiating payment with payload:", {
//       merchantId: MERCHANT_ID,
//       amount,
//       merchantTransactionId,
//       base64Payload,
//     });

//     const response = await axios.post(
//       `${BASE_URL}/pay`,
//       { request: base64Payload },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "X-VERIFY": xVerify,
//         },
//       }
//     );

//     console.log("PhonePe API Response:", response.data);

//     if (!response.data || !response.data.data || !response.data.data.instrumentResponse) {
//       throw new Error("Invalid response from PhonePe");
//     }

//     return {
//       success: true,
//       data: response.data.data,
//     };
//   } catch (error) {
//     console.error("PhonePe payment initiation error:", error.response?.data || error.message);
//     return {
//       success: false,
//       error: error.response?.data?.message || error.message,
//     };
//   }
// };

// const verifyPayment = async (merchantTransactionId) => {
//   try {
//     const payload = `/status/${MERCHANT_ID}/${merchantTransactionId}`;
//     const xVerify = generateXVerify(payload);

//     const response = await axios.get(`${BASE_URL}${payload}`, {
//       headers: {
//         "Content-Type": "application/json",
//         "X-VERIFY": xVerify,
//         "X-MERCHANT-ID": MERCHANT_ID,
//       },
//     });

//     if (!response.data || !response.data.data) {
//       throw new Error("Invalid response from PhonePe");
//     }

//     return {
//       success: true,
//       data: response.data.data,
//     };
//   } catch (error) {
//     console.error("PhonePe payment verification error:", error.response?.data || error.message);
//     return {
//       success: false,
//       error: error.response?.data?.message || error.message,
//     };
//   }
// };

// module.exports = {
//   initiatePayment,
//   verifyPayment,
// };



const crypto = require("crypto");
const axios = require("axios");

// Configuration
const salt_key="099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const merchant_id="PGTESTPAYUAT";
const phonepe_host="https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX=1;
// Rate limiting configuration
const MAX_REQUESTS=5; // Maximum number of requests allowed within the time window
const TIME_WINDOW=60 * 1000; // Time window in milliseconds (1 minute)

// Map to store request timestamps
const requestTimestamps = new Map();

const newPayment = async (req, res) => {
  try {
    const { orderId, amount, userId } = req.body;

    // Validate required fields
    if (!orderId || !amount || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderId, amount, or userId",
      });
    }

    // Generate unique transaction ID
    const merchantTransactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const callbackUrl = `${process.env.BACKEND_URL}/api/phonepe/validate/${merchantTransactionId}`;

    // Prepare payload
    const payload = {
      merchantId: merchant_id,
      merchantTransactionId,
      merchantUserId: userId,
      amount: amount * 100, // Convert to paise
      redirectUrl: callbackUrl,
      redirectMode: "POST",
      mobileNumber: "8207473188", // You can get this from user profile
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // Generate checksum
    const payloadMain = Buffer.from(JSON.stringify(payload)).toString("base64");
    const string = payloadMain + "/pg/v1/pay" + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + SALT_INDEX; // Using salt index 1

    // Make API request
    const options = {
      method: "POST",
      url: `${phonepe_host}/pg/v1/pay`,
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        accept: "application/json",
      },
      data: {
        request: payloadMain,
      },
      timeout: 10000, // 10 second timeout
    };

    // Check rate limiting
    const now = Date.now();
    const timestamps = Array.from(requestTimestamps.values());
    timestamps.sort((a, b) => a - b);

    if (timestamps.length >= MAX_REQUESTS) {
      const oldestTimestamp = timestamps[0];
      if (now - oldestTimestamp < TIME_WINDOW) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please wait before trying again.",
        });
      }
    }

    // Add current timestamp to the map
    requestTimestamps.set(now, now);

    // Make the API request
    const response = await axios(options);

    if (!response.data?.data?.instrumentResponse?.redirectInfo?.url) {
      throw new Error("Invalid response from PhonePe");
    }

    // Store order details in the database
    await storeOrderDetails(orderId, merchantTransactionId, amount, userId);

    return res.json({
      success: true,
      paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
      merchantTransactionId,
    });
  } catch (error) {
    console.error("Payment initiation error:", error.message);

    // Handle specific errors
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please wait before trying again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Payment initiation failed",
    });
  }
};

const storeOrderDetails = async (orderId, merchantTransactionId, amount, userId) => {
  try {
    const order = {
      orderId,
      merchantTransactionId,
      amount,
      userId,
      paymentStatus: "INITIATED",
      transactionId: null,
      verificationResponse: null,
      createdAt: new Date(),
    };

    await OrderModel.create(order);
    console.log("Order details stored successfully:", order);
  } catch (error) {
    console.error("Error storing order details:", error);
    throw error;
  }
};

const checkStatus = async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;
    const merchantId = merchant_id;

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const options = {
      method: "GET",
      url: `${phonepe_host}/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": merchantId,
      },
    };

    const response = await axios.request(options);
    const paymentData = response.data;

    if (paymentData.code === "PAYMENT_SUCCESS") {
      // Update order status and store transaction details
      await updateOrderStatusAndStoreTransactionDetails(merchantTransactionId, paymentData);
      return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
  } catch (error) {
    console.error("Payment validation error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment-error`);
  }
};

const updateOrderStatusAndStoreTransactionDetails = async (merchantTransactionId, paymentData) => {
  try {
    const order = await OrderModel.findOneAndUpdate(
      { merchantTransactionId },
      {
        paymentStatus: "COMPLETED",
        transactionId: paymentData.transactionId,
        verificationResponse: paymentData,
        status: "processing",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      throw new Error("Order not found");
    }

    console.log("Order updated and transaction details stored successfully:", order);
  } catch (error) {
    console.error("Error updating order status and storing transaction details:", error);
    throw error;
  }
};

module.exports = {
  newPayment,
  checkStatus,
};

// warning in the working copy of client side/src /content
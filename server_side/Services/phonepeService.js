const crypto = require("crypto");
const axios = require("axios");

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const BASE_URL = "https://api.phonepe.com/apis/hermes"; // Use appropriate environment URL

const generateXVerify = (payload) => {
  const data = payload + "/pg/v1/pay" + SALT_KEY;
  const sha256 = crypto.createHash("sha256").update(data).digest("hex");
  return sha256 + "###" + SALT_INDEX;
};

const generatePayload = (amount, merchantTransactionId, userId) => {
  return {
    merchantId: MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: userId,
    amount: amount * 100, // Convert to paise
    redirectUrl: `${process.env.FRONTEND_URL}/payment-status`,
    redirectMode: "POST",
    callbackUrl: `${process.env.FRONTEND_URL}/payment-status`,
    mobileNumber: "",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };
};

const initiatePayment = async (amount, merchantTransactionId, userId) => {
  try {
    const payload = generatePayload(amount, merchantTransactionId, userId);
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      "base64"
    );
    const xVerify = generateXVerify(base64Payload);

    const response = await axios.post(
      `${BASE_URL}/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("PhonePe payment initiation error:", error);
    throw error;
  }
};

const verifyPayment = async (merchantTransactionId) => {
  try {
    const payload = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
    const xVerify = generateXVerify(payload);

    const response = await axios.get(`${BASE_URL}${payload}`, {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": MERCHANT_ID,
      },
    });

    return response.data;
  } catch (error) {
    console.error("PhonePe payment verification error:", error);
    throw error;
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
};

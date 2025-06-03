const crypto = require("crypto");
const axios = require("axios");

class PhonePePayment {
  constructor(merchantId, saltKey, saltIndex, env = "test") {
    this.merchantId = merchantId;
    this.saltKey = saltKey;
    this.saltIndex = saltIndex;
    this.baseUrl =
      env === "test"
        ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
        : "https://api.phonepe.com/apis/hermes";
  }

  generateSignature(payload) {
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      "base64"
    );
    const stringToHash = base64Payload + "/pg/v1/pay" + this.saltKey;
    const sha256Hash = crypto
      .createHash("sha256")
      .update(stringToHash)
      .digest("hex");
    return sha256Hash + "###" + this.saltIndex;
  }

  async initiatePayment(amount, userId, orderId, redirectUrl) {
    const payload = {
      merchantId: this.merchantId,
      merchantTransactionId: orderId,
      merchantUserId: userId,
      amount: amount * 100, // PhonePe expects amount in paise
      redirectUrl: redirectUrl,
      redirectMode: "POST",
      callbackUrl: `${process.env.BACKEND_URL}/api/payments/phonepe/callback`,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const xVerify = this.generateSignature(payload);
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      "base64"
    );

    try {
      const response = await axios.post(
        `${this.baseUrl}/pg/v1/pay`,
        {
          request: base64Payload,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerify,
            accept: "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "PhonePe payment initiation error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async checkPaymentStatus(merchantTransactionId) {
    const stringToHash =
      `/pg/v1/status/${this.merchantId}/${merchantTransactionId}` +
      this.saltKey;
    const sha256Hash = crypto
      .createHash("sha256")
      .update(stringToHash)
      .digest("hex");
    const xVerify = sha256Hash + "###" + this.saltIndex;

    try {
      const response = await axios.get(
        `${this.baseUrl}/pg/v1/status/${this.merchantId}/${merchantTransactionId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerify,
            "X-MERCHANT-ID": this.merchantId,
            accept: "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "PhonePe payment status error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

module.exports = PhonePePayment;

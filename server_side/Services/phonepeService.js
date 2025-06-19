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


const crypto =  require('crypto');
const axios = require('axios');
// const {salt_key, merchant_id} = require('./secret')

const salt_key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
const merchant_id = "PGTESTPAYUAT"
const newPayment = async (req, res) => {
    try {
        const merchantTransactionId = req.body.transactionId;
        const data = {
            merchantId: merchant_id,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: req.body.MUID,
            name: req.body.name,
            amount: req.body.amount * 100,
            redirectUrl: `http://localhost:5000/api/validate/${merchantTransactionId}`,
            redirectMode: 'POST',
            mobileNumber: req.body.number,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        axios.request(options).then(function (response) {
            console.log(response.data)
            return res.redirect(response.data.data.instrumentResponse.redirectInfo.url)
        })
        .catch(function (error) {
            console.error(error);
        });

    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false
        })
    }
}

const checkStatus = async(req, res) => {
    const merchantTransactionId = res.req.body.transactionId
    const merchantId = res.req.body.merchantId

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    const options = {
    method: 'GET',
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': `${merchantId}`
    }
    };

    // CHECK PAYMENT TATUS
    axios.request(options).then(async(response) => {
        if (response.data.success === true) {
            const url = `http://localhost:5173`
            return res.redirect(url)
        } else {
            const url = `http://localhost:5173`
            return res.redirect(url)
        }
    })
    .catch((error) => {
        console.error(error);
    });
};

module.exports = {
    newPayment,
    checkStatus
}

const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");
// const transporter = nodemailer.createTransport({
//   host: "info.ranter@gmail.com",
//   port: 587,
//   secure: true,
//   auth: {
//     user: process.env.SENDER_NODEMAILER_EMAIL || `info.ranter@gmail.com`,
//     pass: process.env.SENDER_NODEMAILER_PASSWORD,
//   },
// });

// const sendOTPEmail = async (to, otpCode) => {
//   const mailOptions = {
//     from: 'Renter Shop info.ranter@gmail.com',
//     to,
//     subject: 'Password Reset OTP',
//     html: `<p>Your OTP for resetting your password is <strong>${otpCode}</strong>. It will expire in 10 minutes.</p>`
//   };

//   await transporter.sendMail(mailOptions);
// };
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.SENDER_NODEMAILER_EMAIL,
    pass: process.env.SENDER_NODEMAILER_PASSWORD,
  },
});

const sendOTPEmail = async (to, otpCode) => {
  const mailOptions = {
    from: `Renter Shop <${process.env.SENDER_NODEMAILER_EMAIL}>`,
    to,
    subject: "Password Reset OTP",
    html: `<p>Your OTP for resetting your password is <strong>${otpCode}</strong>. It will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};


module.exports = { sendOTPEmail };

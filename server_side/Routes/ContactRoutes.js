require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const contactRoutes = express();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_NODEMAILER_EMAIL,
    pass: process.env.SENDER_NODEMAILER_PASSWORD,
  },
});

contactRoutes.post('/sendEmail', async (req, res) => {
  try {
    const { name, email, message, to } = req.body;

    const mailOptions = {
      from: process.env.SENDER_NODEMAILER_EMAIL,
      to: to || process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = contactRoutes


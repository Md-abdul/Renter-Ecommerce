const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
  {
    // Order related fields
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // PhonePe specific fields
    merchantTransactionId: {
      type: String,
      required: true,
      unique: true,
    },
    phonepeTransactionId: {
      type: String,
      default: null,
    },

    // Payment details
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["INITIATED", "PENDING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "INITIATED",
    },

    // PhonePe response data
    phonepeResponse: {
      type: Object,
      default: {},
    },

    // Verification data
    verificationResponse: {
      type: Object,
      default: {},
    },

    // User and product details for admin view
    userDetails: {
      name: String,
      email: String,
      phoneNumber: String,
    },

    productDetails: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
        name: String,
        quantity: Number,
        price: Number,
        color: String,
        size: String,
      },
    ],

    // Timestamps
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    // Additional metadata
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
paymentTransactionSchema.index({ merchantTransactionId: 1 });
paymentTransactionSchema.index({ orderId: 1 });
paymentTransactionSchema.index({ userId: 1 });
paymentTransactionSchema.index({ paymentStatus: 1 });
paymentTransactionSchema.index({ createdAt: -1 });

const PaymentTransactionModel = mongoose.model(
  "paymentTransaction",
  paymentTransactionSchema
);

module.exports = PaymentTransactionModel;

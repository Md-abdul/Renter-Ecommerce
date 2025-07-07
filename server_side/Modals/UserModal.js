const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  size: { type: String },
  color: { type: String },
  returnRequest: {
    type: {
      type: String,
      enum: ["return", "exchange", null],
      default: null,
    },
    reason: String,
    status: {
      type: String,
      enum: [
        "requested",
        "approved",
        "processing",
        "shipped",
        "delivered",
        "rejected",
        "completed",
        null,
      ],
      default: null,
    },
    requestedAt: Date,
    updatedAt: Date,
    exchangeSize: String,
    exchangeColor: String,
    exchangeProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    trackingNumber: String,
  },
});

// Counter schema for auto-incrementing order numbers
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      name: { type: String, required: true },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
        state: { type: String, default: "" },
        alternatePhone: { type: String, default: "" },
        addressType: {
          type: String,
          enum: ["home", "work", "other"],
          default: "home",
        },
      },
      phoneNumber: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paymentDetails: {
      merchantTransactionId: String,
      paymentStatus: {
        type: String,
        enum: ["INITIATED", "COMPLETED", "FAILED", "PENDING"],
        default: "PENDING",
      },
      transactionId: String,
      verificationResponse: Object,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    orderNumber: {
      // Changed from orderNumber to orderNumber
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    appliedCoupon: {
      couponCode: String,
      discountPercentage: Number,
      discountAmount: Number,
    },
    returnWindow: {
      type: Date,
      default: function () {
        return this.status === "delivered"
          ? new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
          : null;
      },
    },
    canReturn: {
      type: Boolean,
      default: function () {
        return this.status === "delivered";
      },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// In UserModal.js, remove this entire pre-save hook:
orderSchema.pre("save", async function (next) {
  if (!this.isNew || this.orderNumber) {
    return next();
  }

  try {
    const counter = await CounterModel.findByIdAndUpdate(
      "orderId",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.orderNumber = `RANTER_A${String(counter.seq).padStart(4, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

// Index for better query performance
orderSchema.index({ orderNumber: 1 });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function () {
        return !this.isGoogleAuth;
      },
    },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return !this.isGoogleAuth;
      },
    },
    tokens: [
      {
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isGoogleAuth: { type: Boolean, default: false },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      zipCode: { type: String, default: "" },
      state: { type: String, default: "" },
      alternatePhone: { type: String, default: "" },
      addressType: {
        type: String,
        enum: ["home", "work", "other"],
        default: "home",
      },
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return v === null || /^\d{10}$/.test(v);
        },
        message: "Phone number must be a 10-digit number",
      },
      default: null,
    },
    cart: {
      type: Map,
      of: new mongoose.Schema({
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        color: { type: String, required: true },
        size: { type: String, required: true },
        maxQuantity: { type: Number, required: true },
        _id: { type: String, required: true },
      }),
      default: {},
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    orders: [orderSchema],
  },
  { timestamps: true }
);

const UserModel = mongoose.model("user", userSchema);
const OrderModel = mongoose.model("order", orderSchema);
const CounterModel = mongoose.model("Counter", counterSchema);

// Initialize counter if it doesn't exist
async function initializeCounter() {
  try {
    const existingCounter = await CounterModel.findById("orderId");
    if (!existingCounter) {
      await CounterModel.create({ _id: "orderId", seq: 0 });
      console.log("Counter initialized");
    }
  } catch (err) {
    console.error("Error initializing counter:", err);
  }
}

// Call the initialization function
initializeCounter();

module.exports = { UserModel, OrderModel, CounterModel };

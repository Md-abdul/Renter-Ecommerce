const mongoose = require("mongoose");

// const orderItemSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "product",
//     required: true,
//   },
//   quantity: { type: Number, required: true },
//   price: { type: Number, required: true },
//   name: { type: String, required: true },
//   image: { type: String, required: true },
// });
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
  size: { type: String }, // Add size if not already present
  returnRequest: {
    type: {
      type: String,
      enum: ["return", "exchange", null],
      default: null,
    },
    reason: String,
    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "completed", null],
      default: null,
    },
    requestedAt: Date,
    updatedAt: Date,
    exchangeSize: String, // Only for exchange requests
  },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    name: String,
    address: String,
    city: String,
    zipCode: String,
  },
  paymentMethod: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  canReturn: {
    type: Boolean,
    default: false,
  },
  returnWindow: {
    type: Date,
    default: function() {
      // 7 days return window from delivery date
      return this.status === 'delivered' ? 
        new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) : 
        null;
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function() {
      return !this.isGoogleAuth;
    } 
  },
  isGoogleAuth: { type: Boolean, default: false },
  address: { type: String, default: "" },
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
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      name: { type: String, required: true },
      image: { type: String, required: true },
    }),
    default: {},
  },
  orders: [orderSchema],
});

const UserModel = mongoose.model("user", userSchema);
const OrderModel = mongoose.model("order", orderSchema);

module.exports = { UserModel, OrderModel };

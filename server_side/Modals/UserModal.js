const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const CounterModel = mongoose.model("Counter", counterSchema);

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
    exchangeSize: String, // New size for exchange
    exchangeColor: String, // New color for exchange
    exchangeProductId: {
      // In case exchanging for a different product variant
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    trackingNumber: String, // For shipping the exchanged item
  },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
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
  appliedCoupon: {
    couponCode: String,
    discountPercentage: Number,
    discountAmount: Number,
  },
  returnWindow: {
    type: Date,
    default: function () {
      // 7 days return window from delivery date
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
  orderNumber: {
    type: String,
    unique: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Then add this to your orderSchema
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const counter = await CounterModel.findByIdAndUpdate(
      { _id: "orderNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.orderNumber = `RANTER-#A-${counter.seq.toString().padStart(4, "0")}`;
  }
  next();
});

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
      type: {
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
      default: () => ({
        street: "",
        city: "",
        zipCode: "",
        state: "",
        alternatePhone: "",
        addressType: "home",
      }),
      set: function (value) {
        // If value is falsy or not an object, return default address
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return {
            street: "",
            city: "",
            zipCode: "",
            state: "",
            alternatePhone: "",
            addressType: "home",
          };
        }
        // Ensure all fields exist in the address object
        return {
          street: value.street || "",
          city: value.city || "",
          zipCode: value.zipCode || "",
          state: value.state || "",
          alternatePhone: value.alternatePhone || "",
          addressType: ["home", "work", "other"].includes(value.addressType)
            ? value.addressType
            : "home",
        };
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🟢 Add the hook here:
userSchema.pre("validate", function (next) {
  if (
    !this.address ||
    typeof this.address !== "object" ||
    Array.isArray(this.address)
  ) {
    this.address = {
      street: "",
      city: "",
      zipCode: "",
      state: "",
      alternatePhone: "",
      addressType: "home",
    };
  }
  next();
});

const UserModel = mongoose.model("user", userSchema);
const OrderModel = mongoose.model("order", orderSchema);
module.exports = { UserModel, OrderModel, CounterModel };

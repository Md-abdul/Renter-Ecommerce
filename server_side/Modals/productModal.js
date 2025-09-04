const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  variantId: { type: String },
  title: { type: String, required: true },
  summary: { type: String, },
  basePrice: { type: Number, required: true },
  category: {
    type: String,
    enum: ["mens", "womens", "kids"],
    required: true,
  },
  wearCategory: {
    type: String,
    enum: ["top", "bottom"],
    required: true,
  },
  colors: [
    {
      name: { type: String, required: true },
      hexCode: { type: String, required: true },
      priceAdjustment: { type: Number, default: 0 },
      images: {
        main: { type: String, required: true },
        gallery: [{ type: String }],
      },
      sizes: [
        // Move sizes inside colors
        {
          size: { type: String, required: true },
          priceAdjustment: { type: Number, default: 0 },
          quantity: { type: Number, required: true, min: 0 },
        },
      ],
    },
  ],
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  sku: { type: String, required: true, unique: true },

  packageWeight: { type: Number, default: 300 }, // in grams
  packageLength: { type: Number, default: 10 }, // in cm
  packageBreadth: { type: Number, default: 10 }, // in cm
  packageHeight: { type: Number, default: 10 }, // in cm
  createdAt: { type: Date, default: Date.now },

  awbNumber: { type: String, default: null },
  shippingLabelUrl: { type: String, default: null },

});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;

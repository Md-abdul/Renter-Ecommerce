const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String },
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
      images: {
        main: { type: String, required: true },
        gallery: [{ type: String }],
      },
    },
  ],
  sizes: [
    {
      size: { type: String, required: true },
      priceAdjustment: { type: Number, default: 0 },
      quantity: { type: Number, required: true, min: 0 },
    },
  ],
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;

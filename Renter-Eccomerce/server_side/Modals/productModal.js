const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: { type: String },
  summary: { type: String },
  price: { type: Number },
  offerPrice: { type: Number },
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  colors: [
    {
      name: { type: String, required: true }, // e.g., "Red", "Blue"
      hexCode: { type: String, required: true }, // e.g., "#FF0000"
      images: [
        {
          imageUrl: { type: String }, // Main image URL for this color
          subImages: [
            {
              subImagesUrl: { type: String }, // Related product image URLs for this color
            },
          ],
        },
      ],
    },
  ],
  category: {
    type: String,
    enum: ["mens", "womens", "kids"],
    default: "general",
  },
  sizes: [
    {
      size: { 
        type: String, 
        enum: ["S", "M", "L", "XL"],
        required: true 
      },
      quantity: { 
        type: Number, 
        required: true,
        min: 0 
      }
    }
  ]
});

const Product = mongoose.model("products", ProductSchema);
module.exports = Product;
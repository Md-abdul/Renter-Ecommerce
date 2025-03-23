const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: { type: String },
  summary: { type: String },
  price: { type: Number },
  offerPrice: { type: Number },
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  image: [
    {
      imageUrl: { type: String }, // Main image URL
      subImages: [
        {
          subImagesUrl: { type: String }, // Related product image URLs
        },
      ],
    },
  ],
  category: {
    type: String,
    enum: ["mens", "womens", "kids"],
    default: "general",
  },
  //quanitity should be there 
});

const Product = mongoose.model("products", ProductSchema);
module.exports = Product;

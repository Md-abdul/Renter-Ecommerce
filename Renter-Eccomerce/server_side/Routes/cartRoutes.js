const express = require("express");
const mongoose = require("mongoose");
const { UserModel, OrderModel } = require("../Modals/UserModal");
const Product = require("../Modals/productModal");
const { verifyToken } = require("../Middlewares/VerifyToken");

const CartRoutes = express.Router();

CartRoutes.post("/add", verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const mainImageUrl =
      product.image[0]?.imageUrl || "https://default-image.jpg";

    if (!user.cart) {
      user.cart = new Map();
    }

    if (user.cart.has(productId)) {
      const cartItem = user.cart.get(productId);
      cartItem.quantity += quantity;
    } else {
      user.cart.set(productId, {
        quantity,
        price: product.offerPrice || product.price,
        name: product.title,
        image: mainImageUrl,
        _id: new mongoose.Types.ObjectId().toString(), // Ensure _id is a string
        productId: productId, // Add productId field to the cart item
      });
    }

    await user.save();

    // Convert Map to an object and ensure productId is included in each item
    const cartObject = Object.fromEntries(user.cart);
    for (const key in cartObject) {
      cartObject[key] = {
        ...cartObject[key],
        productId: key, // Ensure productId is set correctly
      };
    }

    res.status(200).json({
      message: "Product added to cart",
      cart: cartObject,
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

CartRoutes.get("/items", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await UserModel.findById(userId).select("cart");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Convert the cart Map to an object and add productId to each item
    const cartWithProductIds = {};
    for (const [productId, item] of user.cart) {
      cartWithProductIds[productId] = {
        ...item.toObject(), // Convert Mongoose subdocument to plain object
        productId: productId // Add the productId field
      };
    }

    res.status(200).json({ cart: cartWithProductIds });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

CartRoutes.delete("/remove/:productId", verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.cart.has(productId)) {
      return res.status(400).json({ message: "Product not found in cart" });
    }

    user.cart.delete(productId);
    await user.save();

    res.status(200).json({
      message: "Product removed from cart",
      cart: Object.fromEntries(user.cart),
    });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

CartRoutes.post("/update-quantity", verifyToken, async (req, res) => {
  try {
    const { productId, newQuantity } = req.body;
    const userId = req.user.userId;

    if (newQuantity <= 0) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.cart.has(productId)) {
      return res.status(400).json({ message: "Product not in cart" });
    }

    const cartItem = user.cart.get(productId);
    cartItem.quantity = newQuantity;
    user.cart.set(productId, cartItem);

    await user.save();

    res.status(200).json({
      message: "Quantity updated",
      cart: Object.fromEntries(user.cart),
    });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = { CartRoutes };

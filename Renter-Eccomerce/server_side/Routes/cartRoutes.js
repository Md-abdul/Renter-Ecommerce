const express = require("express");
const mongoose = require("mongoose");
const { UserModel, OrderModel } = require("../Modals/UserModal");
const Product = require("../Modals/productModal");
const { verifyToken } = require("../Middlewares/VerifyToken");

const CartRoutes = express.Router();
const MAX_CART_TOTAL = 40000; // Maximum cart total limit in rupees

CartRoutes.post("/add", verifyToken, async (req, res) => {
  try {
    const { productId, quantity, color, size } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    // Get user and product
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check product availability
    const sizeObj = product.sizes.find(
      (s) => s.size.toLowerCase().trim() === size.toLowerCase().trim()
    );
    if (!sizeObj || sizeObj.quantity < quantity) {
      return res.status(400).json({
        message: "Selected size not available or insufficient quantity",
        available: sizeObj?.quantity || 0,
      });
    }

    // Calculate the total quantity needed for this variant
    let totalQuantityNeeded = quantity;

    // Check if this variant already exists in cart
    const cartKey = `${productId}-${color}-${size}`;
    if (user.cart.has(cartKey)) {
      const existingItem = user.cart.get(cartKey);
      totalQuantityNeeded += existingItem.quantity;
    }

    // Update the quantity only if it's less than or equal to the available quantity
    if (totalQuantityNeeded <= sizeObj.quantity) {
      if (user.cart.has(cartKey)) {
        const existingItem = user.cart.get(cartKey);
        existingItem.quantity = totalQuantityNeeded;
        user.cart.set(cartKey, existingItem);
      } else {
        const mainImage =
          product.colors.find((c) => c.name === color)?.images[0]?.imageUrl ||
          "https://via.placeholder.com/150";

        user.cart.set(cartKey, {
          productId,
          quantity: totalQuantityNeeded,
          price: product.offerPrice || product.price,
          name: product.title,
          image: mainImage,
          color,
          size,
          maxQuantity: sizeObj.quantity,
          _id: new mongoose.Types.ObjectId().toString(),
        });
      }
      await user.save();
      res.status(200).json({
        message: "Product added to cart",
        cart: convertCartToObject(user.cart),
        cartTotal: calculateCartTotal(user.cart),
      });
    } else {
      return res.status(400).json({
        message: `Cannot add ${totalQuantityNeeded} of this item as it exceeds available quantity`,
        available: sizeObj.quantity,
      });
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Helper function to calculate cart total
async function calculateCartTotal(cart) {
  let total = 0;
  for (const [key, item] of cart) {
    const product = await Product.findById(item.productId);
    if (product) {
      const price = product.offerPrice || product.price;
      total += price * item.quantity;
    }
  }
  return total;
}

// Helper function to convert cart Map to object
function convertCartToObject(cart) {
  const result = {};
  for (const [key, item] of cart) {
    result[key] = item;
  }
  return result;
}

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
        productId: productId, // Add the productId field
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

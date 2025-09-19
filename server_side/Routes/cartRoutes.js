const express = require("express");
const mongoose = require("mongoose");
const { UserModel, OrderModel } = require("../Modals/UserModal");
const Product = require("../Modals/productModal");
const { verifyToken } = require("../Middlewares/VerifyToken");

const CartRoutes = express.Router();
const MAX_CART_TOTAL = 40000; // Maximum cart total limit in rupees

// CartRoutes.post("/add", verifyToken, async (req, res) => {
//   try {
//     const { productId, quantity, color, size } = req.body;
//     const userId = req.user.userId;

//     // Validate required fields
//     if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: "Invalid product ID format" });
//     }

//     if (quantity <= 0) {
//       return res.status(400).json({ message: "Invalid quantity" });
//     }

//     if (!color || typeof color !== "string") {
//       return res
//         .status(400)
//         .json({ message: "Color is required and must be a string" });
//     }

//     if (!size || typeof size !== "string") {
//       return res
//         .status(400)
//         .json({ message: "Size is required and must be a string" });
//     }

//     const user = await UserModel.findById(userId);
//     const product = await Product.findById(productId);
//     if (!user || !product) {
//       return res.status(404).json({ message: "User or product not found" });
//     }

//     // Find matching size (case-insensitive)
//     const sizeObj = product.sizes?.find(
//       (s) => s.size?.toString().toLowerCase() === size.toLowerCase()
//     );

//     if (!sizeObj || sizeObj.quantity < quantity) {
//       return res.status(400).json({
//         message: "Insufficient stock",
//         available: sizeObj?.quantity || 0,
//       });
//     }

//     // Generate a unique ID for the cart item
//     const itemId = new mongoose.Types.ObjectId().toString();

//     // Construct the cart item
//     const newCartItem = {
//       _id: itemId,
//       productId,
//       name: product.title,
//       image:
//         product.colors.find((c) => c.name === color)?.images.main ||
//         "https://via.placeholder.com/150",
//       price: product.basePrice + (sizeObj.priceAdjustment || 0),
//       quantity,
//       color,
//       size,
//       maxQuantity: sizeObj.quantity,
//     };

//     // Add to cart
//     user.cart.set(itemId, newCartItem);
//     await user.save();

//     // Return the added item and updated cart
//     res.status(200).json({
//       message: "Added to cart",
//       addedItem: newCartItem, // ✅ Fixed: Use `addedItem` instead of undefined `cartItem`
//       cart: Array.from(user.cart.values()),
//     });
//   } catch (err) {
//     console.error("Error in /add cart:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// ===========
// CartRoutes.post("/add", verifyToken, async (req, res) => {
//   try {
//     const { productId, quantity, color, size, price } = req.body;
//     const userId = req.user.userId;

//     // Validate required fields
//     if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: "Invalid product ID format" });
//     }

//     if (quantity <= 0) {
//       return res.status(400).json({ message: "Invalid quantity" });
//     }

//     if (!color || typeof color !== "string") {
//       return res
//         .status(400)
//         .json({ message: "Color is required and must be a string" });
//     }

//     if (!size || typeof size !== "string") {
//       return res
//         .status(400)
//         .json({ message: "Size is required and must be a string" });
//     }

//     if (!price || typeof price !== "number") {
//       return res
//         .status(400)
//         .json({ message: "Price is required and must be a number" });
//     }

//     const user = await UserModel.findById(userId);
//     const product = await Product.findById(productId);
//     if (!user || !product) {
//       return res.status(404).json({ message: "User or product not found" });
//     }

//     // Find the selected color
//     const selectedColor = product.colors.find(c => c.name === color);
//     if (!selectedColor) {
//       return res.status(400).json({ message: "Selected color not available" });
//     }

//     // Find matching size within the selected color (case-insensitive)
//     const sizeObj = selectedColor.sizes.find(
//       (s) => s.size?.toString().toLowerCase() === size.toLowerCase()
//     );

//     if (!sizeObj || sizeObj.quantity < quantity) {
//       return res.status(400).json({
//         message: "Insufficient stock",
//         available: sizeObj?.quantity || 0,
//       });
//     }

//     const itemId = new mongoose.Types.ObjectId().toString();

//     const newCartItem = {
//       _id: itemId,
//       productId,
//       name: product.title,
//       image: selectedColor.images.main || "https://via.placeholder.com/150",
//       originalPrice: product.basePrice + (sizeObj.priceAdjustment || 0),
//       price: price,
//       quantity,
//       color,
//       size,
//       maxQuantity: sizeObj.quantity,
//       discount: product.discount || 0,
//     };

//     user.cart.set(itemId, newCartItem);
//     await user.save();

//     res.status(200).json({
//       message: "Added to cart",
//       addedItem: newCartItem,
//       cart: Array.from(user.cart.values()),
//     });
//   } catch (err) {
//     console.error("Error in /add cart:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// Replace the POST /add handler in cartRoutes.js with this
CartRoutes.post("/add", verifyToken, async (req, res) => {
  try {
    const { productId, quantity, color, size } = req.body;
    const userId = req.user.userId;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    if (quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    if (!color || typeof color !== "string") {
      return res
        .status(400)
        .json({ message: "Color is required and must be a string" });
    }
    if (!size || typeof size !== "string") {
      return res
        .status(400)
        .json({ message: "Size is required and must be a string" });
    }

    const user = await UserModel.findById(userId);
    const product = await Product.findById(productId);
    if (!user || !product) {
      return res.status(404).json({ message: "User or product not found" });
    }

    // find the color and size inside product (case-insensitive)
    const selectedColor = product.colors.find(
      (c) => c.name?.toString().toLowerCase() === color.toLowerCase()
    );
    if (!selectedColor) {
      return res.status(400).json({ message: "Selected color not available" });
    }

    const sizeObj = selectedColor.sizes.find(
      (s) => s.size?.toString().toLowerCase() === size.toLowerCase()
    );
    if (!sizeObj || sizeObj.quantity < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        available: sizeObj?.quantity || 0,
      });
    }

    // Compute original price and discounted price server-side
    const colorAdj = Number(selectedColor.priceAdjustment) || 0;
    const sizeAdj = Number(sizeObj.priceAdjustment) || 0;
    const originalPrice = Number(product.basePrice || 0) + colorAdj + sizeAdj;
    const discount = Number(product.discount || 0);
    const price =
      discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : Math.round(originalPrice);

    const itemId = new mongoose.Types.ObjectId().toString();

    const newCartItem = {
      _id: itemId,
      productId,
      name: product.title,
      image: selectedColor.images?.main || "https://via.placeholder.com/150",
      originalPrice,
      price,
      quantity,
      color,
      size,
      maxQuantity: sizeObj.quantity,
      discount,
      sku: product.sku,                       
      packageWeight: product.packageWeight,   
      packageLength: product.packageLength,   
      packageBreadth: product.packageBreadth, 
      packageHeight: product.packageHeight,   
    };

    user.cart.set(itemId, newCartItem);
    await user.save();

    res.status(200).json({
      message: "Added to cart",
      addedItem: newCartItem,
      cart: Array.from(user.cart.values()),
      cartTotal: calculateCartTotal(user.cart),
    });
  } catch (err) {
    console.error("Error in /add cart:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

CartRoutes.get("/items", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await UserModel.findById(userId).select("cart");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Convert the cart Map to an array of items
    const cartItems = Array.from(user.cart.values());

    res.status(200).json({
      cart: cartItems,
      cartTotal: calculateCartTotal(user.cart),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

CartRoutes.delete("/remove/:itemId", verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID format" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.cart.has(itemId)) {
      return res.status(400).json({ message: "Item not found in cart" });
    }

    user.cart.delete(itemId);
    await user.save();

    res.status(200).json({
      message: "Item removed from cart",
      cart: Array.from(user.cart.values()),
      cartTotal: calculateCartTotal(user.cart),
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

CartRoutes.post("/update-quantity/:itemId", verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { newQuantity } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID format" });
    }

    if (newQuantity <= 0) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.cart.has(itemId)) {
      return res.status(400).json({ message: "Item not in cart" });
    }

    const cartItem = user.cart.get(itemId);

    // Verify the new quantity doesn't exceed available stock
    const product = await Product.findById(cartItem.productId);
    const selectedColor = product.colors.find(c => c.name === cartItem.color);
    
    if (!selectedColor) {
      return res.status(400).json({ message: "Color no longer available" });
    }

    const sizeObj = selectedColor.sizes.find((s) => s.size === cartItem.size);

    if (newQuantity > (sizeObj?.quantity || 0)) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
        maxQuantity: sizeObj?.quantity || 0,
      });
    }

    cartItem.quantity = newQuantity;
    user.cart.set(itemId, cartItem);
    await user.save();

    res.status(200).json({
      message: "Quantity updated",
      cartItem,
      cart: Array.from(user.cart.values()),
      cartTotal: calculateCartTotal(user.cart),
    });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Helper function to calculate cart total
function calculateCartTotal(cart) {
  let total = 0;
  for (const item of cart.values()) {
    total += item.price * item.quantity;
  }
  return total;
}

module.exports = { CartRoutes };
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Modals/UserModal");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();
const UserRoutes = express.Router();
UserRoutes.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const TOKEN_EXPIRY = "24h"; // Token expires in 24 hours

// Signup Route
UserRoutes.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Initialize cart with 300 empty items
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    // Save user with default values
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address: "", // Default value
      phoneNumber: null, // Default value
      cart: cart, // Ensure cart is created
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// Login Route
UserRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    // Set cookie
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email }, // Return user name and email
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// Logout Route
UserRoutes.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logout successful" });
});

// Middleware to protect routes
// Add this middleware function before the /add-to-cart route
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('auth-token');
    if (!token) {
      return res.status(401).json({ errors: "Please authenticate using valid login" });
    }
    
    const verifiedToken = jwt.verify(token, JWT_SECRET);
    req.user = verifiedToken;
    next();
  } catch (error) {
    res.status(401).json({ errors: "Please authenticate using a valid token" });
  }
};

// Add to Cart Route
UserRoutes.post("/add-to-cart", authenticateUser, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    console.log("Received add-to-cart request:", { productId, quantity });

    if (!productId || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid product ID or quantity" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.email);

    // Initialize cart if empty
    if (!user.cart) user.cart = {};

    // Update cart
    user.cart[productId] = (user.cart[productId] || 0) + quantity;
    await user.save();

    console.log("Updated cart:", user.cart);

    return res
      .status(200)
      .json({ message: "Product added to cart", cart: user.cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

// Remove from Cart Route
UserRoutes.post("/remove-from-cart", authenticateUser, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the product from the cart
    delete user.cart[productId];

    await user.save();

    return res
      .status(200)
      .json({ message: "Product removed from cart", cart: user.cart });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// Update Cart Quantity Route
UserRoutes.post("/update-cart-quantity", authenticateUser, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the quantity
    user.cart[productId] = quantity;

    await user.save();

    return res
      .status(200)
      .json({ message: "Cart quantity updated", cart: user.cart });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// Get Cart Route
UserRoutes.get("/get-cart", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Fetching cart for user:", user.email);

    return res.status(200).json({ cart: user.cart });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

module.exports = { UserRoutes, authenticateUser };

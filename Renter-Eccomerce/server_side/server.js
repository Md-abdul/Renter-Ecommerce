const express = require("express");
const cors = require("cors");
const connectDB = require("./database");
const { ProductRoutes } = require("./Routes/productRoutes");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { UserRoutes } = require("./Routes/userRoutes");
const { adminRoutes } = require("./Routes/adminRoutes");
const { CartRoutes } = require("./Routes/cartRoutes");
const { orderRoutes } = require("./Routes/orderRoutes");
const router = require("./Routes/googleSignup");

const app = express();
dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Connect to the database
connectDB();

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Welcome to Renter ..");
});

app.use("/api/products", ProductRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/orders", orderRoutes);

app.use("/auth/google", router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/**\
 * // Middleware to protect routes
// Add this middleware function before the /add-to-cart route
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res
        .status(401)
        .json({ errors: "Please authenticate using valid login" });
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

 */

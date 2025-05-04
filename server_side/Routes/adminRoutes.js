const express = require("express");
const jwt = require("jsonwebtoken");
const adminModal = require("../Modals/adminModal");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();
const adminRoutes = express.Router();
adminRoutes.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const TOKEN_EXPIRY = "24h"; // Token expires in 24 hours

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@ranter.com";
const ADMIN_PASSWORD = "admin@ranter.com";

// Admin Login Route
adminRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if the credentials match the hardcoded admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate token
      const token = jwt.sign({ isAdmin: true }, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY,
      });

      // Set cookie
      res.cookie("adminToken", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Admin login successful",
        token,
        user: { email: ADMIN_EMAIL, isAdmin: true },
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// Admin Logout Route
adminRoutes.post("/logout", (req, res) => {
  res.clearCookie("adminToken");
  return res.status(200).json({ message: "Admin logout successful" });
});

// Middleware to check if the user is an admin
const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.adminToken || req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Protected Admin Route
adminRoutes.get("/admin/dashboard", authenticateAdmin, (req, res) => {
  return res.status(200).json({ message: "Welcome to the admin dashboard" });
});

module.exports = { adminRoutes, authenticateAdmin };

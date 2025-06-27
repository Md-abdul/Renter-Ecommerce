const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserModel, OrderModel } = require("../Modals/UserModal");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { verifyToken } = require("../Middlewares/VerifyToken");
const { sendOTPEmail } = require("../utils/emailService");
dotenv.config();
const UserRoutes = express.Router();
UserRoutes.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const TOKEN_EXPIRY = "24h"; // Token expires in 24 hours

// Update user route (PUT)
// UserRoutes.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, email, address, phoneNumber } = req.body;

//     // Validate input
//     if (!name || !email) {
//       return res.status(400).json({ message: "Name and email are required" });
//     }

//     // Validate phone number if provided
//     if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
//       return res
//         .status(400)
//         .json({ message: "Phone number must be 10 digits" });
//     }

//     const updatedUser = await UserModel.findByIdAndUpdate(
//       id,
//       { name, email, address, phoneNumber },
//       { new: true, runValidators: true }
//     ).select("-password -cart"); // Exclude password and cart from response

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({
//       message: "User updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Update user error:", error);
//     if (error.code === 11000) {
//       return res.status(409).json({ message: "Email already exists" });
//     }
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

UserRoutes.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, address } = req.body;

    // Verify the ID from params matches the ID from token
    if (id !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this user" });
    }

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits" });
    }

    // Validate address if provided
    if (address) {
      if (
        !address.street ||
        !address.city ||
        !address.state ||
        !address.zipCode
      ) {
        return res
          .status(400)
          .json({ message: "All address fields are required" });
      }
    }

    const updateData = {
      name,
      email,
      phoneNumber,
      ...(address && { address }),
    };

    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -cart");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete user route (DELETE)
UserRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      userId: id,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all users
UserRoutes.get("/allUser", async (req, res) => {
  try {
    const users = await UserModel.find({}, { password: 0, cart: 0 }); // Exclude password and cart
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Signup Route
UserRoutes.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with empty cart
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      address: "",
      phoneNumber: null,
      cart: {},
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully. Please login.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
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
    const user = await UserModel.findOne({ email });
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
      user: { name: user.name, email: user.email, userId: user._id }, // Return user name and email
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// Get user details route (GET)
// Modified Get user details route (GET) using the middleware
UserRoutes.get("/userDetails", verifyToken, async (req, res) => {
  try {
    // The user ID is now available from req.user.userId (attached by the middleware)
    const user = await UserModel.findById(req.user.userId).select(
      "-password -cart"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      user: user,
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Logout Route
UserRoutes.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logout successful" });
});

// POST /forgot-password
UserRoutes.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = { code: otpCode, expiresAt };
  await user.save();

  try {
    await sendOTPEmail(email, otpCode);
    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Email failed", error: error.message });
  }
});

// POST /verify-otp
UserRoutes.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await UserModel.findOne({ email });

  if (
    !user ||
    !user.otp ||
    user.otp.code !== otp ||
    new Date(user.otp.expiresAt) < new Date()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  res.json({ message: "OTP verified" });
});

// POST /reset-password
UserRoutes.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await UserModel.findOne({ email });

  if (
    !user ||
    !user.otp ||
    user.otp.code !== otp ||
    new Date(user.otp.expiresAt) < new Date()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.otp = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
});

module.exports = { UserRoutes };

const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../Modals/UserModal"); // Adjust path as needed

const Signuprouter = express.Router();

// Signup Route
Signuprouter.post("/signup", async (req, res) => {
  try {
    const { name, email, password, address, phoneNumber, cart } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address,
      phoneNumber,
      cart: cart || {}, // Default to empty object
    });

    // Save user to DB
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
});

module.exports = Signuprouter;

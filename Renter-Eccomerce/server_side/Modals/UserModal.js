const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, default: "" },
  phoneNumber: {
    type: String, // Change from Number to String
    validate: {
      validator: function (v) {
        return v === null || /^\d{10}$/.test(v); // Ensure it's a 10-digit number
      },
      message: "Phone number must be a 10-digit number",
    },
    default: null,
  },
  cart: { type: Object, default: {} }, // Ensure default empty cart object
});

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;

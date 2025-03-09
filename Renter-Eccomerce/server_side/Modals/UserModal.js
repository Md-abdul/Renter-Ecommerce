const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, require: true },
  address: { type: String },
  phoneNumber: { 
    type: Number, 
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v); 
      },
      message: 'Phone number must be a 10-digit number'
    }
  },
  cart: { type: Object },
});

const UserModal = mongoose.model("user", userSchema);
module.exports = UserModal;

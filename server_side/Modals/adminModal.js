const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, require: true },
});

const adminModal = mongoose.model("admin", adminSchema);
module.exports = adminModal;

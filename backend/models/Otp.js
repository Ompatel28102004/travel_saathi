// models/Otp.js
const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  data: { type: Object, required: true }, // store registration form temporarily
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("Otp", otpSchema);

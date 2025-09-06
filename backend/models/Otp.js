const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  otp: { type: String, required: true },
  data: { type: Object, required: true }, // store registration form temporarily
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("Otp", otpSchema);

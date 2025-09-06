// import mongoose from "mongoose";
const mongoose = require("mongoose")
const aadharSchema = new mongoose.Schema({
  aadharNo: { type: String, required: true, unique: true }, // 12-digit number
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  dob: { type: Date, required: true },
});

module.exports = mongoose.model("Aadhar", aadharSchema);
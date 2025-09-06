// import mongoose from "mongoose";
const mongoose = require("mongoose")
const passportSchema = new mongoose.Schema({
  passportNo: { type: String, required: true, unique: true }, // e.g., M1234567
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  dob: { type: Date, required: true },
});

const Passport = mongoose.model("Passport", passportSchema);
export default Passport;

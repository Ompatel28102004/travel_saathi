// import mongoose from "mongoose";
const mongoose = require("mongoose")
const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  complaintHash: { type: String }, // blockchain/audit hash
  createdAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;

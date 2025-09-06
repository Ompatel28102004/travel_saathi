const mongoose = require("mongoose");

const analysisResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  severity: { type: Number },
  reasoning: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("AnalysisResult", analysisResultSchema);
const mongoose = require("mongoose");

const sosAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Tourist snapshot (auto-filled from User)
  touristName: String,
  touristContact: String,

  // Auto location (from frontend GPS or stored user location)
  touristLocation: {
    lat: Number,
    lng: Number,
    address: String,
  },

  category: { type: String, enum: ["SOS", "MEDICAL"], default: "SOS" },

  status: { 
    type: String, 
    enum: ["active", "pending confirmation", "investigating", "resolved"], 
    default: "active" 
  },

  adminResponse: String,
  assignedTo: String, // which admin team is handling it

}, { timestamps: true });

module.exports = mongoose.model("SOSAlert", sosAlertSchema);

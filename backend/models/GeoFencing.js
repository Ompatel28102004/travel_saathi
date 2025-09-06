const mongoose = require("mongoose");

const geoFenceSchema = new mongoose.Schema({
  zoneName: { type: String, required: true },
  state: { type: String, required: true },
  countryType: {
    type: String,
    enum: ["India", "International"],
    required: true,
  },
  allowedGender: {
    type: String,
    enum: ["Male", "Female", "Both"],
    default: "Both",
  },
  coordinates: [
    {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GeoFence", geoFenceSchema);
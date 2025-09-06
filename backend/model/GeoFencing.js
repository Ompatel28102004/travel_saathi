import mongoose from "mongoose";

const geoFenceSchema = new mongoose.Schema({
  zoneName: { type: String, required: true },       // e.g., "Kaziranga Core Area"
  state: { type: String, required: true },          // e.g., "Assam"
  countryType: { 
    type: String, 
    enum: ["India", "International"], 
    required: true 
  },
  allowedGender: { 
    type: String, 
    enum: ["Male", "Female", "Both"], 
    default: "Both" 
  },
  coordinates: [
    {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    }
  ],  // polygon/boundary points
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("GeoFence", geoFenceSchema);
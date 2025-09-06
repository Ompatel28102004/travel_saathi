import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    aadharNo: { type: String }, 
    passportNo: { type: String }, 
    email: { type: String, required: true, unique: true },
    contactNo: { type: String, required: true },
    emergencyNo: { type: String, required: true },
    passportPhoto: { type: String }, // file path / cloud URL

    // Security
    passwordHashed: { type: String, required: true },
    dataBlockHash: { type: String },

    // Relations
    itinerary: [{ type: mongoose.Schema.Types.ObjectId, ref: "Itinerary" }],
    feedbacks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feedback" }],
    panicHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Panic" }],

    // Travel Scope
    travelScope: { type: String, enum: ["India-only", "International"], default: "India-only" },
    preferredLanguage: { type: String, default: "en" },

    // Live Location
    liveLocation: {
      lat: Number,
      lng: Number,
      lastUpdated: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

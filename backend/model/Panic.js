import mongoose from "mongoose";

const panicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  incidentTime: { type: Date, default: Date.now },
  location: {
    lat: Number,
    lng: Number,
  },
  actionTaken: { type: String }, // operator/admin response
});

const Panic = mongoose.model("Panic", panicSchema);
export default Panic;

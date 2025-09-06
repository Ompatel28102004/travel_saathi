// import mongoose from "mongoose";
const mongoose = require("mongoose")
const geoFenceSchema = new mongoose.Schema({
  state: { type: String, required: true }, // e.g., Assam
  prohibitedZones: [{ type: String }], // restricted areas
  allowInternational: { type: Boolean, default: true },
  allowDomestic: { type: Boolean, default: true },
  allowMale: { type: Boolean, default: true },
  allowFemale: { type: Boolean, default: true },
  allowOther: { type: Boolean, default: true },
});

const GeoFencing = mongoose.model("GeoFencing", geoFenceSchema);
export default GeoFencing;

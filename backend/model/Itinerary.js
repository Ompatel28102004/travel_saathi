import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema({
  state: { type: String, required: true },
  dateOfJourney: { type: Date, required: true },
  returnDate: { type: Date }, // only for international
  isInternational: { type: Boolean, default: false },
  placesToVisit: [{ type: String }], // tourist spots
});

const Itinerary = mongoose.model("Itinerary", itinerarySchema);
export default Itinerary;

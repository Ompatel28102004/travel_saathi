const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  aadharNo: { type: String },
  passportNo: { type: String },
  email: { type: String, required: true, unique: true },
  contactNo: { type: String },
  emergencyNo: { type: String },
  photo: { type: String },
  passwordHashed: { type: String, required: true },
  dataBlockHash: { type: String },

  // Itinerary
  itinerary: [
    {
      state: String,
      dateOfJourney: Date,
      returnDate: Date,
      placesToVisit: [String],
    },
  ],

  // Latest GeoFencing Info
  lastLocation: {
    lat: Number,
    lng: Number,
    insideZone: { type: Boolean, default: false },
    zoneInfo: [
      {
        zoneName: String,
        state: String,
        countryType: String,
        allowedGender: String,
      },
    ],
    timestamp: { type: Date, default: Date.now },
  },

  // Optional: Store history
  locationHistory: [
    {
      lat: Number,
      lng: Number,
      insideZone: Boolean,
      zoneInfo: [
        {
          zoneName: String,
          state: String,
          countryType: String,
          allowedGender: String,
        },
      ],
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
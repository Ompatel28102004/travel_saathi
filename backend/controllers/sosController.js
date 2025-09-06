const SOSAlert = require("../models/Panic");
const User = require("../models/User");
const turf = require("@turf/turf");
const GeoFence = require("../models/GeoFencing");

// 🚨 Create new SOS alert
const createSOSAlert = async (req, res) => {
  try {
    const { userId, lat, lng, category } = req.body;

    if (!userId || !lat || !lng) {
      return res.status(400).json({ error: "userId, lat, and lng are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const fences = await GeoFence.find();
    const point = turf.point([lng, lat]);

    let insideZones = [];

    fences.forEach((fence) => {
      if (fence.coordinates.length > 2) {
        const polygon = turf.polygon([
          [
            ...fence.coordinates.map((c) => [c.lng, c.lat]),
            [fence.coordinates[0].lng, fence.coordinates[0].lat],
          ],
        ]);

        if (turf.booleanPointInPolygon(point, polygon)) {
          insideZones.push({
            zoneName: fence.zoneName,
            state: fence.state,
            countryType: fence.countryType,
            allowedGender: fence.allowedGender,
          });
        }
      }
    });

    const inside = insideZones.length > 0;

    const alert = new SOSAlert({
      userId,
      touristName: user.name,
      touristContact: user.contactNo,
      touristLocation: { lat, lng }, // Removed address
      category: category || "SOS",
    });

    await alert.save();

    const newLocation = {
      lat,
      lng,
      insideZone: inside,
      zoneInfo: insideZones,
      timestamp: new Date(),
    };

    user.lastLocation = newLocation;
    user.locationHistory.push(newLocation);

    await user.save();

    res.status(201).json({
      message: "SOS alert created successfully",
      alert,
      locationStatus: inside ? "Inside restricted zone" : "Outside all zones",
      zones: insideZones,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Get all alerts
const getAllSOSAlerts = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const alerts = await SOSAlert.find(query).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Get alert by userId
const getSOSAlertByUserId = async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    if (!alerts || alerts.length === 0) return res.status(404).json({ error: "No alerts found for this user" });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Update alert by userId
const updateSOSAlertByUserId = async (req, res) => {
  try {
    const { status, adminResponse, assignedTo } = req.body;

    const alert = await SOSAlert.findOne({ userId: req.params.userId });
    if (!alert) return res.status(404).json({ error: "Alert not found for this user" });

    if (status) alert.status = status;
    if (adminResponse) alert.adminResponse = adminResponse;
    if (assignedTo) alert.assignedTo = assignedTo;

    await alert.save();
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Delete alert by userId
const deleteSOSAlertByUserId = async (req, res) => {
  try {
    const result = await SOSAlert.deleteMany({ userId: req.params.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: "No alerts found to delete for this user" });
    res.json({ message: "Alerts deleted for user", count: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSOSAlert,
  getAllSOSAlerts,
  getSOSAlertByUserId,
  updateSOSAlertByUserId,
  deleteSOSAlertByUserId,
};
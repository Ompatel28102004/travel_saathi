const SOSAlert = require("../models/Panic"); // Or your new model name, e.g., "../models/SOSAlert"
const User = require("../models/User");
const turf = require("@turf/turf");
const GeoFence = require("../models/GeoFencing");

// Create new SOS alert (Unchanged)
const createSOSAlert = async (req, res) => {
  try {
    const { userId, lat, lng, address, category } = req.body;

    if (!userId || !lat || !lng || !address) {
      return res.status(400).json({ error: "userId, lat, lng, and address are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ... your geofence checking logic ...

    const alert = new SOSAlert({
      userId,
      touristName: user.name,
      touristContact: user.contactNo,
      touristLocation: { lat, lng, address },
      category: category || "SOS",
    });

    await alert.save();

    // ... your user location update logic ...

    res.status(201).json({
      message: "SOS alert created successfully",
      alert,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all alerts (Unchanged)
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

// Get alert by userId (Unchanged)
const getSOSAlertByUserId = async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    if (!alerts || alerts.length === 0) return res.status(404).json({ error: "No alerts found for this user" });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- UPDATED: Now finds and updates a single alert by its unique ID ---
const updateSOSAlertById = async (req, res) => {
  try {
    const { status, adminResponse, assignedTo } = req.body;

    // Use findById with the alertId from the URL parameters
    const alert = await SOSAlert.findById(req.params.alertId);
    if (!alert) {
        return res.status(404).json({ error: "Alert not found with this ID" });
    }

    if (status) alert.status = status;
    if (adminResponse) alert.adminResponse = adminResponse;
    if (assignedTo) alert.assignedTo = assignedTo;

    const updatedAlert = await alert.save();
    res.json(updatedAlert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- UPDATED: Now finds and deletes a single alert by its unique ID ---
const deleteSOSAlertById = async (req, res) => {
  try {
    // Use findByIdAndDelete with the alertId from the URL parameters
    const alert = await SOSAlert.findByIdAndDelete(req.params.alertId);

    if (!alert) {
        return res.status(404).json({ error: "No alert found with this ID to delete" });
    }

    res.json({ message: "Alert deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSOSAlert,
  getAllSOSAlerts,
  getSOSAlertByUserId,
  updateSOSAlertById, // Exporting the corrected function
  deleteSOSAlertById, // Exporting the corrected function
};
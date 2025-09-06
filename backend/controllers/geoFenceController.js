const GeoFence = require("../models/GeoFence");
const turf = require("@turf/turf");

// ✅ Add a new geo-fence
const createGeoFence = async (req, res) => {
  try {
    const geoFence = new GeoFence(req.body);
    await geoFence.save();
    res.status(201).json({ message: "GeoFence added successfully", geoFence });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all geo-fences
const getGeoFences = async (req, res) => {
  try {
    const fences = await GeoFence.find();
    res.json(fences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get geo-fences by state
const getGeoFencesByState = async (req, res) => {
  try {
    const fences = await GeoFence.find({ state: req.params.state });
    res.json(fences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update a geo-fence
const updateGeoFence = async (req, res) => {
  try {
    const updated = await GeoFence.updateMany(
      { state: req.params.state }, // Filter by state
      { $set: req.body }           // Apply updates from request body
    );

    if (updated.modifiedCount === 0) {
      return res.status(404).json({ message: "No geo-fences found for this state." });
    }

    res.json({
      message: `${updated.modifiedCount} geo-fence(s) updated.`,
      result: updated
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete a geo-fence
const deleteGeoFence = async (req, res) => {
  try {
    await GeoFence.findByIdAndDelete(req.params.state);
    res.json({ message: "GeoFence deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Check if point is inside polygon & update User model
const checkLocation = async (req, res) => {
  try {
    const { userId, lat, lng } = req.body;

    if (!lat || !lng || !userId) {
      return res.status(400).json({ error: "userId, lat, and lng are required" });
    }

    // Fetch all geofences
    const fences = await GeoFence.find();
    const point = turf.point([lng, lat]);

    let insideZones = [];

    fences.forEach((fence) => {
      if (fence.coordinates.length > 2) {
        const polygon = turf.polygon([
          [
            ...fence.coordinates.map((c) => [c.lng, c.lat]),
            [fence.coordinates[0].lng, fence.coordinates[0].lat], // close polygon
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

    // ✅ Update User model
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.lastLocation = {
      lat,
      lng,
      insideZone: inside,
      zoneInfo: insideZones,
      timestamp: new Date(),
    };

    // Save in history as well
    user.locationHistory.push(user.lastLocation);

    await user.save();

    if (inside) {
      return res.json({ inside: true, zones: insideZones });
    } else {
      return res.json({ inside: false, message: "Outside all prohibited zones" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get latest location of all users (for admin dashboard)
const getAllUsersLocations = async (req, res) => {
  try {
    const users = await User.find({}, "name email lastLocation");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createGeoFence,
  getGeoFences,
  getGeoFencesByState,
  updateGeoFence,
  deleteGeoFence,
  checkLocation,
  getAllUsersLocations,
};

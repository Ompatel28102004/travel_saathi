const express = require("express");
const {
  createGeoFence,
  getGeoFences,
  getGeoFencesByState,
  updateGeoFence,
  deleteGeoFence,
  checkLocation,
  getAllUsersLocations,
} = require("../controllers/geoFenceController");

const router = express.Router();

router.post("/create", createGeoFence);
router.get("/get", getGeoFences);
router.get("/get/state/:state", getGeoFencesByState);
router.put("/:state", updateGeoFence);
router.delete("/delete/:state", deleteGeoFence);

// ✅ New APIs
router.post("/check-location", checkLocation);   // Update user location
router.get("/location/all-users", getAllUsersLocations);  // Admin view

module.exports = router;

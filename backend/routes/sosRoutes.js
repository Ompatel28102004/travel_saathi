const express = require("express");
const {
  createSOSAlert,
  getAllSOSAlerts,
  getSOSAlertByUserId,
  updateSOSAlertById, // Use the corrected controller function
  deleteSOSAlertById, // Use the corrected controller function
} = require("../controllers/sosController");

const router = express.Router();

// Create a new SOS alert
router.post("/create", createSOSAlert);

// Get all SOS alerts
router.get("/getAll", getAllSOSAlerts);

// Get alerts by userId
router.get("/get/:userId", getSOSAlertByUserId);

// --- UPDATED: Route now uses :alertId to match the frontend ---
router.put("/update/:alertId", updateSOSAlertById);

// --- UPDATED: Route now uses :alertId to match the frontend ---
router.delete("/delete/:alertId", deleteSOSAlertById);

module.exports = router;
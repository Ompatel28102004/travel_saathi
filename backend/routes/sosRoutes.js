const express = require("express");
const {
  createSOSAlert,
  getAllSOSAlerts,
  getSOSAlertByUserId,
  updateSOSAlertByUserId,
  deleteSOSAlertByUserId,
} = require("../controllers/sosController");

const router = express.Router();

// 🚨 Create a new SOS alert
router.post("/create", createSOSAlert);

// 📌 Get all SOS alerts
router.get("/getAll", getAllSOSAlerts);

// 📌 Get alerts by userId
router.get("/get/:userId", getSOSAlertByUserId);

// 📌 Update alert by userId
router.put("/update/:userId", updateSOSAlertByUserId);

// 📌 Delete alerts by userId
router.delete("/delete/:userId", deleteSOSAlertByUserId);

module.exports = router;
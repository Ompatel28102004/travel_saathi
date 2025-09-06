const express = require("express");
const { verifyID, verifyOTP } = require("../controllers/aadhaarPassportController");

const router = express.Router();

router.post("/verify-id", verifyID);   // Step 1+2: ID verify + OTP send
router.post("/verify-otp", verifyOTP); // Step 3: OTP verify = Completed

module.exports = router;

const express = require("express");
const { body } = require("express-validator");
const { startRegistration, verifyOtpAndRegister } = require("../controllers/userController");
const upload = require("../middlewares/upload");
const router = express.Router();

// Validation middleware chain
const registrationValidation = [
  body("name", "Name is required").not().isEmpty().trim(),
  body("email", "Please provide a valid email").isEmail(),
  body("contactNo", "Contact number is required").isLength({ min: 10 }),
  body("emergencyNo", "Emergency contact number is required").isLength({
    min: 10,
  }),
  body("passwordHashed", "Password is required").not().isEmpty(),
  body("gender", "Gender is required").isIn(["male", "female", "other"]),
  body().custom((value, { req }) => {
    if (!req.body.aadharNo && !req.body.passportNo) {
      throw new Error("Either Aadhar or Passport number is required.");
    }
    return true;
  }),
];

// Step 1: Register & send OTP via SMS
router.post(
  "/register",
  upload.single("passportPhoto"),
  registrationValidation,
  startRegistration
);

// Step 2: Verify OTP & finalize registration
router.post("/verify-otp", verifyOtpAndRegister);

module.exports = router;

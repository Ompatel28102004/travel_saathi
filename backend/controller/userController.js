const User = require("../models/User");
// const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const Brevo = require("@getbrevo/brevo");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * @desc    Start registration by generating & sending OTP
 * @route   POST /api/users/register
 * @access  Public
 */
const startRegistration = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    gender,
    aadharNo,
    passportNo,
    email,
    contactNo,
    emergencyNo,
    passwordHashed,
    travelScope,
    preferredLanguage,
  } = req.body;

  // Ensure either Aadhar OR Passport is provided
  if (!aadharNo && !passportNo) {
    return res
      .status(400)
      .json({ message: "Either Aadhar or Passport number is required." });
  }

  try {
    // Generate OTP (6 digits)
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save temporary data + OTP (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      email,
      otp,
      data: {
        name,
        gender,
        aadharNo: aadharNo || null,
        passportNo: passportNo || null,
        email,
        contactNo,
        emergencyNo,
        passwordHashed,
        travelScope,
        preferredLanguage,
        passportPhoto: req.file ? req.file.path : null,
      },
      expiresAt,
    });

    // Send OTP via Brevo (Email for now, can replace with SMS API later)
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    await apiInstance.sendTransacEmail({
      sender: { email: "no-reply@travelsaathi.com", name: "Travel Saathi" },
      to: [{ email }],
      subject: "Your OTP for Travel Saathi Registration",
      htmlContent: `<p>Your OTP is: <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
    });

    res.status(200).json({ message: "OTP sent. Please verify." });
  } catch (error) {
    console.error("Registration OTP Error:", error);
    res.status(500).json({ message: "Error sending OTP." });
  }
};

/**
 * @desc    Verify OTP and complete user registration
 * @route   POST /api/users/verify-otp
 * @access  Public
 */
const verifyOtpAndRegister = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await Otp.findOne({ email, otp });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Save user permanently
    const newUser = new User(record.data);
    const savedUser = await newUser.save();

    // Delete OTP record after success
    await Otp.deleteOne({ _id: record._id });

    // Generate JWT
    const token = generateToken(savedUser._id);

    res.status(201).json({
      message: "User registered successfully after OTP verification",
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        gender: savedUser.gender,
        aadharNo: savedUser.aadharNo,
        passportNo: savedUser.passportNo,
        contactNo: savedUser.contactNo,
        emergencyNo: savedUser.emergencyNo,
        travelScope: savedUser.travelScope,
        preferredLanguage: savedUser.preferredLanguage,
        photo: savedUser.passportPhoto,
      },
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Error verifying OTP." });
  }
};

// ✅ Export in CommonJS
module.exports = { startRegistration, verifyOtpAndRegister };

// import User from "../models/User.js"; // Your new User model
const User = require("../models/User")
// import jwt from "jsonwebtoken";
const jwt = require("jsonwebtoken")
// import { validationResult } from "express-validator";
const {validationResult} = require("express-validator")
// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
 const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Fields based on your new schema
  const { name, aadharNo, passportNo, email, contactNo, emergencyNo, passwordHashed } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // Create a new user instance
    const newUser = new User({
      name,
      aadharNo,
      passportNo,
      email,
      contactNo,
      emergencyNo,
      passwordHashed, // Saving the pre-hashed password from the frontend
      photo: req.file ? req.file.path : null, // Assumes you are using multer for file uploads
    });

    const savedUser = await newUser.save();

    // Generate token and send response
    const token = generateToken(savedUser._id);
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        idType: savedUser.aadharNo ? savedUser.aadharNo != null: savedUser.passportNo
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/users/login
 * @access  Public
 */
 const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // ⚠️ See the security note below about this comparison
    if (user && user.passwordHashed === password) {
      const token = generateToken(user._id);
      res.status(200).json({
        message: "Logged in successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

module.exports = {registerUser,loginUser}
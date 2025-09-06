const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * @desc    Register a new admin
 * @route   POST /api/admins/register
 */
const registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, phone, email, department, employeeId, state, password } = req.body;

  try {
    const adminExists = await Admin.findOne({ $or: [{ email }, { employeeId }] });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin with this email or employee ID already exists.' });
    }

    // Create new admin - password will be hashed by the pre-save hook in the model
    const newAdmin = await Admin.create({
      fullName,
      phone,
      email,
      department,
      employeeId,
      state,
      password,
    });

    const token = generateToken(newAdmin._id);
    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: { id: newAdmin._id, name: newAdmin.fullName, email: newAdmin.email },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

/**
 * @desc    Login admin
 * @route   POST /api/admins/login
 */
const loginAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    // Use the model's method to compare passwords
    if (admin && (await admin.matchPassword(password))) {
      const token = generateToken(admin._id);
      res.status(200).json({
        message: "Logged in successfully",
        token,
        admin: { id: admin._id, name: admin.fullName, email: admin.email },
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
};
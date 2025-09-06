import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

// Helper function to generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token lasts for 7 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  // 1. Check for validation errors from the route middleware
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 2. Check if the photo was successfully uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'Passport photo is required.' });
  }

  const {
    name, gender, aadharNo, passportNo, email, contactNo,
    emergencyNo, passwordHashed, travelScope, preferredLanguage
  } = req.body;

  try {
    // 3. Check if a user with the same unique identifiers already exists
    const userExists = await User.findOne({
      $or: [
        { email },
        { aadharNo: aadharNo ? aadharNo : null },
        { passportNo: passportNo ? passportNo : null }
      ]
    });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email or document already exists.' });
    }

    // 4. Create the new user object
    const newUser = new User({
      name,
      gender,
      aadharNo,
      passportNo,
      email,
      contactNo,
      emergencyNo,
      passwordHashed, // Storing the pre-hashed password from the frontend
      passportPhoto: req.file.path, // Storing the path of the uploaded file
      travelScope,
      preferredLanguage,
    });

    // 5. Save the user to the database
    const savedUser = await newUser.save();

    // 6. Generate the JWT
    const token = generateToken(savedUser._id);

    // 7. Send a successful response (✅ now includes Aadhar/Passport)
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        aadharNo: savedUser.aadharNo,
        passportNo: savedUser.passportNo,
        contactNo: savedUser.contactNo,
        emergencyNo: savedUser.emergencyNo,
        gender: savedUser.gender,
        travelScope: savedUser.travelScope,
        preferredLanguage: savedUser.preferredLanguage,
        photo: savedUser.passportPhoto,
      },
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during user registration.' });
  }
};

const express = require('express');
const { body } = require('express-validator');
const { registerAdmin, loginAdmin } = require('../controllers/adminController');

const router = express.Router();

// Validation for registration
const registrationValidation = [
  body('fullName', 'Full name is required').not().isEmpty(),
  body('email', 'Please provide a valid email').isEmail(),
  body('employeeId', 'Employee ID is required').not().isEmpty(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
];

// Validation for login
const loginValidation = [
  body('email', 'Please provide a valid email').isEmail(),
  body('password', 'Password is required').exists(),
];

// Define routes
router.post('/admin-register', registrationValidation, registerAdmin);
router.post('/admin-login', loginValidation, loginAdmin);

module.exports = router;
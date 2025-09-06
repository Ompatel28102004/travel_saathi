const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, getActiveUsers } = require('../controllers/userController');
const upload = require('../middlewares/upload'); // Your file upload middleware

const router = express.Router();

const registrationValidation = [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please provide a valid email').isEmail(),
  body('passwordHashed', 'Password is required').not().isEmpty(),
  // Add other validations for contactNo, etc., as needed
];

const loginValidation = [
  body('email', 'Please provide a valid email').isEmail(),
  body('password', 'Password is required').not().isEmpty(), // Frontend sends the hashed password for login
];

router.post(
  '/register',
  upload.single('photo'), // Middleware for handling the 'photo' file
  registrationValidation,
  registerUser
);

router.post('/login', loginValidation, loginUser);
router.get('/active', getActiveUsers);
module.exports = router;
// import multer from 'multer';
const multer = require('multer')
// import path from 'path';
const path = require('path')

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this 'uploads/' directory exists or is created
  },
  filename: (req, file, cb) => {
    // This function will only be called if a file is actually being uploaded.
    // If no file is present in the request, multer doesn't call this.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `photo-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Modified filter to always allow
const fileFilter = (req, file, cb) => {
  cb(null, true); // Always accept the file or proceed if no file is present
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;
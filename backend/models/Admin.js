const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  department: { type: String, required: true, enum: ['Operations', 'Support', 'Technical', 'Management'] },
  employeeId: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
}, {
  timestamps: true,
});

// Middleware to hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
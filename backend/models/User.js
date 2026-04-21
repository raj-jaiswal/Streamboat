const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: false, // Optional if using Google OAuth
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  subscription_plan: {
    type: String,
    enum: ['Free', 'Pro', 'Enterprise'],
    default: 'Free',
  },
  two_factor_enabled: {
    type: Boolean,
    default: false,
  },
  two_factor_secret: {
    type: String,
    default: '',
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  googleId: {
    type: String,
    default: null,
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;

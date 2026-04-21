const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    if (user) {
      const token = generateToken(user._id);
      
      // Create session
      await Session.create({
        user_id: user._id,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
        token
      });

      res.status(201).json({
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);

      // Create session
      await Session.create({
        user_id: user._id,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
        token
      });

      res.json({
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const axios = require('axios');

// @desc    Google OAuth
// @route   POST /api/auth/google
// @access  Public
const googleOAuth = async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({ message: 'No access token provided' });
    }

    // Securely pull Google Profile via official API
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const { email, given_name: firstName, family_name: lastName, picture: profileImage, sub: googleId } = response.data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        firstName,
        lastName,
        profileImage,
        googleId,
        email_verified: true
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    // Create session
    await Session.create({
      user_id: user._id,
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip,
      token
    });

    res.json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImage: user.profileImage,
      token,
    });
  } catch (error) {
    console.error('Google OAuth Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to authenticate with Google' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    await Session.findOneAndUpdate({ token: req.token }, { isActive: false });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleOAuth,
  logoutUser
};

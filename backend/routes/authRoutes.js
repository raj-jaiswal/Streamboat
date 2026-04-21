const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleOAuth, logoutUser } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/google', googleOAuth);
router.post('/logout', protect, logoutUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getUserMedia, updateMedia, deleteMedia } = require('../controllers/userMediaController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/media', protect, getUserMedia);
router.patch('/media/:id', protect, updateMedia);
router.delete('/media/:id', protect, deleteMedia);

const { 
  getProfile, 
  updateProfile, 
  updateProfilePicture, 
  changePassword, 
  updateNotifications, 
  getSessions, 
  revokeSession 
} = require('../controllers/profileController');

router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.patch('/profile/picture', protect, updateProfilePicture);
router.post('/password/change', protect, changePassword);
router.patch('/notifications', protect, updateNotifications);
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:sessionId', protect, revokeSession);

module.exports = router;

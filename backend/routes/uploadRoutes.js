const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/uploadMiddleware');
const { uploadFile, saveUploadMetadata, trackUploadProgress } = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, upload.single('file'), uploadFile);
router.post('/metadata', protect, saveUploadMetadata);
router.get('/progress/:uploadId', protect, trackUploadProgress);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAssets, getAssetById, searchAssets, serveAssetFile } = require('../controllers/assetController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/search', searchAssets); // Keep this above /:id to avoid conflict
router.get('/', getAssets);
router.get('/:id', protect, getAssetById);
router.get('/:id/file', serveAssetFile);

module.exports = router;

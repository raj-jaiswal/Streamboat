const express = require('express');
const router = express.Router();
const { getAssets, getAssetById, searchAssets } = require('../controllers/assetController');

router.get('/search', searchAssets); // Keep this above /:id to avoid conflict
router.get('/', getAssets);
router.get('/:id', getAssetById);

module.exports = router;

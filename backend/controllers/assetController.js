const Asset = require('../models/Asset');

// @desc    Get all public assets (with pagination & filtering)
// @route   GET /api/assets
// @access  Public
const getAssets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { visibility: 'public' };

    // Filter by type if provided
    if (req.query.type && req.query.type !== 'All Assets') {
      query.type = req.query.type.toLowerCase();
    }

    const assets = await Asset.find(query)
      .populate('owner_id', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Asset.countDocuments(query);

    res.json({
      assets,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single asset
// @route   GET /api/assets/:id
// @access  Public
const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('owner_id', 'firstName lastName profileImage');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Increment view count
    asset.view_count += 1;
    await asset.save();

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search assets
// @route   GET /api/assets/search
// @access  Public
const searchAssets = async (req, res) => {
  try {
    const searchQuery = req.query.query;
    if (!searchQuery) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const query = {
      visibility: 'public',
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    const assets = await Asset.find(query)
      .populate('owner_id', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .limit(50); // Hard limit for search results

    res.json({ assets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAssets,
  getAssetById,
  searchAssets
};

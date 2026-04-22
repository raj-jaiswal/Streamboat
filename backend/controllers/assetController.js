const Asset = require('../models/Asset');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
// @access  Public (but private assets only visible to owner)
const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('owner_id', 'firstName lastName profileImage');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check if asset is private and user is not the owner
    if (asset.visibility === 'private' && (!req.user || req.user._id.toString() !== asset.owner_id._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment view count
    asset.view_count += 1;
    await asset.save();

    res.json({ asset });
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

// @desc    Serve asset file directly
// @route   GET /api/assets/:id/file
// @access  Private (handled manually)
const serveAssetFile = async (req, res) => {
  try {
    console.log('serveAssetFile called for asset:', req.params.id);
    console.log('Token from header:', req.headers.authorization);
    console.log('Token from query:', req.query.token);
    
    // Manual authentication - check for token in header or query param
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    req.user = { _id: decoded.id };

    console.log('Fetching asset:', req.params.id);
    const asset = await Asset.findById(req.params.id).populate('owner_id', 'firstName lastName');

    if (!asset) {
      console.log('Asset not found:', req.params.id);
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check if user has access to this asset
    if (asset.visibility === 'private' && asset.owner_id.toString() !== req.user._id.toString()) {
      console.log('Access denied for asset:', req.params.id, 'owner:', asset.owner_id, 'user:', req.user._id);
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Serving file from Cloudinary:', asset.fileUrl);
    
    // Fetch file from Cloudinary and stream it
    try {
      const response = await axios.get(asset.fileUrl, {
        responseType: 'stream',
        timeout: 30000,
        headers: {
          'User-Agent': 'Streamboat-App/1.0'
        }
      });

      console.log('Cloudinary response status:', response.status);
      console.log('Cloudinary content-type:', response.headers['content-type']);

      // Set appropriate headers
      res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${asset.title}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      console.log('Starting to pipe response...');
      // Pipe the response
      response.data.pipe(res);

      // Handle errors
      response.data.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Stream error' });
        }
      });

    } catch (cloudinaryError) {
      console.error('Cloudinary fetch error:', cloudinaryError.message);
      if (cloudinaryError.response) {
        console.error('Cloudinary status:', cloudinaryError.response.status);
        console.error('Cloudinary error data:', cloudinaryError.response.data);
      }
      
      return res.status(500).json({ message: 'Failed to fetch file from storage' });
    }

  } catch (error) {
    console.error('Error serving asset file:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
    res.status(500).json({ message: 'Failed to serve file' });
  }
};

module.exports = {
  getAssets,
  getAssetById,
  searchAssets,
  serveAssetFile
};

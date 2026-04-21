const Asset = require('../models/Asset');

// @desc    Upload file and return Cloudinary URL
// @route   POST /api/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    // req.file contains the Cloudinary info
    res.json({
      url: req.file.path,
      public_id: req.file.filename,
      size: req.file.size || 0 // Size might not be immediately available in Cloudinary payload
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save upload metadata
// @route   POST /api/upload/metadata
// @access  Private
const saveUploadMetadata = async (req, res) => {
  try {
    const { title, description, type, fileUrl, visibility, is_watermarked, geo_blocked_countries, fileSize } = req.body;

    if (!title || !type || !fileUrl) {
      return res.status(400).json({ message: 'Title, type, and fileUrl are required' });
    }

    const asset = await Asset.create({
      title,
      description,
      type,
      fileUrl,
      visibility,
      is_watermarked,
      geo_blocked_countries,
      fileSize: fileSize || 0,
      owner_id: req.user._id
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track upload progress
// @route   GET /api/upload/progress/:uploadId
// @access  Private
const trackUploadProgress = async (req, res) => {
  // Since we are using standard multer HTTP posts, true stream progress requires client-side XMLHttpRequest/Axios tracking.
  // We can return a generic response or a mock progress if we use separate DB tracked uploads.
  res.json({ message: 'Progress tracking is typically handled client-side via XHR/Axios onUploadProgress' });
};

module.exports = {
  uploadFile,
  saveUploadMetadata,
  trackUploadProgress
};

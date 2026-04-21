const Asset = require('../models/Asset');

// @desc    Get user's media
// @route   GET /api/user/media
// @access  Private
const getUserMedia = async (req, res) => {
  try {
    const query = { owner_id: req.user._id };

    if (req.query.type) {
      query.type = req.query.type;
    }

    const assets = await Asset.find(query).sort({ createdAt: -1 });

    res.json({ assets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update media metadata
// @route   PATCH /api/user/media/:id
// @access  Private
const updateMedia = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Ensure the user owns the asset
    if (asset.owner_id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedAsset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete media
// @route   DELETE /api/user/media/:id
// @access  Private
const deleteMedia = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Ensure the user owns the asset
    if (asset.owner_id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // In a real app we'd also delete from Cloudinary here
    await Asset.deleteOne({ _id: req.params.id });

    res.json({ message: 'Asset removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserMedia,
  updateMedia,
  deleteMedia
};

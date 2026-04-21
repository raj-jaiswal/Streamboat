const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['video', 'image', 'document', 'package', 'stream', 'clip', 'upload'],
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  duration: {
    type: Number, // Applicable for videos/streams/clips, in seconds
    default: 0,
  },
  fileSize: {
    type: Number, // in bytes
    required: true,
  },
  resolution: {
    type: String, // e.g., '1080p', '4K'
    default: '',
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  view_count: {
    type: Number,
    default: 0,
  },
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private',
  },
  is_watermarked: {
    type: Boolean,
    default: false,
  },
  geo_blocked_countries: [{
    type: String, // Array of country codes e.g. ['US', 'IN']
  }],
  metadata: {
    hash: { type: String, default: '' },
    tags: [{ type: String }]
  }
}, { timestamps: true });

const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;

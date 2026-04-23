const mongoose = require('mongoose');

const watermarkJobSchema = new mongoose.Schema({
  asset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'queued' },
  algorithmUsed: { type: String, default: 'invisible_steganography' },
  processingTime: { type: Number, default: 0 } 
}, { timestamps: true });

module.exports = mongoose.model('WatermarkJob', watermarkJobSchema);
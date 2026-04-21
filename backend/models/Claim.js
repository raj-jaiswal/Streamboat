const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String, // Cloudinary URL
    required: true,
  },
  status: {
    type: String,
    enum: ['Uploading', 'Uploaded', 'AI_Analysis', 'Finalizing_Report', 'Completed', 'Failed'],
    default: 'Uploading',
  },
  progress: {
    type: Number, // 0 to 100
    default: 0,
  },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    message: String,
    level: { type: String, enum: ['info', 'warning', 'error'], default: 'info' }
  }],
  reportUrl: {
    type: String,
    default: null, // Link to final report
  }
}, { timestamps: true });

const Claim = mongoose.model('Claim', claimSchema);
module.exports = Claim;

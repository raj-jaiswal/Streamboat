const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ['Uploading', 'Uploaded', 'AI_Analysis', 'Finalizing_Report', 'Completed', 'Failed'],
    default: 'Uploading',
  },
  progress: { type: Number, default: 0 },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    message: String,
    level: { type: String, enum: ['info', 'warning', 'error'], default: 'info' }
  }],
  matches: [{
    title: String,
    url: String,
    similarity: Number,
    owner_id: String
  }],
  // --- MINIMAL ADDITION: Store reports directly in the claims table ---
  reportedMatches: [{
    title: String,
    similarity: Number,
    owner_id: String,
    reportedAt: { type: Date, default: Date.now }
  }],
  // --------------------------------------------------------------------
  reportUrl: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
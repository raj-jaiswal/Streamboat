const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  claim_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  similarity: {
    type: Number,
    required: true,
  },
  owner_id: {
    type: String,
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
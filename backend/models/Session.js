const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceInfo: {
    type: String,
    default: 'Unknown Device',
  },
  ipAddress: {
    type: String,
    default: 'Unknown IP',
  },
  token: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;

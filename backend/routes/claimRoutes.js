const express = require('express');
const router = express.Router();
const { submitClaim, initiateScan, getClaimStatus, getClaimLogs, reportMatch } = require('../controllers/claimController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/claim', protect, submitClaim);
router.post('/scan', protect, initiateScan);
router.get('/claim/:claimId', protect, getClaimStatus);
router.get('/claim/:claimId/logs', protect, getClaimLogs);

// --- MINIMAL ADDITION ---
router.post('/claim/:claimId/report', protect, reportMatch);

module.exports = router;
const express = require('express');
const router = express.Router();
const { submitClaim, initiateScan, getClaimStatus, getClaimLogs } = require('../controllers/claimController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/claim', protect, submitClaim);
router.post('/scan', protect, initiateScan);
router.get('/claim/:claimId', protect, getClaimStatus);
router.get('/claim/:claimId/logs', protect, getClaimLogs);

module.exports = router;

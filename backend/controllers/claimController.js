const Claim = require('../models/Claim');
const Report = require('../models/Report'); // <-- NEW: Import the Report model
const { processSentinelScan } = require('../utils/sentinelAiMock');

// @desc    Submit file for copyright analysis
// @route   POST /api/copyright/claim
// @access  Private
const submitClaim = async (req, res) => {
  try {
    const { fileName, fileUrl } = req.body;

    if (!fileName || !fileUrl) {
      return res.status(400).json({ message: 'File name and URL are required' });
    }

    const claim = await Claim.create({
      user_id: req.user._id,
      fileName,
      fileUrl,
      status: 'Uploaded',
      progress: 10,
      logs: [{ message: 'File uploaded and registered with system.', level: 'info' }]
    });

    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Initiate deep network scan
// @route   POST /api/copyright/scan
// @access  Private
const initiateScan = async (req, res) => {
  try {
    const { claimId } = req.body;

    const claim = await Claim.findById(claimId);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Start background process
    processSentinelScan(claimId);

    res.json({ message: 'Scan initiated successfully', claimId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get claim status & progress
// @route   GET /api/copyright/claim/:claimId
// @access  Private
const getClaimStatus = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get scan logs
// @route   GET /api/copyright/claim/:claimId/logs
// @access  Private
const getClaimLogs = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId).select('logs');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    res.json(claim.logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report a specific match
// @route   POST /api/copyright/claim/:claimId/report
// @access  Private
const reportMatch = async (req, res) => {
  try {
    const { title, similarity, owner_id } = req.body;
    const claimId = req.params.claimId;

    // Verify the claim exists before reporting
    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // <-- NEW: Insert the report into the new Report table
    const newReport = await Report.create({
      claim_id: claimId,
      title,
      similarity,
      owner_id
    });

    res.status(201).json({ 
      message: 'Match successfully reported to the reports table', 
      report: newReport 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitClaim,
  initiateScan,
  getClaimStatus,
  getClaimLogs,
  reportMatch
};
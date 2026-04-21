const Claim = require('../models/Claim');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const processSentinelScan = async (claimId) => {
  try {
    const claim = await Claim.findById(claimId);
    if (!claim) return;

    // Transition: AI Analysis
    claim.status = 'AI_Analysis';
    claim.progress = 25;
    claim.logs.push({ message: 'Sentinel AI started deep network scan', level: 'info' });
    await claim.save();

    await sleep(5000); // Wait 5 seconds
    claim.progress = 50;
    claim.logs.push({ message: 'Scanning video frames against database...', level: 'info' });
    await claim.save();

    await sleep(5000); // Wait 5 seconds
    claim.progress = 75;
    claim.logs.push({ message: 'Analyzing audio fingerprints...', level: 'info' });
    await claim.save();

    await sleep(5000); // Wait 5 seconds

    // Transition: Finalizing Report
    claim.status = 'Finalizing_Report';
    claim.progress = 90;
    claim.logs.push({ message: 'Compiling match results...', level: 'info' });
    await claim.save();

    await sleep(3000); // Wait 3 seconds

    // Complete Randomly (Simulate success or find match)
    const foundMatch = Math.random() > 0.5;
    
    claim.status = 'Completed';
    claim.progress = 100;
    claim.logs.push({ 
      message: foundMatch ? 'Infringement detected with 98% confidence.' : 'No infringement detected.', 
      level: foundMatch ? 'warning' : 'info' 
    });
    claim.reportUrl = 'https://fake-sentinel-report.com/report/' + claimId;
    await claim.save();

  } catch (error) {
    console.error('Sentinel AI Error:', error);
    try {
      await Claim.findByIdAndUpdate(claimId, { 
        status: 'Failed',
        logs: [{ message: 'Scan failed due to an internal error.', level: 'error' }] 
      });
    } catch(e) {}
  }
};

module.exports = {
  processSentinelScan
};

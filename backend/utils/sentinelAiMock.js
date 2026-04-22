const Claim = require('../models/Claim');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pinecone } = require("@pinecone-database/pinecone");
const https = require('https');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// ─── Helper: Fetch File as Base64 ─────────────────────────────────────────────
async function fetchAsBase64(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
            res.on('error', reject);
        });
    });
}

// ─── Helper: Determine MIME Type from URL ─────────────────────────────────────
function getMimeType(url) {
    const urlLower = String(url).toLowerCase();
    
    if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) return 'image/jpeg';
    if (urlLower.includes('.png')) return 'image/png';
    if (urlLower.includes('.webp')) return 'image/webp';
    if (urlLower.includes('.mp4')) return 'video/mp4';
    if (urlLower.includes('.mov')) return 'video/quicktime';
    if (urlLower.includes('.mkv')) return 'video/x-matroska';
    if (urlLower.includes('.pdf')) return 'application/pdf';
    
    // Ultimate safe fallback for Gemini (prevents 400 Bad Request)
    return 'text/plain'; 
}

// ─── Main Scan Process ────────────────────────────────────────────────────────
const processSentinelScan = async (claimId) => {
    try {
        const claim = await Claim.findById(claimId);
        
        // 1. Update Progress: Start
        await Claim.findByIdAndUpdate(claimId, { status: 'AI_Analysis', progress: 30 });

        // 2. Generate Embedding for the uploaded file
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });
        const base64Data = await fetchAsBase64(claim.fileUrl);
        
        // 🚨 FIX: Dynamically determine the MIME type instead of hardcoding octet-stream
        const mimeType = getMimeType(claim.fileUrl);
        console.log(`[Sentinel Scan] Detected MIME Type: ${mimeType} for URL: ${claim.fileUrl}`);

        const result = await model.embedContent({
            content: {
                parts: [{ inlineData: { mimeType: mimeType, data: base64Data } }]
            },
            outputDimensionality: 768
        });

        const queryVector = result?.embedding?.values;

        if (!queryVector) {
            throw new Error("Failed to generate embedding array for the claim.");
        }

        // 3. Query Pinecone for similarities
        await Claim.findByIdAndUpdate(claimId, { 
            progress: 60, 
            logs: [...claim.logs, { message: 'Searching global vector index...', level: 'info' }] 
        });
        
        const index = pc.index("media-embeddings");
        const queryResponse = await index.query({
            vector: Array.from(queryVector).map(n => Number(n)),
            topK: 5,
            includeMetadata: true
        });

        // 4. Filter matches > 85% (0.5)
        const matches = queryResponse.matches
            .filter(match => match.score > 0.85)
            .map(match => ({
                title: match.metadata.title || 'Unknown Title',
                url: match.metadata.url || '#',
                similarity: Math.round(match.score * 100),
                owner_id: match.metadata.owner_id || 'unknown'
            }));

        // 5. Finalize Claim
        await Claim.findByIdAndUpdate(claimId, {
            status: 'Completed',
            progress: 100,
            matches: matches,
            logs: [...claim.logs, { message: `Scan complete. Found ${matches.length} potential matches.`, level: 'info' }]
        });

        console.log(`[Sentinel Scan] ✅ Scan completed for Claim ID: ${claimId}`);

    } catch (error) {
        console.error("[Sentinel Scan] ❌ Scan Error:", error);
        await Claim.findByIdAndUpdate(claimId, { 
            status: 'Failed', 
            logs: [{ message: error.message, level: 'error' }] 
        });
    }
};

module.exports = { processSentinelScan };
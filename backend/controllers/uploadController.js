const https = require('https');
const Asset = require('../models/Asset');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pinecone } = require("@pinecone-database/pinecone");

// ─── Initialize AI & Vector DB Clients ────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const INDEX_NAME = "media-embeddings";

// ─── Helper: Fetch File as Base64 ─────────────────────────────────────────────
function fetchAsBase64(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // NOTE: If you still get a 401 here, check your Cloudinary settings.
      // "Strict Transformations" might be blocking on-the-fly resizing, 
      // or the asset visibility might be set to private/authenticated.
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch: ${res.statusCode} from URL: ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ─── Helper: Optimize Cloudinary URL ──────────────────────────────────────────
function getOptimizedUrl(originalUrl, type) {
  if (!originalUrl.includes('cloudinary.com')) return originalUrl;
  
  if (type === 'video') {
    return originalUrl.replace('/upload/', '/upload/q_auto:eco,w_640,c_limit/');
  } else if (type === 'image') {
    return originalUrl.replace('/upload/', '/upload/w_1024,c_limit/');
  }
  return originalUrl;
}

// ─── Background Service: Generate Embedding & Store ───────────────────────────
async function generateAndStoreEmbedding(assetDoc) {
  try {
    // ─── Inside generateAndStoreEmbedding ────────────────────────────────────────

    console.log(`[Embedding] Starting generation for Asset ID: ${assetDoc._id}`);
    
    // 1. Better MIME type detection
    let mimeType = 'text/plain'; // Safer default than octet-stream
    const typeLower = String(assetDoc.type).toLowerCase();
    const urlLower = String(assetDoc.fileUrl).toLowerCase();

    if (typeLower === 'image') {
      mimeType = 'image/jpeg';
    } else if (typeLower === 'video') {
      mimeType = 'video/mp4';
    } else if (typeLower === 'raw' || typeLower === 'pdf' || typeLower === 'document') {
      mimeType = 'application/pdf';
    }

    // 🚨 Ultimate Fallback: Check the actual file URL for the .pdf extension
    // Cloudinary URLs for PDFs almost always end in .pdf
    if (urlLower.includes('.pdf')) {
      mimeType = 'application/pdf';
    }

    console.log(`[Embedding] Detected MIME Type: ${mimeType} for Asset: ${assetDoc.title}`);


// ... rest of the function remains the same ...

    const optimizedUrl = getOptimizedUrl(assetDoc.fileUrl, assetDoc.type);
    const base64Data = await fetchAsBase64(optimizedUrl);

    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });
    const result = await model.embedContent({
      content: {
        parts: [
          { text: `task: search result | title: ${assetDoc.title} | description: ${assetDoc.description || ''}` },
          { inlineData: { mimeType: mimeType, data: base64Data } }
        ]
      },
      outputDimensionality: 768
    });

    const rawEmbedding = result?.embedding?.values;

    if (!rawEmbedding || rawEmbedding.length === 0) {
      throw new Error("Gemini API failed to generate a valid embedding array.");
    }

    // 🚨 FIX 1: Force standard Array of numbers (Bypasses internal validation issues)
    const cleanValues = Array.from(rawEmbedding).map(n => Number(n));

    // 🚨 FIX 2: Force ALL metadata to strict strings
    const safeMetadata = {
      mongo_id: String(assetDoc._id || "unknown"),
      title: String(assetDoc.title || "Untitled"),
      type: String(assetDoc.type || "unknown"),
      url: String(assetDoc.fileUrl || "no-url"),
      owner_id: String(assetDoc.owner_id || "unknown")
    };

    const pineconeId = String(assetDoc._id);

    const vectorRecord = {
      id: pineconeId,
      values: cleanValues,
      metadata: safeMetadata
    };

    console.log(`[Embedding] Prepared Vector -> ID: ${vectorRecord.id}, Dimensions: ${vectorRecord.values.length}`);

    // 4. Upsert to Pinecone
    const pineconeIndex = pc.index(INDEX_NAME);
    
    // 🚨 FIX 3: Pinecone v7.2.0 syntax requires { records: [array] }
    await pineconeIndex.upsert({ records: [vectorRecord] });

    console.log(`[Embedding] ✅ Saved to Pinecone for Asset: ${assetDoc.title}`);

    await Asset.findByIdAndUpdate(assetDoc._id, { 
      pinecone_id: pineconeId,
      embedding_status: 'completed'
    });

  } catch (error) {
    console.error(`[Embedding] ❌ Failed for Asset ${assetDoc._id}:`, error.message);
    await Asset.findByIdAndUpdate(assetDoc._id, { embedding_status: 'failed' });
  }
}

// ─── Controllers ──────────────────────────────────────────────────────────────

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    res.json({
      url: req.file.path,
      public_id: req.file.filename,
      size: req.file.size || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveUploadMetadata = async (req, res) => {
  try {
    const { title, description, type, fileUrl, visibility, is_watermarked, geo_blocked_countries, fileSize } = req.body;

    if (!title || !type || !fileUrl) {
      return res.status(400).json({ message: 'Title, type, and fileUrl are required' });
    }

    const asset = await Asset.create({
      title,
      description,
      type,
      fileUrl,
      visibility,
      is_watermarked,
      geo_blocked_countries,
      fileSize: fileSize || 0,
      owner_id: req.user._id,
      embedding_status: 'processing'
    });

    generateAndStoreEmbedding(asset);

    res.status(201).json({
      success: true,
      data: asset,
      message: 'Asset saved successfully. AI embeddings are generating in the background.'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const trackUploadProgress = async (req, res) => {
  res.json({ message: 'Progress tracking is typically handled client-side via XHR/Axios onUploadProgress' });
};

module.exports = {
  uploadFile,
  saveUploadMetadata,
  trackUploadProgress
};
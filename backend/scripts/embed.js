const path = require('path');
const fs = require('fs');
const https = require('https');

// ─── 1. Load .env ────────────────────────────────────────────────────────────
const findEnv = () => {
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, '.env');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return null;
};

const envPath = findEnv();
if (!envPath) { 
  console.error('❌ Could not find .env file'); 
  process.exit(1); 
}
require('dotenv').config({ path: envPath });
console.log(`✅ Loaded .env from: ${envPath}`);

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pinecone } = require("@pinecone-database/pinecone");
const cloudinary = require("cloudinary").v2;

// ─── 2. Init Clients ──────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pc    = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// ─── 3. Config ────────────────────────────────────────────────────────────────
const INDEX_NAME = "media-embeddings";
const DIMENSION  = 768; // Gemini 2 supports Matryoshka scaling (3072 down to 768)
const BATCH_SIZE = 50;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── 4. Robust Fetch URL helper ──────────────────────────────────────────────
function fetchAsBase64(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch: ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ─── 5. Fetch Cloudinary Assets ──────────────────────────────────────────────
async function fetchCloudinaryAssets(resourceType) {
  const assets = [];
  let nextCursor = null;
  console.log(`\n📦 Cloudinary: Fetching all ${resourceType}s...`);

  try {
    do {
      const result = await cloudinary.api.resources({
        resource_type: resourceType,
        max_results: 100,
        next_cursor: nextCursor
      });
      assets.push(...result.resources);
      nextCursor = result.next_cursor || null;
    } while (nextCursor);
    console.log(`   ✅ Total ${resourceType}s: ${assets.length}`);
    return assets;
  } catch (error) {
    console.error(`   ❌ Error fetching ${resourceType}:`, error.message);
    return [];
  }
}

// ─── 6. Direct Multimodal Embedding Logic ────────────────────────────────────
async function generateMultimodalEmbedding(asset, type) {
  // Use the native multimodal embedding model
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" }); 
  
  let url = asset.secure_url;
  let mimeType = 'application/octet-stream';

  // Optimize URLs to keep payload size manageable for the API
  if (type === 'image') {
    mimeType = 'image/jpeg';
    url = cloudinary.url(asset.public_id, { 
      resource_type: 'image', format: 'jpg', width: 1024, crop: 'limit', secure: true 
    });
  } else if (type === 'video') {
    mimeType = 'video/mp4';
    // Highly compress video to avoid base64 memory limits (Gemini only needs the visual/audio semantic essence)
    url = cloudinary.url(asset.public_id, { 
      resource_type: 'video', format: 'mp4', quality: 'auto:eco', width: 640, crop: 'limit', secure: true 
    });
  } else if (type === 'pdf') {
    mimeType = 'application/pdf';
    url = asset.secure_url; 
  }

  const base64Data = await fetchAsBase64(url);

  // Gemini Embedding 2 natively accepts interleaved parts (text + media).
  // Providing a task prefix text improves vector retrieval mapping.
  const result = await model.embedContent({
    content: {
      parts: [
        { text: `task: search result | title: ${asset.public_id} | filename: ${asset.public_id}` },
        { inlineData: { mimeType: mimeType, data: base64Data } }
      ]
    },
    outputDimensionality: DIMENSION // Truncates from native 3072 to 768 safely
  });

  return result.embedding.values;
}

// ─── 7. Pinecone Setup ───────────────────────────────────────────────────────
async function ensureIndexExists() {
  const { indexes } = await pc.listIndexes();
  const exists = indexes.some(idx => idx.name === INDEX_NAME);

  if (!exists) {
    console.log(`\n🏗️  Creating Pinecone Index: ${INDEX_NAME}...`);
    await pc.createIndex({
      name: INDEX_NAME,
      dimension: DIMENSION,
      metric: 'cosine',
      spec: { serverless: { cloud: 'aws', region: 'us-east-1' } },
    });
    await delay(30000); // Warm up
  } else {
    console.log(`\n✅ Pinecone Index "${INDEX_NAME}" is ready.`);
  }
}

// ─── 8. Process & Save ───────────────────────────────────────────────────────
async function processAsset(asset, type) {
  try {
    const isPDF = asset.format === 'pdf' || asset.public_id.toLowerCase().endsWith('.pdf');
    const resolvedType = isPDF ? 'pdf' : type;

    const embedding = await generateMultimodalEmbedding(asset, resolvedType);

    if (!embedding) return null;

    return {
      id: asset.public_id.replace(/[^a-zA-Z0-9]/g, '_'), 
      values: embedding,
      metadata: {
        public_id: asset.public_id,
        resource_type: resolvedType,
        url: asset.secure_url
      },
    };
  } catch (err) {
    console.error(`   ❌ Failed: ${asset.public_id}:`, err.message);
    return null;
  }
}

// ─── 9. MAIN ─────────────────────────────────────────────────────────────────
async function main() {
  try {
    await ensureIndexExists();
    const pineconeIndex = pc.index(INDEX_NAME);

    // Fetch all types
    const [images, videos, raws] = await Promise.all([
      fetchCloudinaryAssets('image'),
      fetchCloudinaryAssets('video'),
      fetchCloudinaryAssets('raw'),
    ]);

    const allAssets = [
      ...images.map(a => ({ asset: a, type: 'image' })),
      ...videos.map(a => ({ asset: a, type: 'video' })),
      ...raws.map(a => ({ asset: a, type: 'raw' })),
    ];

    console.log(`\n🚀 Starting direct multimodal pipeline for ${allAssets.length} assets...`);

    const vectors = [];
    for (let i = 0; i < allAssets.length; i++) {
      const { asset, type } = allAssets[i];
      process.stdout.write(`[${i + 1}/${allAssets.length}] Embedding ${type}: ${asset.public_id} ... `);

      const vector = await processAsset(asset, type);
      if (vector) {
        vectors.push(vector);
        console.log(`✅`);
      } else {
        console.log(`⏭️ (Skipped)`);
      }

      await delay(800); // Rate limiting
    }

    if (vectors.length > 0) {
      console.log(`\n📤 Upserting ${vectors.length} vectors to Pinecone...`);
      for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
        const batch = vectors.slice(i, i + BATCH_SIZE);
        await pineconeIndex.upsert(batch);
        console.log(`   Batch upserted (${i + batch.length}/${vectors.length})`);
      }
      console.log("\n✨ Success! Multimodal embeddings are now natively stored in Pinecone.");
    }

  } catch (err) {
    console.error("\n💥 Fatal error in main:", err);
  }
}

main();
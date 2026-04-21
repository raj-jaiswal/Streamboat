const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'streamboat_assets',
    resource_type: 'auto', // allows video, document, image
    allowed_formats: ['mp4', 'png', 'jpg', 'jpeg', 'pdf', 'mov', 'mkv']
  }
});

// Create upload middleware with 100MB limit
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB Limit
});

module.exports = {
  upload,
  cloudinary
};

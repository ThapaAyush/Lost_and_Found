import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

/**
 * Helper to process uploaded file:
 * - If Cloudinary is configured, uploads file to Cloudinary and removes local copy
 * - If Cloudinary is not configured, returns local URL path `/uploads/<filename>`
 */
export const processUploadedFile = async (file, req) => {
  if (!file) return null;

  if (isCloudinaryConfigured()) {
    try {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'lost-and-found',
        resource_type: 'image',
      });
      // Remove temporary local file
      fs.unlink(file.path, () => {});
      return uploadResult.secure_url;
    } catch (err) {
      console.error('[Cloudinary Upload Failed, using local file]', err.message);
    }
  }

  // Construct absolute or relative URL
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${file.filename}`;
};

/**
 * Process multiple uploaded files
 */
export const processUploadedFiles = async (files, req) => {
  if (!files || files.length === 0) return [];
  const urls = [];
  for (const file of files) {
    const url = await processUploadedFile(file, req);
    if (url) urls.push(url);
  }
  return urls;
};

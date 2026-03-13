const sharp = require('sharp');

/**
 * Compress an image buffer and return a data URI (Base64) string.
 * All images are converted to JPEG at 80% quality for consistent storage size.
 *
 * @param {Buffer} buffer    - raw file buffer from multer memoryStorage
 * @param {number} maxWidth  - max pixel width (height auto-scaled)
 * @returns {Promise<string>} - "data:image/jpeg;base64,..." string
 */
async function processImageToBase64(buffer, maxWidth = 1200) {
  const compressed = await sharp(buffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  return `data:image/jpeg;base64,${compressed.toString('base64')}`;
}

/**
 * Encode a raw PDF buffer directly to a Base64 data URI (no compression).
 *
 * @param {Buffer} buffer      - raw PDF buffer
 * @param {string} originalname
 * @param {number} size        - original file size in bytes
 * @returns {{ dataUri, fileName, fileSize }}
 */
function processPdfToBase64(buffer, originalname, size) {
  return {
    dataUri: `data:application/pdf;base64,${buffer.toString('base64')}`,
    fileName: originalname,
    fileSize: `${(size / 1024 / 1024).toFixed(2)} MB`,
  };
}

module.exports = { processImageToBase64, processPdfToBase64 };

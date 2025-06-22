import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Get current file directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates the uploads directory if it doesn't exist
 */
export const createUploadsDirectory = () => {
  const uploadPath = path.join(__dirname, '..', '..', process.env.UPLOAD_PATH || 'uploads');
  
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log(`Created uploads directory at ${uploadPath}`);
  }
};

/**
 * Generates a unique filename for uploaded files
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename
 */
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  
  // Remove special characters from the base name
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${sanitizedBaseName}_${timestamp}${extension}`;
};

/**
 * Deletes a file from the uploads directory
 * @param {string} filename - Name of the file to delete
 * @returns {Promise<boolean>} - Whether the file was deleted successfully
 */
export const deleteFile = async (filename) => {
  try {
    const filePath = path.join(__dirname, '..', '..', process.env.UPLOAD_PATH || 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

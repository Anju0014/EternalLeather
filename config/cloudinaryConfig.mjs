import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


//Cloudinary storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'products', // Folder in Cloudinary where images will be stored
    allowed_formats: ['jpg', 'png'], // File formats allowed
    //transformation: [{ width: 300, height: 300, crop: 'crop' }],
    public_id: (req, file) => file.originalname.split('.')[0], // Using file name without extension as public ID
  },
});

//const storage = multer.memoryStorage();
// Multer middleware for handling image uploads
const upload = multer({ storage });

export { upload };

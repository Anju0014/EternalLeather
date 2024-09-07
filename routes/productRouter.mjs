// // import express from 'express';
// // import multer from 'multer';
// // import { v2 as cloudinary } from 'cloudinary';
// // import Product from '../model/productModel.mjs'; // Example model import
// // import { upload } from '../config/cloudinaryConfig.mjs';

// // const router = express();

// // // Set view engine and views directory
// // router.set('view engine', 'ejs');
// // router.set('views', './views/admin');


// // // const upload = multer(); // Configure multer for file uploads
// // router.get('/add', async (req, res) => {
// //     try {
// //         res.render('adminproductAdd', { message: req.flash() });
// //     } catch (error) {
// //       console.log(`error from admin product ${error}`);
// //     }
// // });
// // router.post('/add', upload.array('images'), async (req, res) => {
// //     try {
// //         const { productname, adddate, price, qty, category, description } = req.body;
// //         //const croppedImages = req.body.croppedImages ? req.body.croppedImages.split(',') : [];
 
// //         const croppedImages = req.body.croppedImages || [];
// //         // Handle validation
// //         if (!productname || !adddate || !price || !qty || !category || !description) {
// //             return res.render('adminProductAdd', { message: { error: 'All fields are required' } });
// //         }

// //         // let uploadedImages = [...croppedImages];

// //         // const newProduct = new Product({
// //         //     productName: productname,
// //         //     productPrice: price,
// //         //     productDescription: description,
// //         //     productQuantity: qty,
// //         //     productCategory: category,
// //         //     productImages: uploadedImages,
// //         // });

// //         const newProduct = new Product({
// //             productName: productname,
// //             productPrice: price,
// //             productDescription: description,
// //             productQuantity: qty,
// //             productCategory: category,
// //             productImages: croppedImages,  // Use the array of cropped image URLs
// //         });
// //         // const savedProduct = await newProduct.save();
// //         // // Handle image upload
// //         // let uploadedImages = [];

// //         // if (req.files && req.files.length > 0) {
// //         //     for (const file of req.files) {
// //         //         const result = await new Promise((resolve, reject) => {
// //         //             const uploadStream = cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
// //         //                 if (error) reject(error);
// //         //                 resolve(result);
// //         //             });
// //         //             uploadStream.end(file.buffer);
// //         //         });
// //         //         uploadedImages.push(result.secure_url);
// //         //     }
// //         // }

// //         // // Save product data (example using MongoDB)
// //         // const newProduct = new Product({
// //         //     productName: productname,
// //         //     productPrice: price,
// //         //     productDescription: description,
// //         //     productQuantity: qty,
// //         //     productCategory: category,
// //         //     productImages: uploadedImages,
// //         // });

// //         const savedProduct = await newProduct.save(); // Use save() method to save the instance

// //         // Send success message and product data to the EJS view
// //         return res.render('adminlogin', { message: { success: 'Product added successfully!' }, productData: savedProduct });

// //     } catch (error) {
// //         console.error('Error adding product:', error);
// //         return res.render('adminlogin', { message: { error: 'Failed to add product. Please try again.' } });
// //     }
// // });

// // export default router;



// // router.post('/add', upload.array('images'), async (req, res) => {
// //     try {
// //       const { productname, adddate, price, qty, category, description } = req.body;
// //       const croppedImages = req.body.croppedImages || []; // For image URLs from frontend
  
// //       // Validation for required fields
// //       if (!productname || !adddate || !price || !qty || !category || !description) {
// //         return res.render('adminproductAdd', { message: { error: 'All fields are required' } });
// //       }
  
// //       let uploadedImages = [...croppedImages]; // Start with cropped images
  
// //       // If there are any uploaded files, process them
// //       if (req.files && req.files.length > 0) {
// //         for (const file of req.files) {
// //           try {
// //             const result = await new Promise((resolve, reject) => {
// //               const uploadStream = cloudinary.uploader.upload_stream(
// //                 { folder: 'products' }, 
// //                 (error, result) => {
// //                   if (error) reject(error);
// //                   resolve(result);
// //                 }
// //               );
// //               uploadStream.end(file.buffer); // Upload file from buffer
// //             });
// //             uploadedImages.push(result.secure_url); // Add image URL to array
// //           } catch (err) {
// //             console.error(`Error uploading image to Cloudinary: ${err}`);
// //             return res.render('adminproductAdd', { message: { error: 'Image upload failed. Please try again.' } });
// //           }
// //         }
// //       }
  
// //       // Create a new product with the uploaded image URLs
// //       const newProduct = new Product({
// //         productName: productname,
// //         productPrice: price,
// //         productDescription: description,
// //         productQuantity: qty,
// //         productCategory: category,
// //         productImages: uploadedImages,
// //       });
  
// //       const savedProduct = await newProduct.save(); // Save the product to the database
  
// //       // Render success page with saved product info
// //       return res.render('adminlogin', { message: { success: 'Product added successfully!' }, productData: savedProduct });
  
// //     } catch (error) {
// //       console.error('Error adding product:', error);
// //       return res.render('adminlogin', { message: { error: 'Failed to add product. Please try again.' } });
// //     }
// //   });
  
// router.post('/add', upload.array('images'), async (req, res) => {
//     try {
//       const { productname, adddate, price, qty, category, description } = req.body;
  
//       // Handle validation
//       if (!productname || !adddate || !price || !qty || !category || !description) {
//         return res.render('adminproductAdd', { message: { error: 'All fields are required' } });
//       }
  
//       // Process image uploads
//       const uploadedImages = [];
//       for (const file of req.files) {
//         const result = await new Promise((resolve, reject) => {
//           const uploadStream = cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
//             if (error) reject(error);
//             resolve(result);
//           });
//           uploadStream.end(file.buffer);
//         });
//         uploadedImages.push(result.secure_url);
//       }
  
//       // Save product data with image URLs
//       const newProduct = new Product({
//         productName: productname,
//         productPrice: price,
//         productDescription: description,
//         productQuantity: qty,
//         productCategory: category,
//         productImages: uploadedImages, // Save the URLs of the uploaded images
//       });
  
//       const savedProduct = await newProduct.save();
  
//       // Send success message and product data to the EJS view
//       return res.render('adminproductAdd', { message: { success: 'Product added successfully!' }, productData: savedProduct });
//     } catch (error) {
//       console.error('Error adding product:', error);
//       return res.render('adminproductAdd', { message: { error: 'Failed to add product. Please try again.' } });
//     }
//   });
  
//   export default router;
// //export default router;


import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Product from '../model/productModel.mjs'; // Example model import

const router = express();
router.set('view engine', 'ejs');
router.set('views', './views/admin');

// Set up Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer(); // Configure multer for file uploads

router.get('/add', async (req, res) => {
  try {
    res.render('adminproductAdd', { message: req.flash() });
  } catch (error) {
    console.log(`error from admin product ${error}`);
  }
});

router.post('/add', upload.array('images'), async (req, res) => {
  try {
    const { productname, adddate, price, qty, category, description } = req.body;

    // Handle validation
    if (!productname || !adddate || !price || !qty || !category || !description) {
      return res.render('adminproductAdd', { message: { error: 'All fields are required' } });
    }
    
    // Process image uploads
    const uploadedImages = [];
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
          if (error) reject(error);
          resolve(result);
        });
        uploadStream.end(file.buffer);
      });
      uploadedImages.push(result.secure_url);
    }

    // Save product data with image URLs
    const newProduct = new Product({
      productName: productname,
      productPrice: price,
      productDescription: description,
      productQuantity: qty,
      productCategory: category,
      productImages: uploadedImages, // Save the URLs of the uploaded images
    });

    const savedProduct = await newProduct.save();

    // Send success message and product data to the EJS view
    return res.render('adminproductAdd', { message: { success: 'Product added successfully!' }, productData: savedProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    return res.render('adminproductAdd', { message: { error: 'Failed to add product. Please try again.' } });
  }
});

export default router;

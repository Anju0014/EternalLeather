import Product from "../../model/productModel.mjs";
import cloudinary from 'cloudinary';


export const adminproduct=async(req,res)=>{
    try{

        if (!req.session.isAdmin) {
           
            return res.redirect('/admin/login');
          }
          const products=await Product.find(); 
          //console.log(users);
          res.render('adminProduct',{message: products});
        
    }catch(error){
        console.log(`error from admin product ${error}`);
    }
}

export const adminproductaddform = async (req, res) => {
    try {
        res.render('adminproductAdd', { message: req.flash() });
    } catch (error) {
      console.log(`error from admin product ${error}`);
    }
};
  
export const pst=async(req,res)=>{
    res.render('addpdt')
}

export const adminproducteditform = async (req, res) => {
    try {
        const productId = req.query.id;
        const product = await Product.findById(productId);

        res.render('adminProductEdit', { product, message: req.flash() }); 
    } catch (error) {
        console.log(`Error fetching product for edit: ${error}`);
        req.flash("error", "An error occurred while fetching the product");
        return res.redirect('/admin/product');
    }
};



// export const adminproductadd = async (req, res) => {
//     try {
//         const { productname, price, description, qty, category, status } = req.body;

//         // Check if product already exists
//         const existingProduct = await Product.findOne({ productName: productname });
//         if (existingProduct) {
//             req.flash("error", "Product already exists");
//             return res.redirect('/admin/product/add');
//         }

//         // Ensure files are uploaded
//         if (!req.files || req.files.length === 0) {
//             req.flash("error", "No images uploaded");
//             return res.redirect('/admin/product/add');
//         }
         

// console.log("hello1")

//         // Upload each file to the 'products' folder in Cloudinary
//         const uploadPromises = req.files.map(file => {
//             return new Promise((resolve, reject) => {
//                 console.log("hello2")
//                 const uploadStream = cloudinary.uploader.upload_stream(
//                     { folder: '/products' }, // Save images in 'products' folder
//                     (error, result) => {
//                         if (error) {
//                             console.log("hello3")
//                             console.error('Cloudinary upload error:', error);
//                             return reject(error);
//                         }
//                         console.log("hello")
//                         resolve(result.secure_url); // Store the image URL
//                     }
//                 );
//                 uploadStream.end(file.buffer); // File buffer is required for uploading
//             });
//         });

//         const imageUrls = await Promise.all(uploadPromises); // Wait for all images to upload

//         // Create and save the product in the database
//         const newProduct = new Product({
//             productName: productname,
//             productPrice: price,
//             productDescription: description,
//             productQuantity: qty,
//             productCategory: category,
//             productImages: imageUrls, // Save the array of image URLs
//             isActive: status,
//         });

//         await newProduct.save(); // Save the product in the database
//         req.flash("success", "Product added successfully");
//         res.redirect('/admin/product');
//     } catch (error) {
//         console.error('Error in adding product:', error);
//         req.flash("error", "An error occurred while adding the product");
//         res.redirect('/admin/product/add');
//     }
// };


// import cloudinary from 'cloudinary'; // Ensure cloudinary is imported correctly
// import Product from "../../model/productModel.mjs";

// export const adminproductadd = async (req, res) => {
//     try {
//         const { productname, price, description, qty, category, status } = req.body;

//         // Check if product already exists
//         const existingProduct = await Product.findOne({ productName: productname });
//         if (existingProduct) {
//             req.flash("error", "Product already exists");
//             return res.status(400).json({ error: 'Product already exists' }); // Send JSON error message
//         }

//         // Ensure files are uploaded
//         if (!req.files || req.files.length === 0) {
//             req.flash("error", "No images uploaded");
//             return res.status(400).json({ error: 'No images uploaded' }); // Send JSON error message
//         }

//         // Upload each file to the 'products' folder in Cloudinary
//         const uploadPromises = req.files.map(file => {
//             return new Promise((resolve, reject) => {
//                 const uploadStream = cloudinary.v2.uploader.upload_stream(
//                     { folder: 'products' }, // Save images in 'products' folder
//                     (error, result) => {
//                         if (error) {
//                             console.error('Cloudinary upload error:', error); // Log error
//                             return reject(error);
//                         }
//                         console.log("Cloudinary upload result:", result); // Log the result
//                         resolve(result.secure_url); // Store the image URL
//                     }
//                 );
//                 uploadStream.end(file.buffer); // File buffer is required for uploading
//             });
//         });

//         // Wait for all images to be uploaded
//         const imageUrls = await Promise.all(uploadPromises);

//         // Create and save the product in the database
//         const newProduct = new Product({
//             productName: productname,
//             productPrice: price,
//             productDescription: description,
//             productQuantity: qty,
//             productCategory: category,
//             productImages: imageUrls, // Save the array of image URLs
//             isActive: status === 'active', // Ensure status is properly set as boolean
//         });

//         await newProduct.save(); // Save the product in the database
//         req.flash("success", "Product added successfully");
//         return res.status(200).json({ message: 'Product added successfully' }); // Send JSON success message

//     } catch (error) {
//         console.error('Error in adding product:', error);
//         req.flash("error", "An error occurred while adding the product");
//         return res.status(500).json({ error: 'An error occurred while adding the product' }); // Send JSON error message
//     }
// };


// import  multer from "multer";  

//  const uploadProduct = multer({
//     storage :  multer.diskStorage ({  
//         destination : "uploads/product",   
//         filename    : (req , file , cb ) =>{ 
//             cb(null , Date.now() + file.originalname)   
//         }
//      })
//  }).array('productImages', 10);     


// export const adminproductadd = async (req, res) => {
//     try {
//       const productname = req.body.productname; 
//       const existingProduct = await Product.findOne({ productName: productname });
      
//       if (existingProduct) {
//           req.flash("error", "Product already exists");
//           return res.redirect('/admin/product/add');
//       }
  
//      // const imageUrls = req.files ? req.files.map(file => file.path) : [];
//      let imageUrls = [];
//      if (req.files && req.files.length > 0) {
//          imageUrls = req.files.map(file => '/uploads/product/${file.filename}'); 
//      }
  
//       const newProduct = new Product({
//           productName: req.body.productname,
//           productPrice: req.body.price,
//           productDescription: req.body.description,
//           productQuantity: req.body.qty,
//           productCategory: req.body.category,
//           productImages: imageUrls,
//           isActive: req.body.status,
//       });
  
//       const savedProduct = await newProduct.save();
      
//       req.flash("success", 'Product added successfully');
//       res.redirect('/admin/product');
//     } catch (error) {
//       console.error(`Error from admin product add: ${error}`);
//       req.flash("error", 'Failed to add product');
//       res.redirect('/admin/product/add');
//     }
//   };
  

import multer from "multer";  

const uploadProduct = multer({
    storage: multer.diskStorage({  
        destination: "uploads/product",   
        filename: (req, file, cb) => { 
            cb(null, Date.now() + "-" + file.originalname);   
        }
    })
}).array('productImages', 10);  // Allow up to 10 images 

export const adminproductadd = async (req, res) => {
    try {
        const productname = req.body.productname; 
        const existingProduct = await Product.findOne({ productName: productname });
        
        if (existingProduct) {
            req.flash("error", "Product already exists");
            return res.redirect('/admin/product/add');
        }

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => `/uploads/product/${file.filename}`);  // Use backticks for interpolation
        }

        const newProduct = new Product({
            productName: req.body.productname,
            productPrice: req.body.price,
            productDescription: req.body.description,
            productQuantity: req.body.qty,
            productCategory: req.body.category,
            productImages: imageUrls,
            isActive: req.body.status,
        });

        const savedProduct = await newProduct.save();
        
        req.flash("success", 'Product added successfully');
        res.redirect('/admin/product');
    } catch (error) {
        console.error(`Error from admin product add: ${error}`);
        req.flash("error", 'Failed to add product');
        res.redirect('/admin/product/add');
    }
};

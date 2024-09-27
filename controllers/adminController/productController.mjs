import Product from "../../model/productModel.mjs";
import Category from "../../model/categoryModel.mjs"
import mongoose from 'mongoose'
import cloudinary from 'cloudinary';


// export const adminproduct=async(req,res)=>{
//     try{

//         if (!req.session.isAdmin) {
           
//             return res.redirect('/admin/login');
//           }
//           const products=await Product.find(); 
//           //console.log(users);
//           res.render('adminProduct',{message: products});
        
//     }catch(error){
//         console.log(`error from admin product ${error}`);
//     }
// }

// export const adminproduct = async (req, res) => {
//     try {
//         if (!req.session.isAdmin) {
//             return res.redirect('/admin/login');
//         }

//         const page = parseInt(req.query.page) || 1;
//         // const pageSize = 10;
//         // const skip = (page - 1) * pageSize;

//         // Fetch the products with pagination
//         const products = await Product.find({ isDeleted: false })
//             .populate('productCategory', 'categoryName')
//             // .skip(skip)
//             // .limit(pageSize);

//         // Debugging: Log the fetched products
//         console.log('Fetched Products:', products);

//         const totalProducts = await Product.countDocuments();
//         // const totalPages = Math.ceil(totalProducts / pageSize);

//         res.render('adminProduct', {
//             message: products,
//             // currentPage: page,
//             // totalPages: totalPages,
//             light:req.flash()
//         });
//     } catch (error) {
//         console.log(`error from admin product ${error}`);
//     }
// };

// export const adminproduct = async (req, res) => {
//     try {
//         if (!req.session.isAdmin) {
//             return res.redirect('/admin/login');
//         }

//         const page = parseInt(req.query.page) || 1;
//         // const pageSize = 10;
//         // const skip = (page - 1) * pageSize;

//         // Fetch the products with pagination
//         const products = await Product.find({ isDeleted: false })
//             .populate('productCategory', 'categoryName')
//             // .skip(skip)
//             // .limit(pageSize);

//         // Debugging: Log the fetched products
//         console.log('Fetched Products:', products);

//         const totalProducts = await Product.countDocuments();
//         // const totalPages = Math.ceil(totalProducts / pageSize);

//         res.render('adminProduct', {
//             message: products,
//             // currentPage: page,
//             // totalPages: totalPages,
//             light:req.flash()
//         });
//     } catch (error) {
//         console.log(`error from admin product ${error}`);
//     }
// };

//

export const adminproductaddform = async (req, res) => {
    try {

        const productCollection=await Category.find({isActive:true});
        res.render('adminproductAdd', { message: req.flash() ,productCollection});
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
        console.log(productId)
        const product = await Product.findById(productId);
        const productCollection=await Category.find({isActive:true});
        // console.log(product)

        res.render('adminproductEdit', { product, message: req.flash(),productCollection,selectedCategoryId: product.productCategory._id.toString() }); 
    } catch (error) {
        console.log(`Error fetching product for edit: ${error}`);
        req.flash("error", "An error occurred while fetching the product");
        return res.redirect('/admin/product');productname
    }
};



export const adminproductupdate = async (req, res) => {
    try {
        const productId = req.body.id;
        const { productname, price, category, qty, description, deleteImages,variety, color, discount, croppedImages } = req.body;
   
       console.log(deleteImages)
        
        const product = await Product.findById(productId);
        if (!product) {
            req.flash("error", "Product not found");
            return res.redirect('/admin/product');
        }

    
        product.productName = productname;
        product.productPrice = price;
        product.productCategory = category;
        product.productDescription = description;
        product.productQuantity = qty;
        product.productType=variety;
        product.productDiscount=discount;
        product.productColor=color;

        
        if (deleteImages && deleteImages.length > 0) {
            product.productImages = product.productImages.filter(imageUrl => !deleteImages.includes(imageUrl));
            // Optionally, delete the images from Cloudinary here using Cloudinary's delete method.
        }

        if (croppedImages && croppedImages.length > 0) {
            product.productImages.push(...croppedImages);
        }
console.log(product.productImages)
        // Save the updated product
        await product.save();
        console.log(product);
        req.flash("success", "Product updated successfully");
        return res.status(200).json({ message: 'Product added successfully' });
    } catch (error) {
        console.log(`Error updating product: ${error}`);
        req.flash("error", "An error occurred while updating the product");
        return res.redirect(`/admin/product/edit/${req.body.id}`);
    }
};


// Required modules


// Configure Cloudinary (make sure to replace with your own Cloudinary credentials)


// // Route to handle product update
// export  const adminproductupdate= async (req, res) => {
//     try {
//         const {
//             id,
//             productname,
//             price,
//             description,
//             qty,
//             category,
//             croppedImages = [],
//             deleteImages = []
//         } = req.body;

//         // Find the product by ID
//         const product = await Product.findById(id);
//         if (!product) {
//             req.flash("error", "Product not found");
//             return res.redirect('/admin/product');
//         }

//         // Update basic product fields
//         product.productName = productname;
//         product.productPrice = price;
//         product.productCategory = category;
//         product.productDescription = description;
//         product.productQuantity = qty;

//         // Handle image deletion
//         if (deleteImages.length > 0) {
//             // Remove the deleted images from the product
//             product.productImages = product.productImages.filter(imageUrl => !deleteImages.includes(imageUrl));

//             // Optionally, delete the images from Cloudinary
//             deleteImages.forEach(async (url) => {
//                 const publicId = url.split('/').pop().split('.')[0]; // Extract the public ID from the URL
//                 try {
//                     await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
//                 } catch (error) {
//                     console.error(`Failed to delete image ${url} from Cloudinary:`, error);
//                 }
//             });
//         }

//         // Add cropped images
//         if (croppedImages.length > 0) {
//             product.productImages.push(...croppedImages);
//         }

//         // Save the updated product
//         await product.save();

//         req.flash("success", "Product updated successfully");
//         return res.redirect('/admin/product');
//     } catch (error) {
//         console.error('Error updating product:', error);
//         req.flash("error", "An error occurred while updating the product");
//         return res.redirect(`/admin/product/edit/${id}`);
//     }
// };




export const adminproductadd = async (req, res) => {
    try {
        const { productname, price, description, variety, discount, qty, color, category, croppedImages } = req.body;
        
        console.log('Cropped Images:', croppedImages); // Check this output


        if (!mongoose.Types.ObjectId.isValid(category)) {
            req.flash("error", "Invalid category selected");
            return res.redirect('/admin/product');
        }

        // Proceed with saving the product and images
        const newProduct = new Product({
            productName: productname,
            productPrice: price,
            productDescription: description,
            productQuantity: qty,
            productCategory: category,
            productType:variety,
            productDiscount:discount,
            productColor:color,
            productImages: croppedImages, // Save all URLs
        });

        await newProduct.save();
        console.log(newProduct)

        req.flash("success", "Product added successfully");
        return res.status(200).json({ message: 'Product added successfully' });
    } catch (error) {
        console.error('Error in adding product:', error);
        req.flash("error", "An error occurred while adding the product");
        return res.status(500).json({ error: 'An error occurred while adding the product' });
    }
};



export const adminproductsearch=async(req,res)=>{
    try{
        
        const name=req.body.sename;
        if(name){
            const regex = new RegExp(name, 'i'); // 'i' for case-insensitive
            const user1 = await Product.find({ productName: { $regex: regex } });
            console.log(user1)
            if(user1.length>0){
               console.log("entered");
               res.render('adminProduct',{
                   message: user1,
                   currentPage: 1,
                   totalPages: 1,
                   light:req.flash(),
                });
            }else{
            res.redirect('/admin/product')
            }
        }else{
            res.redirect('/admin/product')
        }
    }catch(error){
        console.log(error.message)
    }
}

// Delete Category
export const adminproductdelete = async (req, res) => {
    try {
        // const categoryId = req.query.id;
        // console.log(req.query.id);

        // const category = await Category.findByIdAndDelete(categoryId);
        // console.log(category)

        // // if (!category) {
        // //     req.flash("error", "Category not found");
        // //     return res.redirect('/admin/category');
        // // }

        // req.flash("success", "Category deleted successfully");
        // res.redirect('/admin/category');
        console.log(req.url)
    const category = await Product.findByIdAndUpdate(req.query.id,{
        isDeleted: true,
        deletedAt: new Date(),
      });
    res.redirect('/admin/product')

    } catch (error) {
        console.log(`Error deleting product: ${error}`);
        req.flash("error", "An error occurred while deleting the product");
        res.redirect('/admin/product');
    }

    
    // console.log(category)

    // console.log(req.query.id)
};








export const adminproduct = async (req, res) => {
    try {
        const catid = req.query.category || ''; // Get the category from the query
        const minPrice = parseFloat(req.query.minPrice) || 0; // Get the minimum price
        const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER; // Get the maximum price
        const type = req.query.type || ''; // Get the product type
        const sortstyle = req.query.sortstyle || ''; // Get the sort style

        //const page = parseInt(req.query.page) || 1;
        //const pageSize = 12;
       // const skip = (page - 1) * pageSize;

        // Declare variables for product and totalProducts
        let product;
        let totalProducts;

        // Define sorting logic
        let sortCriteria = {};
        if (sortstyle === 'lowToHigh') {
            sortCriteria = { productPrice: 1 }; // Sort by price ascending
        } else if (sortstyle === 'highToLow') {
            sortCriteria = { productPrice: -1 }; // Sort by price descending
        } else if (sortstyle === 'aToZ') {
            sortCriteria = { productName: 1 }; // Sort by name A to Z
        } else if (sortstyle === 'zToA') {
            sortCriteria = { productName: -1 }; // Sort by name Z to A
        }

        // Build the query object for filtering
        const query = {
            isDeleted: false,
            productPrice: { $gte: minPrice, $lte: maxPrice } // Filter by price range
        };

        // Apply category filter if provided
        if (catid) {
            query.productCategory = catid;
        }

        // Apply type filter if provided
        if (type) {
            query.productType = type;
        }

        // Fetch products based on the query and sorting criteria
        product = await Product.find(query)
            .populate('productCategory', 'categoryName')
            .sort(sortCriteria) // Apply sorting
            //.skip(skip)
            //.limit(pageSize);

        // Total products count for pagination
        totalProducts = await Product.countDocuments(query);

        // Calculate total pages
        //const totalPages = Math.ceil(totalProducts / pageSize);

        // Fetch all active categories
        const productCollection = await Category.find({ isActive: true });

        // Render the view with all the necessary data
        res.render('adminProduct', {
            message:product,
            // currentPage: page,
            // totalPages: totalPages,
            productCollection,
            // sessionuser: req.session.isUser,
            catid,
            query:req.query,
            light:req.flash()

        });
    } catch (error) {
        console.log(error);
    }
};

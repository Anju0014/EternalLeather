import Product from "../../model/productModel.mjs";
import Category from "../../model/categoryModel.mjs"
import mongoose from 'mongoose'
import cloudinary from 'cloudinary';



export const adminproductaddform = async (req, res) => {
    try {
        const productCollection=await Category.find({isActive:true});
        res.render('adminproductAdd', { message: req.flash() ,productCollection});
    } catch (error) {
      console.log(`error from admin product ${error}`);
      next(error)
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
        // req.flash("error", "An error occurred while fetching the product");
        // return res.redirect('/admin/product');
        next(error)
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
            
        }

        if (croppedImages && croppedImages.length > 0) {
            product.productImages.push(...croppedImages);
        }
        console.log(product.productImages)
        if(product.productImages.length!==4){
            req.flash("error","Product Image Size is Incorrect.  Total Allowed No is 4")
            return res.status(404).json({ message: 'Error Occured' });
        }
        await product.save();
        console.log(product);
        req.flash("success", "Product updated successfully");
        return res.status(200).json({ message: 'Product added successfully' });
    } catch (error) {
        console.log(`Error updating product: ${error}`);
        next(error)
        // req.flash("error", "An error occurred while updating the product");
        // return res.redirect(`/admin/product/edit/${req.body.id}`);
    }
};



export const adminproductadd = async (req, res) => {
    try {
        const { productname, price, description, variety, discount, qty, color, category, croppedImages } = req.body;
        
        console.log('Cropped Images:', croppedImages); 


        if (!mongoose.Types.ObjectId.isValid(category)) {
            req.flash("error", "Invalid category selected");
            return res.redirect('/admin/product');
        }

        const newProduct = new Product({
            productName: productname,
            productPrice: price,
            productDescription: description,
            productQuantity: qty,
            productCategory: category,
            productType:variety,
            productDiscount:discount,
            productColor:color,
            productImages: croppedImages, 
        });

        await newProduct.save();
        console.log(newProduct)

        req.flash("success", "Product added successfully");
        return res.status(200).json({ message: 'Product added successfully' });
    } catch (error) {
        console.error('Error in adding product:', error);
    //     req.flash("error", "An error occurred while adding the product");
    //     return res.status(500).json({ error: 'An error occurred while adding the product' });
    next(error)
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
        console.log(error)
        next(error)
    }
}

export const adminproductdelete = async (req, res) => {
    try {
       
        console.log(req.url)
    const product = await Product.findByIdAndUpdate(req.query.id,{
        isDeleted: true,
        deletedAt: new Date(),
      });
    res.redirect('/admin/product')

    } catch (error) {
        console.log(`Error deleting product: ${error}`);
        // req.flash("error", "An error occurred while deleting the product");
        // res.redirect('/admin/product');
        next(error)
    }

};



export const adminproduct = async (req, res) => {
    try {
        const catid = req.query.category || ''; 
        const minPrice = parseFloat(req.query.minPrice) || 0; 
        const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER; 
        const type = req.query.type || ''; 
        const sortstyle = req.query.sortstyle || ''; 

        let product;
        let totalProducts;

    
        let sortCriteria = {};
        if (sortstyle === 'lowToHigh') {
            sortCriteria = { productPrice: 1 };
        } else if (sortstyle === 'highToLow') {
            sortCriteria = { productPrice: -1 };
        } else if (sortstyle === 'aToZ') {
            sortCriteria = { productName: 1 }; 
        } else if (sortstyle === 'zToA') {
            sortCriteria = { productName: -1 }; 
        }

    
        const query = {
            isDeleted: false,
            productPrice: { $gte: minPrice, $lte: maxPrice } 
        };

        if (catid) {
            query.productCategory = catid;
        }

  
        if (type) {
            query.productType = type;
        }


        product = await Product.find(query)
            .populate('productCategory', 'categoryName')
            .sort(sortCriteria) 
            //.skip(skip)
            //.limit(pageSize);


        totalProducts = await Product.countDocuments(query);

     
        const productCollection = await Category.find({ isActive: true });

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
        next(error)
    }
};

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





export const adminproductadd = async (req, res) => {
    try {
        const { productname, price, description, qty, category, croppedImages } = req.body;
        
        console.log('Cropped Images:', croppedImages); // Check this output

        // Proceed with saving the product and images
        const newProduct = new Product({
            productName: productname,
            productPrice: price,
            productDescription: description,
            productQuantity: qty,
            productCategory: category,
            productImages: croppedImages, // Save all URLs
        });

        await newProduct.save();
        req.flash("success", "Product added successfully");
        return res.status(200).json({ message: 'Product added successfully' });
    } catch (error) {
        console.error('Error in adding product:', error);
        req.flash("error", "An error occurred while adding the product");
        return res.status(500).json({ error: 'An error occurred while adding the product' });
    }
};


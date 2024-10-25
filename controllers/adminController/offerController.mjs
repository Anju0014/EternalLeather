import Offer from '../../model/offerModel.mjs'
import Category from '../../model/categoryModel.mjs'
import Product from '../../model/productModel.mjs'


export const adminOffer=async(req,res,next)=>{
    try{
        if (!req.session.isAdmin) {
            return res.redirect('/admin/login');
          }
          const offers=await Offer.find({ isActive: true}).populate('offerType'); 
          console.log(offers);
          res.render('adminOffer',{message: offers});
        
    }catch(error){
        console.log(`error from admin offer ${error}`);
        next(error)
    }
}

export const adminOfferAddform=async(req,res,next)=>{
    try{
        if (!req.session.isAdmin) {
            return res.redirect('/admin/login');
          }
        const productCollection=await Category.find({isActive:true});
        res.render('adminOfferAdd', {message: req.flash(),productCollection });
    }catch(error){
        console.log(`error from admin offer ${error}`);
        next(error)
    }
}




export const adminOfferAdd = async (req, res,next) => {
    try {
        const { offerName, offerType, discountValue } = req.body;
        console.log(req.body);
        const existingOffer = await Offer.findOne({ offerName });
        if (existingOffer) {
            console.log("Offer already exists");
            req.flash("error", "Offer already exists");
            return res.status(400).json({ message: 'Offer already exists' });
        }

        const newOffer = new Offer({
            offerName,
            offerType,
            discountPercentage: discountValue,
        });

   
        await newOffer.save();
        console.log("Offer saved");

  
        const products = await Product.find({ productCategory: offerType });
         console.log(products)
   
        for (const product of products) {
         
            const existingDiscount = product.productDiscount || 0; 
            const totalDiscount = existingDiscount + discountValue;


            product.productDiscount = totalDiscount; 
            await product.save();
        }

        req.flash("success", "Offer added and discounts updated successfully");
        res.redirect('/admin/offer');

    } catch (error) {
        console.error(error);
        // req.flash("error", "An error occurred while adding the offer");
        // res.redirect('/admin/offer');
        next(error)
    }
};



export const adminOfferDelete = async (req, res,next) => {
    try {
        const id  = req.query.id; 
        const offerToDelete = await Offer.findById(id);
        if (!offerToDelete) {
            req.flash("error", "Offer not found");
            return res.status(404).json({ message: 'Offer not found' });
        }

        // Fetch products in the specific category
        const products = await Product.find({ productCategory: offerToDelete.offerType });

        // Remove the offer discount from each product
        for (const product of products) {
            // Calculate the new discount
            const existingDiscount = product.productDiscount || 0; // Default to 0 if no existing discount
            const updatedDiscount = existingDiscount - offerToDelete.discountPercentage;

            // Ensure the discount does not go below zero
            product.productDiscount = Math.max(updatedDiscount, 0); 
            await product.save();
        }

        // Delete the offer
        await Offer.findByIdAndUpdate(id,{isActive:false});

        req.flash("success", "Offer deleted and discounts updated successfully");
        res.redirect('/admin/offer');
    } catch (error) {
        console.error(error);
        // req.flash("error", "An error occurred while deleting the offer");
        // res.redirect('/admin/offer');
        next(error)
    }
};



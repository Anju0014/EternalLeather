import Offer from '../../model/offerModel.mjs'
import Category from '../../model/categoryModel.mjs'
import Product from '../../model/productModel.mjs'


export const adminOffer=async(req,res)=>{
    try{
        if (!req.session.isAdmin) {
            return res.redirect('/admin/login');
          }
          const offers=await Offer.find({ isActive: true}).populate('offerType'); 
          console.log(offers);
          res.render('adminOffer',{message: offers});
        
    }catch(error){
        console.log(`error from admin offer ${error}`);
    }
}

export const adminOfferAddform=async(req,res)=>{
    try{
        if (!req.session.isAdmin) {
            return res.redirect('/admin/login');
          }
        const productCollection=await Category.find({isActive:true});
        res.render('adminOfferAdd', {message: req.flash(),productCollection });
    }catch(error){
        console.log(`error from admin offer ${error}`);
    }
}

// export const adminCouponAdd = async (req, res) => {
//     const { couponCode, discountType, discountValue, startDate, expiryDate, maxUsageCount, minOrderAmount } = req.body;

//     try {
//         const existingCoupon = await Coupon.findOne({ couponCode });
//         if (existingCoupon) {
//             return res.status(400).json({ message: 'Coupon code already exists' });
//         }

//         const newCoupon = new Coupon({
//             couponCode,
//             discountType,
//             discountValue,
//             startDate,
//             expiryDate,
//             maxUsageCount,
//             minOrderAmount
//         });

//         await newCoupon.save();
//         req.flash("success", "Coupon added successfully");
//         return res.status(200).json({ message: 'Coupon added successfully' });
//     } catch (error) {
//         console.error('Error adding coupon:', error);
//         req.flash("error", "An error occurred while adding the product");
//         res.status(500).json({ message: 'Error adding coupon' });

//     }
// };


// export const adminOfferAdd = async (req, res) => {
    
     
//     try {
//         const { offerName, offerType, discountValue } = req.body;
//         console.log(req.body)

        
//         const existingOffer = await Offer.findOne({ offerName });

//         if (existingOffer) {
//             console.log("already")
//             req.flash("error", "Offer already exists");
//             return res.status(400).json({ message: 'Offer code already exists' });
//         }
       
     
//          console.log("new")
      
//         const newOffer = new Offer({
//             offerName,
//             offerType,
//             discountPercentage:discountValue ,
            
//         });
      
//         console.log("really")
       
//         await newOffer.save();
//         console.log("saved")
        
//         req.flash("success", "Offer added successfully");
//         res.redirect('/admin/offer')
       

//     } catch (error) {
       
//         req.flash("error", "An error occurred while adding the coupon");
//      res.redirect('/admin/offer')
//     }
// };



// // export const adminCouponStatus= async (req, res) => {
// //     try{
// //     const { id } = req.params;
// //     const { isActive } = req.body; 
// //     const coupon = await Coupon.findById(id);
// //     coupon.isActive = isActive 
// //     await coupon.save();
// //     res.redirect('/admin/coupon'); 
// // }catch (error) {
// //     console.error('Error toggling  status:', error);
// //     res.status(500).send('Internal Server Error');
// // }
// // };


export const adminOfferAdd = async (req, res) => {
    try {
        const { offerName, offerType, discountValue } = req.body;
        console.log(req.body);

        // Check if the offer already exists
        const existingOffer = await Offer.findOne({ offerName });
        if (existingOffer) {
            console.log("Offer already exists");
            req.flash("error", "Offer already exists");
            return res.status(400).json({ message: 'Offer already exists' });
        }

        // Create a new offer
        const newOffer = new Offer({
            offerName,
            offerType,
            discountPercentage: discountValue,
        });

        // Save the new offer
        await newOffer.save();
        console.log("Offer saved");

        // Fetch products in the specific category
        const products = await Product.find({ productCategory: offerType });
         console.log(products)
        // Apply the new offer discount to each product
        for (const product of products) {
            // Calculate the total discount
            const existingDiscount = product.productDiscount || 0; // Default to 0 if no existing discount
            const totalDiscount = existingDiscount + discountValue;

            // Update the product with the new discount
            product.productDiscount = totalDiscount; // Store the updated discount percentage
            await product.save();
        }

        req.flash("success", "Offer added and discounts updated successfully");
        res.redirect('/admin/offer');

    } catch (error) {
        console.error(error);
        req.flash("error", "An error occurred while adding the offer");
        res.redirect('/admin/offer');
    }
};



export const adminOfferDelete = async (req, res) => {
    try {
        const id  = req.query.id; // Assuming you're passing the offer ID in the URL

        // Find the offer to be deleted
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
        req.flash("error", "An error occurred while deleting the offer");
        res.redirect('/admin/offer');
    }
};



import Offer from '../../model/offerModel.mjs'
import Category from '../../model/categoryModel.mjs'
import Product from '../../model/productModel.mjs'


export const adminOffer=async(req,res,next)=>{
    try{
        if (!req.session.isAdmin) {
            return res.redirect('/admin/login');
          }
        //   const offers=await Offer.find({ isActive: true}).populate('offerType'); 
        const offers = await Offer.find().populate('categoryId', 'categoryName').populate('productId', 'productName');

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
        const productList=await Product.find({isDeleted:false})
        res.render('adminOfferAdd', {message: req.flash(),productCollection, productList });
    }catch(error){
        console.log(`error from admin offer ${error}`);
        next(error)
    }
}




// export const adminOfferAdd = async (req, res,next) => {
//     try {
//         const { offerName, offerType, discountValue } = req.body;
//         console.log(req.body);
//         const existingOffer = await Offer.findOne({ offerName });
//         if (existingOffer) {
//             console.log("Offer already exists");
//             req.flash("error", "Offer already exists");
//             return res.redirect('/admin/offer')
//         }

//         const newOffer = new Offer({
//             offerName,
//             offerType,
//             discountPercentage: discountValue,
//         });

   
//         await newOffer.save();
//         console.log("Offer saved");

  
//         const products = await Product.find({ productCategory: offerType });
//          console.log(products)
   
//         for (const product of products) {
         
//             const existingDiscount = product.productDiscount || 0; 
//             let totalDiscount;
//             if (existingDiscount === 0) {
//                 totalDiscount = discountValue; 
//             } else {
//                 totalDiscount = existingDiscount + ((existingDiscount * discountValue) / 100);
//             }
//             if(totalDiscount>50){
//                 totalDiscount=50
//             }
//             product.productDiscount = totalDiscount; 
//             await product.save();
//         }

//         req.flash("success", "Offer added and discounts updated successfully");
//         res.redirect('/admin/offer');

//     } catch (error) {
//         console.error(error);
     
//         next(error)
//     }
// };



// export const adminOfferDelete = async (req, res,next) => {
//     try {
//         const id  = req.query.id; 
//         const offerToDelete = await Offer.findById(id);
//         if (!offerToDelete) {
//             req.flash("error", "Offer not found");
//             return res.status(404).json({ message: 'Offer not found' });
//         }

     
//         const products = await Product.find({ productCategory: offerToDelete.offerType });

    
//         for (const product of products) {
      
//             const currentDiscount = product.productDiscount || 0; 
            
         
//             const offerDiscountValue = (currentDiscount * offerToDelete.discountPercentage) / 100;
//             const updatedDiscount = currentDiscount - offerDiscountValue;
        
        
//             product.productDiscount = Math.max(updatedDiscount, 0);
//             await product.save();
//         }


//         await Offer.findByIdAndUpdate(id,{isActive:false});

//         req.flash("success", "Offer deleted and discounts updated successfully");
//         res.redirect('/admin/offer');
//     } catch (error) {
//         console.error(error);
     
//         next(error)
//     }
// };


export const adminOfferAdd = async (req, res, next) => {
    try {
        const { offerName, offerType, discountValue, categoryId, productId } = req.body;

  
        const existingOffer = await Offer.findOne({ offerName });
        if (existingOffer) {
            req.flash("error", "Offer already exists");
            return res.redirect('/admin/offer');
        }

      
        const newOffer = new Offer({
            offerName,
            offerType,
            discountPercentage: discountValue,
            categoryId: offerType === 'category' ? categoryId : null,
            productId: offerType === 'product' ? productId : null,
        });
        await newOffer.save();

      
        let products;
        if (offerType === 'category') {
            products = await Product.find({ productCategory: categoryId });
        } else if (offerType === 'product') {
            products = await Product.find({ _id: productId });
        }

       
        for (const product of products) {
            const existingDiscount = product.productDiscount || 0;
            let totalDiscount = existingDiscount === 0 ? discountValue : existingDiscount + ((existingDiscount * discountValue) / 100);
            
         
            product.productDiscount = Math.min(totalDiscount, 50);
            await product.save();
        }

        req.flash("success", "Offer added and discounts updated successfully");
        res.redirect('/admin/offer');

    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const adminOfferDelete = async (req, res, next) => {
    try {
        const id = req.query.id;
        const offerToDelete = await Offer.findById(id);

        if (!offerToDelete) {
            req.flash("error", "Offer not found");
            return res.status(404).json({ message: 'Offer not found' });
        }

       
        let products;
        if (offerToDelete.offerType === 'category') {
            products = await Product.find({ productCategory: offerToDelete.categoryId });
        } else if (offerToDelete.offerType === 'product') {
            products = await Product.find({ _id: offerToDelete.productId });
        }

  
        for (const product of products) {
            const currentDiscount = product.productDiscount || 0;
            const discountToRemove = (currentDiscount * offerToDelete.discountPercentage) / 100;
            product.productDiscount = Math.max(currentDiscount - discountToRemove, 0);
            await product.save();
        }

       
        await Offer.findByIdAndUpdate(id, { isActive: false });

        req.flash("success", "Offer deleted and discounts updated successfully");
        res.redirect('/admin/offer');

    } catch (error) {
        console.error(error);
        next(error);
    }
};

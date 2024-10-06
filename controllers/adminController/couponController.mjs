import Coupon from '../../model/couponModel.mjs'


export const adminCoupon=async(req,res)=>{
    try{
        if (!req.session.isAdmin) {
            return res.redirect('/admin/login');
          }
          const coupons=await Coupon.find({ isDeleted: false }); 
          //console.log(users);
          res.render('adminCoupons',{message: coupons});
        
    }catch(error){
        console.log(`error from admin coupons ${error}`);
    }
}

export const adminCouponAddform=async(req,res)=>{
    try{
        if (!req.session.isAdmin) {
            return res.redirect('/admin/login');
          }
       
        res.render('adminCouponsAdd', {message: req.flash() });

    }catch(error){
        console.log(`error from admin coupons ${error}`);
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


export const adminCouponAdd = async (req, res) => {
    
     
    try {
        const { couponCode, discountType, discountValue, startDate, expiryDate, maxUsageCount, minOrderAmount } = req.body;
        console.log(req.body)
        // Check if the coupon code already exists
        const existingCoupon = await Coupon.findOne({ couponCode });
        if (existingCoupon) {
            req.flash("error", "Coupon code already exists");
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
       
        // Validate that expiry date is after start date
        if (new Date(expiryDate) <= new Date(startDate)) {
            req.flash("error", "Expiry date must be after the start date");
            return res.status(400).json({ message: 'Expiry date must be after the start date' });
        }

        // Create a new coupon
        const newCoupon = new Coupon({
            couponCode,
            discountType,
            discountValue,
            startDate: new Date(startDate),
            expiryDate: new Date(expiryDate),
            maxUsageCount: parseInt(maxUsageCount, 10),
            minOrderAmount: parseFloat(minOrderAmount)
        });
      
        console.log("really")
       
        await newCoupon.save();
        console.log("saved")
        
        req.flash("success", "Coupon added successfully");
        res.redirect('/admin/coupon')
       

    } catch (error) {
       
        req.flash("error", "An error occurred while adding the coupon");
     res.redirect('/admin/coupon')
    }
};



export const adminCouponStatus= async (req, res) => {
    try{
    const { id } = req.params;
    const { isActive } = req.body; 
    const coupon = await Coupon.findById(id);
    coupon.isActive = isActive 
    await coupon.save();
    res.redirect('/admin/coupon'); 
}catch (error) {
    console.error('Error toggling  status:', error);
    res.status(500).send('Internal Server Error');
}
};

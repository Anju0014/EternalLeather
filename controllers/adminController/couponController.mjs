import Coupon from '../../model/couponModel.mjs'


export const adminCoupon=async(req,res,next)=>{
    try{
        
          const coupons=await Coupon.find({ isDeleted: false }); 
          //console.log(users);
          res.render('adminCoupons',{message: coupons, light:req.flash()});
        
    }catch(error){
        console.log(`error from admin coupons ${error}`);
        next(error);
    }
}

export const adminCouponAddform=async(req,res,next)=>{
    try{
        if (!req.session.isAdmin) {
            return res.redirect('/admin/login');
          }
       
        res.render('adminCouponsAdd', {message: req.flash() });

    }catch(error){
        console.log(`error from admin coupons ${error}`);
        next(error);
    }
}



export const adminCouponAdd = async (req, res,next) => {
    try {
        const { couponCode, discountType, discountValue, startDate, expiryDate, maxUsageCount, minOrderAmount } = req.body;
        const existingCoupon = await Coupon.findOne({ couponCode });
        if (existingCoupon) {
            req.flash("error", "Coupon code already exists");
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
       
        if (new Date(expiryDate) <= new Date(startDate)) {
            req.flash("error", "Expiry date must be after the start date");
            return res.status(400).json({ message: 'Expiry date must be after the start date' });
        }

        
        const newCoupon = new Coupon({
            couponCode,
            discountType,
            discountValue,
            startDate: new Date(startDate),
            expiryDate: new Date(expiryDate),
            maxUsageCount: parseInt(maxUsageCount, 10),
            minOrderAmount: parseFloat(minOrderAmount)
        });
        await newCoupon.save();
        req.flash("success", "Coupon added successfully");
        res.redirect('/admin/coupon')

    } catch (error) {
        console.log(`error from admin coupons ${error}`);
         next(error);
    }
};



export const adminCouponStatus= async (req, res,next) => {
    try{
    const { id } = req.params;
    const { isActive } = req.body; 
    const coupon = await Coupon.findById(id);
    coupon.isActive = isActive 
    await coupon.save();
    res.redirect('/admin/coupon'); 
}catch (error) {
    console.log('Error toggling  status:', error);
    next(error);
}
};

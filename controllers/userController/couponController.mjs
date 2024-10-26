
import User from '../../model/userModel.mjs'
import Coupon from '../../model/couponModel.mjs'

export const couponList = async (req, res,next) => {
    try {
        if (!req.session.isUser) {
            return res.redirect('/user/home');
        }
        
        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        const currentDate = new Date();
        const coupons = await Coupon.find({
          expiryDate: { $gt: currentDate },  
          isActive: true,                   
          isDeleted: false  
    });
        const user = await User.findOne({ email: req.session.isUser }).populate('couponsUsed.couponId');

     
        if (!user) {
            return res.status(404).send('User not found');
        }
       
        // console.log(user)
      
        
    const couponData = coupons.map(coupon => {
        const userCouponUsage = user.couponsUsed.find(
          usedCoupon => String(usedCoupon.couponId._id) === String(coupon._id)
        );
  
        
        const remainingUsage = userCouponUsage
          ? Math.max(0, coupon.maxUsageCount - userCouponUsage.usageCount)
          : coupon.maxUsageCount;
  
        return {
          coupon,
          userUsage: userCouponUsage ? userCouponUsage.usageCount : 0,
          remainingUsage: remainingUsage, 
        };
      });

        
        // console.log('Fetched Coupons:', coupons);
        // console.log(coupons)

        
        const totalOrders = await Coupon.countDocuments();
        const totalPages = Math.ceil(totalOrders / pageSize);

        res.render('userCoupon', {
            message: couponData,
            currentPage: page,
            totalPages: totalPages,
            light: req.flash(),
            query:req.query,
            user
        });
    } catch (error) {
        console.log(`error from admin coupon${error}`);
        next(error)
    }
};
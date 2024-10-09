
import User from '../../model/userModel.mjs'
import Coupon from '../../model/couponModel.mjs'

export const couponList = async (req, res) => {
    try {
        if (!req.session.isUser) {
            return res.redirect('/user/home');
        }

        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        // Fetch user by email
        const user = await User.findOne({ email: req.session.isUser });

        // Ensure the user exists
        if (!user) {
            return res.status(404).send('User not found');
        }
       
        console.log(user)
        // Fetch orders with pagination
        // const orders = await Order.find({ customerId: user._id })
        //     .populate('productCategory', 'categoryName')
        //     .skip(skip)
        //     .limit(pageSize);
        const coupons = await Coupon.find()
    // .populate('customerId', 'name email')
    // .populate('products.productId')
    // .sort({ createdAt: -1 }) 
    .skip(skip)
    .limit(pageSize);


        
        console.log('Fetched Coupons:', coupons);
        console.log(coupons)

        
        const totalOrders = await Coupon.countDocuments();
        const totalPages = Math.ceil(totalOrders / pageSize);

        res.render('userCoupon', {
            message: coupons,
            currentPage: page,
            totalPages: totalPages,
            light: req.flash(),
            query:req.query
        });
    } catch (error) {
        console.log(`error from admin coupon${error}`);
        next(error)
    }
};
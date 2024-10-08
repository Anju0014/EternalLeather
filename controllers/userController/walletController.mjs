import User from '../../model/userModel.mjs'
import Wallet from '../../model/walletModel.mjs'
import Cart from '../../model/cartModel.mjs'


export const walletView = async (req, res) => {
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
        const wallets = await Wallet.findOne({userID:user._id})
    // .populate('customerId', 'name email')
    // .populate('products.productId')
    // .sort({ createdAt: -1 }) 
    // .skip(skip)
    // .limit(pageSize);

     
    // wallets.transaction.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));

         console.log("haha")
         console.log(wallets)
         console.log("sending")
        // console.log('Fetched Coupons:', coupons);
        // console.log(coupons)

        
        // const totalOrders = await Wallet.countDocuments();
        // const totalPages = Math.ceil(totalOrders / pageSize);

        res.render('userWallet', {
            message: wallets,
            // currentPage: page,
            // totalPages: totalPages,
            light: req.flash(),
            query:req.query
        });
    } catch (error) {
        console.log(`error from user Wallet${error}`);
    }
};
export const checkWalletBalance = async (req, res) => {
    try {
        console.log("reac reac")
        const { paymentMethod, cartTotal } = req.body;
        console.log(req.body)
        const user = await User.findOne({ email: req.session.isUser });

        // Fetch user's wallet
        const wallet = await Wallet.findOne({ userID: user._id });

        if (!wallet || wallet.balance < cartTotal) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }

        // Sufficient balance
        res.json({ success: true });
    } catch (error) {
        console.error('Error checking wallet balance:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
import User from '../../model/userModel.mjs'
import Wallet from '../../model/walletModel.mjs'
import Cart from '../../model/cartModel.mjs'


export const walletView = async (req, res,next) => {
    try {
        if (!req.session.isUser) {
            return res.redirect('/user/home');
        }
        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        const user = await User.findOne({ email: req.session.isUser });

        if (!user) {
            return res.status(404).send('User not found');
        }
       
        console.log(user)
    
        let wallet = await Wallet.findOne({userID:user._id})

         console.log("haha")
         console.log(wallet)
         console.log("sending")
         if (!wallet) {
            wallet = new Wallet({ userID: user._id, balance: 0, transaction: [] });
            await wallet.save();
        }
        wallet.transaction.sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log(wallet);
        res.render('userWallet', {
            message: wallet,
            light: req.flash(),
            query:req.query,
            user
        });
    } catch (error) {
        console.log(`error from user Wallet${error}`);
        next(error)
    }
};



export const checkWalletBalance = async (req, res,next) => {
    try {
        console.log("reac reac")
        const { paymentMethod, cartTotal } = req.body;
        console.log(req.body)
        const user = await User.findOne({ email: req.session.isUser });

        
        const wallet = await Wallet.findOne({ userID: user._id });

        if (!wallet || wallet.balance < cartTotal) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }

        
        res.json({ success: true });
    } catch (error) {
        console.log('Error checking wallet balance:', error);
        next(error)
    
    }
};
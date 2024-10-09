import Category from '../../model/categoryModel.mjs'
 import User from '../../model/userModel.mjs'
 import Product from '../../model/productModel.mjs'
 import Cart from '../../model/cartModel.mjs'
 import Order from '../../model/orderModel.mjs'
 


export const orderconfirm= async (req,res)=>{
     
    try{
        const sessionuser = req.session.isUser;
        const productCollection = await Category.find({ isActive: true });
        if (!req.session.isUser) {
            console.log("User session is missing");
            return res.status(400).send("User is not logged in.");
        }
        
        const user = await User.findOne({ email: req.session.isUser });
        const userid=user._id
        const cart = await Cart.findOne({ userId:user._id }).populate('items.productId')
        console.log(cart)
        if (!user) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }
        const orders = await Order.findOne({ customerId: user._id }).sort({createdAt : -1}).limit(1)
        console.log(orders)
        
        // //const addresses = user.address({isDeleted:false});
        const addresses = user.address.filter(address => !address.isDeleted);
        //console.log(orders.totalPayablePrice)
        res.render('orderSummary', { sessionuser, productCollection,addresses,cart, orders,query:req.query });
    
        
      }catch(error){
        console.log("error from checkout page",error)
        next(error)
      }
}




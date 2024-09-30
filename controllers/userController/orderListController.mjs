import User from '../../model/userModel.mjs'
import Order from '../../model/orderModel.mjs'

// export const orderList = async (req, res) => {
//     try {
//         if (!req.session.isUser) {
//             return res.redirect('/user/home');
//         }

//         const page = parseInt(req.query.page) || 1;
//         const pageSize = 10;
//         const skip = (page - 1) * pageSize;
//         const user=await User.find({email:req.session.isUser}) 
//         // Fetch the products with pagination
//         const orders = await Order.find({ customerId:user.concat_id })
//             .populate('productCategory', 'categoryName')
//             .skip(skip)
//             .limit(pageSize);

//         // Debugging: Log the fetched products
//         console.log('Fetched Orders:', orders);

//         const totalOrders = await orders.countDocuments();
//         // const totalPages = Math.ceil(totalProducts / pageSize);

//         res.render('userOrderPage', {
//             message: orders,
//             currentPage: page,
//             totalPages: totalPages,
//             light:req.flash()
//         });
//     } catch (error) {
//         console.log(`error from admin product ${error}`);
//     }
// };

export const orderList = async (req, res) => {
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
        const orders = await Order.find()
    .populate('customerId', 'name email')
    .populate('products.productId')
    .sort({ createdAt: -1 }) 
    .skip(skip)
    .limit(pageSize);


        
        console.log('Fetched Orders:', orders);

        
        const totalOrders = await Order.countDocuments({ customerId: user._id });
        const totalPages = Math.ceil(totalOrders / pageSize);

        res.render('userOrderPage', {
            message: orders,
            currentPage: page,
            totalPages: totalPages,
            light: req.flash(),
            query:req.query
        });
    } catch (error) {
        console.log(`error from admin product ${error}`);
    }
};



export const userorderCancel = async (req, res) => {
    try {
       
        console.log(req.url)
        
    // const order = await Order.findByIdAndUpdate(req.query.id,{
    //     isCancelled: true,
    //     orderStatus:"Cancelled"
    //     //deletedAt: new Date()
    //   },{new:true});

      const id=req.query.id
    //   const order = await Order.findById(id);
      const order = await Order.findById(id).populate('products.productId');

      for (let item of order.products) {
        const product = item.productId; 
        if (product) {
            product.productQuantity += item.productquantity; 
            await product.save(); 
        }
    }
      order.isCancelled=true,
      order.orderStatus="Cancelled"
      await order.save();
    res.redirect('/user/profile/order')

    } catch (error) {
        console.log(`Error deleting product: ${error}`);
        req.flash("error", "An error occurred while cancelling the order");
        res.redirect('/user/profile/order');
    }
}



export const userorderReturn=async(req,res)=>{
    try {
        const { orderId, reason } = req.body;   
        console.log(req.body)
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        console.log(order)

        
        order.orderStatus = 'Returned';
        order.returnReason = reason;  
        console.log(reason)
        await order.save();

        res.status(200).send({ message: 'Return processed successfully' });
    } catch (error) {
        console.log('Error processing return:', error);
        res.status(500).send({ message: 'An error occurred while processing the return' });
    }
};


import User from '../../model/userModel.mjs'
import Order from '../../model/orderModel.mjs'
import Wallet from '../../model/walletModel.mjs'
import razorpayInstance from '../../config/razorpayConfig.mjs';
import Product from '../../model/productModel.mjs'

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



// export const userorderCancel = async (req, res) => {
//     try {
       
//         console.log(req.url)
//       const id=req.query.id
//     //   const order = await Order.findById(id);
//       const order = await Order.findById(id).populate('products.productId');

//       for (let item of order.products) {
//         const product = item.productId; 
//         if (product) {
//             product.productQuantity += item.productquantity; 
//             await product.save(); 
//         }
//     }
//       order.isCancelled=true,
//       order.orderStatus="Cancelled"
//       await order.save();
//     res.redirect('/user/profile/order')

//     } catch (error) {
//         console.log(`Error deleting product: ${error}`);
//         req.flash("error", "An error occurred while cancelling the order");
//         res.redirect('/user/profile/order');
//     }
// }


// export const userorderCancel = async (req, res) => {
//     try {
//       const orderId = req.query.id;
//       const order = await Order.findById(orderId).populate('products.productId');
//       const userId = order.customerId; // Assuming order has customerId field
//       console.log("tttt")
  
//       if (!order) {
//         req.flash("error", "Order not found");
//         return res.redirect('/user/profile/order');
//       }
  
//       // Check if payment method was Razorpay and initiate a refund
//       if (order.paymentMethod === 'razorpay') {
//         if (!order.razorpayPaymentId) {
//           req.flash("error", "Razorpay payment ID not found for this order");
//           return res.redirect('/user/profile/order');
//         }
//         console.log("hello")
  
//         // Initiate a refund with Razorpay
//         const refund = await razorpayInstance.payments.refund(order.razorpayPaymentId, {
//           amount: order.totalPayablePrice * 100, // Amount in paise (multiply by 100)
//           speed: 'normal', // Refund speed
//         });
  
//         console.log("Refund successful", refund);
  
//         // Check if the user has a wallet
//         let wallet = await Wallet.findOne({ userID: userId });
  
//         // If no wallet exists, create one
//         if (!wallet) {
//           wallet = new Wallet({
//             userID: userId,
//             balance: 0, // Initial balance is 0
//             transaction: [],
//           });
//         }
//         console.log(wallet)
//         // Add the refund amount to wallet balance
//         wallet.balance += order.totalPayablePrice;
  
//         // Record the refund transaction in the wallet
//         wallet.transaction.push({
//           walletAmount: order.totalPayablePrice,
//           orderId: order.orderId,
//           transactionType: 'Credited',
//           transactionDate: new Date(),
//         });
  
//         // Save the updated or newly created wallet
//         await wallet.save();
//       }
  
//       // Update the product stock (restore the quantities)
//       for (let item of order.products) {
//         const product = item.productId;
//         if (product) {
//           product.productQuantity += item.productquantity; // Restoring the quantity back to stock
//           await product.save();
//         }
//       }
  
//       // Update order status to 'Cancelled'
//       order.isCancelled = true;
//       order.orderStatus = "Cancelled";
//       await order.save();
  
//       res.redirect('/user/profile/order');
//     } catch (error) {
//       console.log(`Error cancelling order: ${error}`);
//       req.flash("error", "An error occurred while cancelling the order");
//       res.redirect('/user/profile/order');
//     }
//   };
export const userorderCancel = async (req, res) => {
    try {
        console.log("haha")
      const orderId = req.query.id;
      const order = await Order.findById(orderId).populate('products.productId');
      const userId = order.customerId; // Assuming order has a customerId field
       console.log(userId)
      if (!order) {
        req.flash("error", "Order not found");
        return res.redirect('/user/profile/order');
      }
  
      // Common wallet update logic (for all payment methods)
      let refundAmount = 0;
      if (order.paymentMethod === 'razorpay') {
        // For Razorpay, initiate refund through Razorpay
        if (!order.razorpayPaymentId) {
          req.flash("error", "Razorpay payment ID not found for this order");
          return res.redirect('/user/profile/order');
        }
  
        const refund = await razorpayInstance.payments.refund(order.razorpayPaymentId, {
          amount: order.totalPayablePrice * 100, // Amount in paise (multiply by 100)
          speed: 'normal', // Refund speed
        });
        console.log("Razorpay Refund successful", refund);
        
        refundAmount = order.totalPayablePrice;
      } else {
        // For "Cash on Delivery" and "Wallet Payment", no external refund is needed
        console.log("Non-Razorpay Payment Method, refunding directly");
        refundAmount = order.totalPayablePrice;
      }
  
      // Add the refund amount to user's wallet for all payment methods
      let wallet = await Wallet.findOne({ userID: userId });
  
      // If no wallet exists, create one
      if (!wallet) {
        wallet = new Wallet({
          userID: userId,
          balance: 0, // Initial balance is 0
          transaction: [],
        });
      }
  
      // Add the refund amount to wallet balance
      wallet.balance += refundAmount;
  
      // Record the refund transaction in the wallet
      wallet.transaction.push({
        walletAmount: refundAmount,
        orderId: order.orderId,
        transactionType: 'Credited',
        transactionDescription:'Order Cancel',
        transactionDate: new Date(),
      });
  
      // Save the updated or newly created wallet
      await wallet.save();
  
      // Update the product stock (restore the quantities)
      for (let item of order.products) {
        const product = item.productId;
        if (product) {
          product.productQuantity += item.productquantity; // Restoring the quantity back to stock
          await product.save();
        }
      }
  
      // Update order status to 'Cancelled'
      order.isCancelled = true;
      order.orderStatus = "Cancelled";
      await order.save();
  
      res.redirect('/user/profile/order');
    } catch (error) {
      console.log(`Error cancelling order: ${error}`);
      req.flash("error", "An error occurred while cancelling the order");
      res.redirect('/user/profile/order');
    }
  };
  


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

// export const userProductCancel = async (req, res) => {
//     try {
//         // const orderId = req.query.orderId; // The order ID
//         // const productId = req.query.productId;
//         const{orderId,productId}=req.body // The product ID to be cancelled
//          console.log(req.body)
//         // Find the order by ID and update the specific product status
//         const order = await Order.findById(orderId).populate('products.productId');

//         if (!order) {
//             req.flash('error', 'Order not found');
//             return res.redirect('/user/profile/order');
//         }

//         // Find the product in the order and cancel it
//         const product = order.products.find(item => item.productId.equals(productId));
//         if (!product) {
//             req.flash('error', 'Product not found in this order');
//             return res.redirect('/user/profile/order');
//         }

//         if (product.productstatus === 'Cancelled') {
//             req.flash('error', 'This product has already been cancelled');
//             return res.redirect('/user/profile/order');
//         }

//         // Update product status to cancelled
//         product.productstatus = 'Cancelled';
//         product.isproductCancelled=true;

//         // Handle refund logic if payment method is Razorpay or wallet
//         if (order.paymentMethod === 'razorpay' && product.productstatus !== 'Cancelled') {
//             // Process refund logic
//             const refundAmount = (product.productprice * product.productquantity)-(order.discount/order.totalQuantity);
//             await razorpayInstance.payments.refund(order.razorpayPaymentId, {
//                 amount: refundAmount * 100, // Amount in paise (multiply by 100)
//                 speed: 'normal',
//             });

//             // Update wallet if needed
//             let wallet = await Wallet.findOne({ userID: order.customerId });
//             if (!wallet) {
//                 wallet = new Wallet({
//                     userID: order.customerId,
//                     balance: 0,
//                     transaction: [],
//                 });
//             }
//             wallet.balance += refundAmount;
//             wallet.transaction.push({
//                 walletAmount: refundAmount,
//                 orderId: order._id,
//                 transactionType: 'Credited',
//                 transactionDescription:'Product Cancel',
//                 transactionDate: new Date(),
//             });
//             await wallet.save();
//         }

//         // Restore stock quantity
//         const productDetails = await Product.findById(productId);
//         if (productDetails) {
//             productDetails.productQuantity += product.productquantity;
//             await productDetails.save();
//         }

//         // Save the order after updating product status
//         await order.save();

//         req.flash('success', 'Product cancelled successfully');
//         res.redirect('/user/profile/order');
//     } catch (error) {
//         console.log(`Error cancelling product: ${error}`);
//         req.flash('error', 'An error occurred while cancelling the product');
//         res.redirect('/user/profile/order');
//     }
// };


// export const userProductCancel = async (req, res) => {
//     try {
//         console.log("reach")
//         const { orderId, productId } = req.body; // The order and product IDs
//         console.log(req.body);

//         // Find the order by ID and populate the specific products
//         const order = await Order.findById(orderId).populate('products.productId');

//         if (!order) {
//             req.flash('error', 'Order not found');

//             return res.redirect('/user/profile/order')
//         }

//         // Find the product in the order and cancel it
//         const product = order.products.find(item => item.productId.equals(productId));
//         if (!product) {
//             req.flash('error', 'Product not found in this order');
//             return res.redirect('/user/profile/order');
//         }

//         if (product.productstatus === 'Cancelled') {
//             req.flash('error', 'This product has already been cancelled');
//             return res.redirect('/user/profile/order');
//         }

//         // Update product status to cancelled
//         product.productstatus = 'Cancelled';
//         product.isproductCancelled = true;


//         // Assuming order.discount is the total discount amount applied to the order
//         const totalOrderValue = order.products.reduce((total, item) => {
//            return total + (item.productprice * item.productquantity);
//         }, 0);

// // Calculate the share of the discount that applies to the product being canceled
//         const productValue = product.productprice * product.productquantity;
//         const discountShare = (order.discount / totalOrderValue) * productValue;

// // Calculate the refund amount
//         const refundAmount = productValue - discountShare;

//         // Calculate refund amount (product price * quantity)
//         //const refundAmount = product.productprice * product.productquantity;

//         // Always credit refund to wallet regardless of payment method
//         let wallet = await Wallet.findOne({ userID: order.customerId });
//         if (!wallet) {
//             wallet = new Wallet({
//                 userID: order.customerId,
//                 balance: 0,
//                 transaction: [],
//             });
//         }
//         wallet.balance += refundAmount;
//         wallet.transaction.push({
//             walletAmount: refundAmount,
//             orderId: order._id,
//             transactionType: 'Credited',
//             transactionDescription: 'Product Cancelled',
//             transactionDate: new Date(),
//         });
//         await wallet.save();

//         // Special logic for Razorpay (refund to wallet + process refund through Razorpay API)
//         if (order.paymentMethod === 'razorpay') {
//             await razorpayInstance.payments.refund(order.razorpayPaymentId, {
//                 amount: refundAmount * 100, // Amount in paise (multiply by 100)
//                 speed: 'normal',
//             });
//         }

//         // Restore stock quantity after cancellation
//         const productDetails = await Product.findById(productId);
//         if (productDetails) {
//             productDetails.productQuantity += product.productquantity;
//             await productDetails.save();
//         }

//         // Save the updated order after cancellation
//         await order.save();

//         req.flash('success', 'Product cancelled and refund credited to wallet successfully');
//         res.redirect('/user/profile/order');
//     } catch (error) {
//         console.log(`Error cancelling product: ${error}`);
//         req.flash('error', 'An error occurred while cancelling the product');
//         res.redirect('/user/profile/order');
//     }
// };

export const userProductCancel = async (req, res) => {
    try {
        console.log("reach");
        const { orderId, productId } = req.body; // The order and product IDs
        console.log(req.body);

        // Find the order by ID and populate the specific products
        const order = await Order.findById(orderId).populate('products.productId');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Find the product in the order and cancel it
        const product = order.products.find(item => item.productId.equals(productId));
        if (!product) {
            return res.status(404).json({ error: 'Product not found in this order' });
        }

        if (product.productstatus === 'Cancelled') {
            return res.status(400).json({ error: 'This product has already been cancelled' });
        }

        // Update product status to cancelled
        product.productstatus = 'Cancelled';
        product.isproductCancelled = true;

        // Assuming order.discount is the total discount amount applied to the order
        const totalOrderValue = order.products.reduce((total, item) => {
            return total + (item.productprice * item.productquantity);
        }, 0);

        // Calculate the share of the discount that applies to the product being canceled
        const productValue = product.productprice * product.productquantity;
        const discountShare = (order.discountApplied / totalOrderValue) * productValue;
        
        console.log('Order Discount:', order.discountApplied);
console.log('Total Order Value:', totalOrderValue);
console.log('Product Value:', productValue);

        // Calculate the refund amount
        const refundAmount = productValue - discountShare;

        // Always credit refund to wallet regardless of payment method
        let wallet = await Wallet.findOne({ userID: order.customerId });
        if (!wallet) {
            wallet = new Wallet({
                userID: order.customerId,
                balance: 0,
                transaction: [],
            });
        }
        wallet.balance += refundAmount;
        wallet.transaction.push({
            walletAmount: refundAmount,
            orderId: order._id,
            transactionType: 'Credited',
            transactionDescription: 'Product Cancelled',
            transactionDate: new Date(),
        });
        await wallet.save();

        // Special logic for Razorpay (refund to wallet + process refund through Razorpay API)
        if (order.paymentMethod === 'razorpay') {
            await razorpayInstance.payments.refund(order.razorpayPaymentId, {
                amount: refundAmount * 100, // Amount in paise (multiply by 100)
                speed: 'normal',
            });
        }

        // Restore stock quantity after cancellation
        const productDetails = await Product.findById(productId);
        if (productDetails) {
            productDetails.productQuantity += product.productquantity;
            await productDetails.save();
        }

        // Save the updated order after cancellation
        await order.save();

        return res.status(200).json({ success: 'Product cancelled and refund credited to wallet successfully' });
    } catch (error) {
        // console.log(`Error cancelling product: ${error}`);
        // return res.status(500).json({ error: 'An error occurred while cancelling the product' });
         console.log(`Error cancelling product: ${JSON.stringify(error, null, 2)}`);
    req.flash('error', 'An error occurred while cancelling the product');
    return res.status(500).json({ error: 'An error occurred while cancelling the product' });
    
    }
};

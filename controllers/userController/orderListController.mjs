import User from '../../model/userModel.mjs'
import Order from '../../model/orderModel.mjs'
import Wallet from '../../model/walletModel.mjs'
import razorpayInstance from '../../config/razorpayConfig.mjs';
import Product from '../../model/productModel.mjs'



export const orderList = async (req, res,next) => {
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
            query:req.query,
            user
        });
    } catch (error) {
        console.log(`error from admin product ${error}`);
        next(error)
    }
};

export const userorderCancel = async (req, res,next) => {
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
  

      let wallet = await Wallet.findOne({ userID: userId });
  
    
      if (!wallet) {
        wallet = new Wallet({
          userID: userId,
          balance: 0, 
          transaction: [],
        });
      }
  
     
      wallet.balance += refundAmount;
  
    
      wallet.transaction.push({
        walletAmount: refundAmount,
        orderId: order.orderId,
        transactionType: 'Credited',
        transactionDescription:'Order Cancel',
        transactionDate: new Date(),
      });
  
   
      await wallet.save();
  
 
      for (let item of order.products) {
        const product = item.productId;
        if (product) {
          product.productQuantity += item.productquantity; 
          await product.save();
        }
      }
  
   
      order.isCancelled = true;
      order.orderStatus = "Cancelled";
      await order.save();
  
      res.redirect('/user/profile/order');
    } catch (error) {
      console.log(`Error cancelling order: ${error}`);
      // req.flash("error", "An error occurred while cancelling the order");
      // res.redirect('/user/profile/order');
        next(error)
    }
  };
  


// export const userorderReturn=async(req,res)=>{
//     try {
//         const { orderId, reason } = req.body;   
//         console.log(req.body)
        
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).send('Order not found');
//         }
//         console.log(order)

        
//         order.orderStatus = 'Returned';
//         order.returnReason = reason;  
//         console.log(reason)
//         await order.save();

//         res.status(200).send({ message: 'Return processed successfully' });
//     } catch (error) {
//         console.log('Error processing return:', error);
//         // res.status(500).send({ message: 'An error occurred while processing the return' });
//         next(error)
//       }
// };

// export const userorderReturn = async (req, res, next) => {
//   try {
//       const { orderId, reason } = req.body;   
//       console.log(req.body);
      
//       const order = await Order.findById(orderId);
//       if (!order) {
//           return res.status(404).send('Order not found');
//       }
//       console.log(order);

    
//       let refundAmount = 0;
//       if (order.paymentMethod === 'razorpay') {
        
//           if (!order.razorpayPaymentId) {
//               return res.status(400).send({ message: "Razorpay payment ID not found for this order" });
//           }

//           const refund = await razorpayInstance.payments.refund(order.razorpayPaymentId, {
//               amount: order.totalPayablePrice * 100, 
//               speed: 'normal', 
//           });
//           console.log("Razorpay Refund successful", refund);
//           refundAmount = order.totalPayablePrice;
//       } else {
          
//           refundAmount = order.totalPayablePrice;
//       }


//       let wallet = await Wallet.findOne({ userID: order.customerId });
//       if (!wallet) {
//           wallet = new Wallet({
//               userID: order.customerId,
//               balance: 0, 
//               transaction: [],
//           });
//       }


//       wallet.balance += refundAmount;

   
//       wallet.transaction.push({
//           walletAmount: refundAmount,
//           orderId: order._id, 
//           transactionType: 'Credited',
//           transactionDescription: 'Order Return',
//           transactionDate: new Date(),
//       });

      
//       await wallet.save();

      
//       for (let item of order.products) {
//           const product = item.productId;
//           if (product) {
//               product.productQuantity += item.productquantity; 
//               await product.save();
//           }
//       }


//       order.orderStatus = 'Returned';
//       order.returnReason = reason;  
//       await order.save();

//       res.status(200).send({ message: 'Return processed and refund credited successfully' });
//   } catch (error) {
//       console.log('Error processing return:', error);
//       next(error);
//   }
// };


export const userorderReturn = async (req, res, next) => {
  try {
      const { orderId, reason } = req.body;   
      console.log(req.body);
      
      // Find the order by ID and populate the product details
      const order = await Order.findById(orderId).populate('products.productId');
      if (!order) {
          return res.status(404).send('Order not found');
      }
      console.log(order);

      // Common wallet update logic (for all payment methods)
      let refundAmount = 0;
      if (order.paymentMethod === 'razorpay') {
          if (!order.razorpayPaymentId) {
              return res.status(400).send({ message: "Razorpay payment ID not found for this order" });
          }

          const refund = await razorpayInstance.payments.refund(order.razorpayPaymentId, {
              amount: order.totalPayablePrice * 100, // Amount in paise
              speed: 'normal', // Refund speed
          });
          console.log("Razorpay Refund successful", refund);
          refundAmount = order.totalPayablePrice;
      } else {
          refundAmount = order.totalPayablePrice;
      }

      // Find or create the user's wallet
      let wallet = await Wallet.findOne({ userID: order.customerId });
      if (!wallet) {
          wallet = new Wallet({
              userID: order.customerId,
              balance: 0, 
              transaction: [],
          });
      }

      // Update the wallet balance
      wallet.balance += refundAmount;

      // Log the wallet transaction
      wallet.transaction.push({
          walletAmount: refundAmount,
          orderId: order.orderId, 
          transactionType: 'Credited',
          transactionDescription: 'Order Return',
          transactionDate: new Date(),
      });

      // Save the updated wallet
      await wallet.save();

      // Update the product quantities (restock the items)
      for (let item of order.products) {
          const product = item.productId;
          if (product) {
              product.productQuantity += item.productquantity; // Restocking the returned products
              await product.save();
          }
      }

      // Mark the order as returned
      order.orderStatus = 'Returned';
      order.returnReason = reason;  
      await order.save();

      res.status(200).send({ message: 'Return processed and refund credited successfully' });
  } catch (error) {
      console.log('Error processing return:', error);
      next(error);
  }
};


export const userProductCancel = async (req, res,next) => {
    try {
        console.log("reach");
        const { orderId, productId } = req.body; 

        const order = await Order.findById(orderId).populate('products.productId');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const product = order.products.find(item => item.productId.equals(productId));
        if (!product) {
            return res.status(404).json({ error: 'Product not found in this order' });
        }

        if (product.productstatus === 'Cancelled') {
            return res.status(400).json({ error: 'This product has already been cancelled' });
        }

      
        product.productstatus = 'Cancelled';
        product.isproductCancelled = true;

     
        const totalOrderValue = order.products.reduce((total, item) => {
            return total + (item.productprice * item.productquantity);
        }, 0);

      
        const productValue = product.productprice * product.productquantity;
        const discountShare = (order.discountApplied / totalOrderValue) * productValue;
        
        console.log('Order Discount:', order.discountApplied);
console.log('Total Order Value:', totalOrderValue);
console.log('Product Value:', productValue);

       
        const refundAmount = productValue - discountShare;

       
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
            orderId: order.orderId,
            transactionType: 'Credited',
            transactionDescription: 'Product Cancelled',
            transactionDate: new Date(),
        });
        await wallet.save();

       
        if (order.paymentMethod === 'razorpay') {
            await razorpayInstance.payments.refund(order.razorpayPaymentId, {
                amount: refundAmount * 100, 
                speed: 'normal',
            });
        }

        
        const productDetails = await Product.findById(productId);
        if (productDetails) {
            productDetails.productQuantity += product.productquantity;
            await productDetails.save();
        }

        
        await order.save();
        
        updateOrderStatus(order);

        return res.status(200).json({ success: 'Product cancelled and refund credited to wallet successfully' });
    } catch (error) {
      
        console.log(`Error cancelling product: ${JSON.stringify(error, null, 2)}`);
    // req.flash('error', 'An error occurred while cancelling the product');
    // return res.status(500).json({ error: 'An error occurred while cancelling the product' });
    
          //next(error)
    }
};


export const userProductReturn = async (req, res, next) => {
  try {
      console.log("reach");
      const { orderId, productId, reason } = req.body;
      console.log(req.body);

      // Find the order and populate product information
      const order = await Order.findById(orderId).populate('products.productId');
      if (!order) {
          return res.status(404).json({ error: 'Order not found' });
      }

      // Find the product in the order
      const product = order.products.find(item => item.productId.equals(productId));
      if (!product) {
          return res.status(404).json({ error: 'Product not found in this order' });
      }

      // Check if the product has already been returned
      if (product.productstatus === 'Returned') {
          return res.status(400).json({ error: 'This product has already been returned' });
      }

      // Calculate refund logic
      const totalOrderValue = order.products.reduce((total, item) => total + (item.productprice * item.productquantity), 0);
      const productValue = product.productprice * product.productquantity;
      const discountShare = (order.discountApplied / totalOrderValue) * productValue;
      const refundAmount = productValue - discountShare;

      console.log('Order Discount:', order.discountApplied);
      console.log('Total Order Value:', totalOrderValue);
      console.log('Product Value:', productValue);
      console.log('Refund Amount:', refundAmount);

      // Process refund for Razorpay if payment method is razorpay
      if (order.paymentMethod === 'razorpay') {
          if (!order.razorpayPaymentId) {
              return res.status(400).json({ message: "Razorpay payment ID not found for this order" });
          }

          try {
              await razorpayInstance.payments.refund(order.razorpayPaymentId, {
                  amount: refundAmount * 100, // Amount in paisa
                  speed: 'normal',
              });
              console.log("Refund successful in Razorpay");
          } catch (error) {
              return res.status(500).json({ error: 'Error processing Razorpay refund' });
          }
      }

      // Update wallet balance
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
          orderId: order.orderId,
          transactionType: 'Credited',
          transactionDescription: 'Product Returned',
          transactionDate: new Date(),
      });
      await wallet.save();

      // Update product inventory after return
      const productDetails = await Product.findById(productId);
      if (productDetails) {
          productDetails.productQuantity += product.productquantity;
          await productDetails.save();
      }

      // Update product status in the order
      product.productstatus = 'Returned';
      product.returnProductReason = reason;
      product.returnedDate = Date.now();

      // Save the updated order
      await order.save();

      // Call function to update the overall order status
      updateOrderStatus(order);

      return res.status(200).json({ success: 'Product returned and refund credited to wallet successfully' });
  } catch (error) {
      console.log(`Error returning product: ${error.message}`);
      return res.status(500).json({ error: 'An error occurred while processing the return' });
  }
};


// export const userProductReturn = async (req, res,next) => {
//   try {
//       console.log("reach");
//       const { orderId, productId,reason } = req.body; 
//       console.log(req.body)
//       const order = await Order.findById(orderId).populate('products.productId');

//       if (!order) {
//           return res.status(404).json({ error: 'Order not found' });
//       }

//       const product = order.products.find(item => item.productId.equals(productId));
//       if (!product) {
//           return res.status(404).json({ error: 'Product not found in this order' });
//       }

//       if (product.productstatus === 'Returned') {
//           return res.status(400).json({ error: 'This product has already been returned' });
//       }

    
     

   
//       const totalOrderValue = order.products.reduce((total, item) => {
//           return total + (item.productprice * item.productquantity);
//       }, 0);

    
//       const productValue = product.productprice * product.productquantity;
//       const discountShare = (order.discountApplied / totalOrderValue) * productValue;
      
//       console.log('Order Discount:', order.discountApplied);
//       console.log('Total Order Value:', totalOrderValue);
//       console.log('Product Value:', productValue);

     
//       const refundAmount = productValue - discountShare;

     
      
     
//      if (order.paymentMethod === 'razorpay') {
//           if (!order.razorpayPaymentId) {
//                  return res.status(400).send({ message: "Razorpay payment ID not found for this order" });
//           }
//           await razorpayInstance.payments.refund(order.razorpayPaymentId, {
//               amount: refundAmount * 100, 
//               speed: 'normal',
//           });
//             console.log("refund successful in razorpay")
//      }
         
//         let wallet = await Wallet.findOne({ userID: order.customerId });
//       if (!wallet) {
//           wallet = new Wallet({
//               userID: order.customerId,
//               balance: 0,
//               transaction: [],
//           });
//       }
//       wallet.balance += refundAmount;
//       wallet.transaction.push({
//           walletAmount: refundAmount,
//           orderId: order.orderId,
//           transactionType: 'Credited',
//           transactionDescription: 'Product Returned',
//           transactionDate: new Date(),
//       });
//       await wallet.save();

      
//       const productDetails = await Product.findById(productId);
//       if (productDetails) {
//           productDetails.productQuantity += product.productquantity;
//           await productDetails.save();
//       }
         
//           product.productstatus = 'Returned';
//           product.returnProductReason = reason;  
//           product.returnedDate=Date.now();

          
      
//       await order.save();
//       updateOrderStatus(order);


//       return res.status(200).json({ success: 'Product cancelled and refund credited to wallet successfully' });
//   } catch (error) {
    
//       console.log(`Error cancelling product: ${JSON.stringify(error, null, 2)}`);
//   // req.flash('error', 'An error occurred while cancelling the product');
//   // return res.status(500).json({ error: 'An error occurred while cancelling the product' });
  
//         //next(error)
//   }
// };



function updateOrderStatus(order) {
  const productStatuses = order.products.map(product => product.productstatus);

  // Check if all products have the same status
  const allReturned = productStatuses.every(status => status === 'Returned');
  const allCancelled = productStatuses.every(status => status === 'Cancelled');
  const allDelivered = productStatuses.every(status => status === 'Delivered');
  const allPending = productStatuses.every(status => status === 'Pending');
  const allShipped = productStatuses.every(status => status === 'Shipped');
  
  // Set order status based on product statuses
  if (allReturned) {
      order.orderStatus = 'Returned';
  } else if (allCancelled) {
      order.orderStatus = 'Cancelled';
  } else if (allDelivered) {
      order.orderStatus = 'Delivered';
  } else if (allPending) {
      order.orderStatus = 'Pending';
  } else if (allShipped) {
      order.orderStatus = 'Shipped';
  } else {
      // If some products are in other states (e.g., Confirmed, Shipped, Cancelled, Delivered)
      order.orderStatus = 'Confirmed';
  }

  // Save the updated order in the database
  return order.save()
      .then(() => console.log('Order status updated successfully'))
      .catch(err => console.error('Error updating order status:', err));
}

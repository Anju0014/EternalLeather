import Order from '../../model/orderModel.mjs'

import User from '../../model/userModel.mjs'
import Product from '../../model/productModel.mjs'
import Wallet from '../../model/walletModel.mjs'


export const adminorders= async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;
        const orders = await Order.find().populate('customerId', 'name email').populate('products.productId');
       
        const totalorders = await Order.countDocuments();
        const totalPages = Math.ceil(totalorders / pageSize);
       
        res.render('adminOrders', {
            message:orders,
            currentPage:page,
            totalPages:totalPages,
            light:req.flash()
        });
    } catch (error) {
        console.log('Error fetching orders:', error);
    //     console.log(error)
    //     res.status(500).json({ success: false, message: 'Internal server error' });
    // 
    next(error)
    }
 
};


export const adminorderCancel = async (req, res) => {
    try {
      
        console.log(req.url)
    const order = await Order.findByIdAndUpdate(req.query.id,{
        isCancelled: true,
        //deletedAt: new Date(),
      });
    res.redirect('/admin/order')

    } catch (error) {
        console.log(`Error deleting product: ${error}`);
     
        next(error)
    }
   
};

export const adminorderupdate= async (req, res,next) => {
    try {
        console.log("reach");
        // const { orderId, productId } = req.body;
        const { id } = req.params;
        const { productstatus,productId } = req.body; 
        console.log(id+ "  "+ productstatus+" "+ productId);

        const order = await Order.findById(id).populate('products.productId');

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
        product.productstatus= productstatus
        if(productstatus==="Cancelled"){
            product.isproductCancelled=true
         }else {
             product.isproductCancelled = false;
         }
         if(productstatus==="Delivered"){
             product.deliveredDate= Date.now();
         }
         if(productstatus==="Returned"){
             product.returnedDate=Date.now();
         }
      
        // product.productstatus = 'Cancelled';
        // product.isproductCancelled = true;

     
        const totalOrderValue = order.products.reduce((total, item) => {
            return total + (item.productprice * item.productquantity);
        }, 0);

      
        const productValue = product.productprice * product.productquantity;
        const discountShare = (order.discountApplied / totalOrderValue) * productValue;
        
        console.log('Order Discount:', order.discountApplied);
        console.log('Total Order Value:', totalOrderValue);
        console.log('Product Value:', productValue);

       
        const refundAmount = productValue - discountShare;

        if(productstatus==='Cancelled' && order.paymentMethod!=='Cash on Delivery'){
            console.log("bye byeee")

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
        console.log("pay")
    }
        
        const productDetails = await Product.findById(productId);
        if (productDetails) {
            productDetails.productQuantity += product.productquantity;
            await productDetails.save();
        }

        
        await order.save();
        updateOrderStatus(order);

        res.redirect('/admin/order')
        // return res.status(200).json({ success: 'Product status changed ' });
    }   catch(error){
        console.error('Error toggling block status:', error);
 
    next(error)
}};

function updateOrderStatus(order) {
    const productStatuses = order.products.map(product => product.productstatus);
  

    const allReturned = productStatuses.every(status => status === 'Returned');
    const allCancelled = productStatuses.every(status => status === 'Cancelled');
    const allDelivered = productStatuses.every(status => status === 'Delivered');
    const allPending = productStatuses.every(status => status === 'Pending');
    const allShipped = productStatuses.every(status => status === 'Shipped');
    
    
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
        order.orderStatus = 'Confirmed';
    }
  
    
    return order.save()
        .then(() => console.log('Order status updated successfully'))
        .catch(err => console.error('Error updating order status:', err));
  }
  
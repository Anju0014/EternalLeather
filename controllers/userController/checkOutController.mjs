import razorpayInstance from'../../config/razorpayConfig.mjs'
import Category from '../../model/categoryModel.mjs'
 import User from '../../model/userModel.mjs'
 import Product from '../../model/productModel.mjs'
 import Cart from '../../model/cartModel.mjs'
 import Order from '../../model/orderModel.mjs'
 import Coupon from '../../model/couponModel.mjs'
 import Wallet from '../../model/walletModel.mjs'
import crypto from 'crypto';
import Razorpay from 'razorpay';


export const checkoutpost = async (req, res) => {
    try {
      const { selectedAddress, paymentMethod, cartId, appliedCoupon, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
      const user = await User.findOne({ email: req.session.isUser });
      const customerAddress = user.address.id(selectedAddress);
      const cart = await Cart.findById(cartId).populate('items.productId');
  
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }
  
      if (!customerAddress) {
        return res.status(400).json({ success: false, message: 'Invalid address selected' });
      }
  
      
      if (paymentMethod === 'Razorpay') {
        const secret = 'your_razorpay_secret'; 
        const generatedSignature = crypto
          .createHmac('sha256', secret)
          .update(razorpay_order_id + "|" + razorpay_payment_id)
          .digest('hex');
        
        if (generatedSignature !== razorpay_signature) {
          return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
      }
  
      
      let discount = 0;
      let coupon;
      if (appliedCoupon) {
        coupon = await Coupon.findById(appliedCoupon);
  
        if (!coupon || !coupon.isActive || coupon.isDeleted || new Date() > coupon.expiryDate) {
          return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
        }
  
        if (coupon.discountType === 'percentage') {
          discount = (cart.payablePrice * coupon.discountValue) / 100;
        } else if (coupon.discountType === 'flat') {
          discount = coupon.discountValue;
        }
  
        cart.payablePrice = Math.max(0, cart.payablePrice - discount);
      }
  
      
      if (paymentMethod === 'Wallet') {
        const wallet = await Wallet.findOne({ userID: user._id });
        if (!wallet || wallet.balance < cart.payablePrice) {
          return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }
  
        wallet.balance -= cart.payablePrice;
        wallet.transaction.push({
          walletAmount: cart.payablePrice,
          orderId: newOrder._id,
          transactionType: 'Debited',
          transactionDate: new Date(),
        });
  
        await wallet.save();
      }
  
      
      const newOrder = new Order({
        customerId: user._id,
        products: cart.items.map(item => ({
          productId: item.productId._id,
          productname: item.productId.productName,
          productquantity: item.productCount,
          productprice: item.discountPrice,
          productimage: item.productId.productImages[0],
          productstatus: 'Pending'
        })),
        totalQuantity: cart.items.reduce((acc, item) => acc + item.productCount, 0),
        totalPrice: cart.items.reduce((acc, item) => acc + item.productPrice * item.productCount, 0),
        totalPayablePrice: cart.payablePrice,
        address: {
          customerName: customerAddress.contactname,
          customerEmail: customerAddress.email,
          building: customerAddress.building,
          street: customerAddress.street,
          city: customerAddress.city,
          country: customerAddress.country,
          pincode: customerAddress.pincode,
          phonenumber: customerAddress.phoneno,
          landMark: customerAddress.landMark
        },
        paymentMethod,
        orderStatus: 'Pending',
        couponApplied: appliedCoupon ? coupon._id : null,
        discountApplied: discount
      });
  
      await newOrder.save();
      const orderIdCode = newOrder._id.toString().slice(-5);
      newOrder.orderId = orderIdCode;
      await newOrder.save();
  
      for (const item of cart.items) {
        const product = await Product.findById(item.productId);
        if (product.productQuantity < item.productCount) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product: ${product.name}`
          });
        }
        product.productQuantity -= item.productCount;
        await product.save();
      }
  
      await Cart.findByIdAndDelete(cartId);
  
      res.json({ success: true, message: 'Order placed successfully' });
    } catch (error) {

      res.status(500).json({ success: false, message: 'Order processing failed', error: error.message });
    }
  };
  




export const paymentRender = async (req, res) => {
    try {
        const totalAmount = req.body.amount; 
        console.log("Received Amount: " + totalAmount);

        if (!totalAmount) {
            return res.status(400).json({ error: "Amount parameter is missing" });
        }

        const options = {
            amount: totalAmount * 100, 
            currency: "INR",
            receipt: "receipt#1"
        };
        console.log("89889")
        razorpayInstance.orders.create(options, (error, order) => {
            console.log("hiiii")
            if (error) {
                console.log("....." + totalAmount+"flu444333")
                console.error("Failed to create order:", error); 
                return res.status(500).json({ error: `Failed to create order: ${JSON.stringify(error)}` }); 
            }
            console.log(order.id)
            return res.status(200).json({
                orderID: order.id,
                amount: order.amount, 
                key_id: process.env.RAZORPAY_KEY_ID 
            });
        });
    } catch (error) {
        console.error(`Error on orders in checkout: ${error}`);
        return res.status(500).json({ error: 'Internal server error' });
        
    }
};



export const paymentVerify = async (req, res) => {
  try{
    console.log(req.body)
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    
    const key_secret = process.env.RAZORPAY_KEY_SECRET; 

    const generated_signature = crypto
        .createHmac('sha256', key_secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

    if (generated_signature === razorpay_signature) {
        // Signature is valid, process the payment
        res.status(200).json({ success: true });
    } else {
        // Signature is invalid, reject the payment
        res.status(400).json({ success: false });
    }
  }catch(error){
    // next(error)
    return res.status(500).json({ error: 'Error in Verification' });
  }
};

export const userPaymentRetry = async (req, res) => {
  try {
      const orderId = req.body.orderId; 
      const order = await Order.findById(orderId).populate('products.productId');
      const totalAmount= order.totalPayablePrice;
      console.log("kkkmkncb")

      console.log("Received Amount: " + totalAmount); 

      if (!totalAmount) {
          return res.status(400).json({ error: "Amount parameter is missing" });
      }

      const options = {
          amount: totalAmount * 100, 
          currency: "INR",
          receipt: "receipt#1"
      };
      console.log("89889")
      razorpayInstance.orders.create(options, (error, order) => {
          console.log("hiiii")
          if (error) {
              console.log("....." + totalAmount+"flu444333")
              console.error("Failed to create order:", error); 
              return res.status(500).json({ error: `Failed to create order: ${JSON.stringify(error)}` }); 
          }
          console.log(order.id)
          return res.status(200).json({
              orderID: order.id,
              amount: order.amount, 
              key_id: process.env.RAZORPAY_KEY_ID 
          });
      });
  } catch (error) {
      console.error(`Error on orders in checkout: ${error}`);
      return res.status(500).json({ error: 'Internal server error' });
      // next(error)
  }
};


export const paymentRetryStatus = async (req, res) => {
  try {

   console.log("moijdhdbhd")
    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
       razorpay_signature,
      // paymentMethod
      paymentStatus,
    } = req.body;
    console.log("regggggg")
     
      const order = await Order.findById(orderId).populate('products.productId');
      console.log(order)
      order.paymentStatus='Paid'
      order.razorpayPaymentId=razorpay_payment_id
      order.razorpayOrderId=razorpay_order_id
      order.razorpaySignature=razorpay_signature
      
      order.save()
      console.log(order)
      res.json({ success: true, message: 'Order Status Changed successfully' });
    
  } catch (error) {
      console.error(`Error on orders in checkout: ${error}`);
      return res.status(500).json({ error: 'Internal server error' });
      // next(error)
  }
};


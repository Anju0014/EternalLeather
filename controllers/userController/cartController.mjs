 
 import Category from '../../model/categoryModel.mjs'
 import User from '../../model/userModel.mjs'
 import Product from '../../model/productModel.mjs'
 import Cart from '../../model/cartModel.mjs'
 import Order from '../../model/orderModel.mjs'
 import Coupon from '../../model/couponModel.mjs'
 import Wallet from '../../model/walletModel.mjs'
 
 
 
 export const cartdata= async (req,res)=>{
  try{
    if (!req.session.isUser) {
        req.flash('error', "User is Not Found , Please Login "  )
        return res.redirect('/user/home');
    }


    const productCollection = await Category.find({ isActive: true });
    const user=await User.findOne({email:req.session.isUser})
    const cart = await Cart.findOne({ userId:user._id }).populate('items.productId')
    console.log(cart)
    let totalPrice = 0;
    let totalPriceWithoutDiscount=0;
    let totalPriceWithDiscount=0;
    let  cartItemCount = 0;
    let priceWithDiscount=0;
    let payablePrice=0;

    if (cart) {
        cart.items.forEach((item) => {
             if (item.productId.productDiscount > 0) {

              console.log(item.productId.productDiscount)
              totalPriceWithoutDiscount += item.productId.productPrice*item.productCount;
              priceWithDiscount = item.productId.productPrice - (item.productId.productPrice * (item.productId.productDiscount / 100))
              totalPriceWithDiscount = priceWithDiscount*item.productCount;
              totalPrice += priceWithDiscount*item.productCount;
             
            }
            else {
          
                // totalPriceWithoutDiscount += item.productId.productPrice*item.productCount;
                // totalPrice += priceWithDiscount*item.productCount
                //totalPriceWithdiscount
                totalPriceWithoutDiscount += item.productId.productPrice * item.productCount;
                totalPrice += item.productId.productPrice * item.productCount; 
                }
                cartItemCount += item.productCount
            })
            console.log(cart.payablePrice)
            if (cart.payablePrice != totalPrice || cart.totalPrice != totalPriceWithoutDiscount) {
                    cart.payablePrice = Math.round(totalPrice);
                    cart.totalPrice = Math.round(totalPriceWithoutDiscount);
            }
            console.log(cart.payablePrice," ", totalPrice)
            if(cart.payablePrice < 1000){
                    cart.payablePrice = cart.payablePrice + 50
            }
                payablePrice=cart.payablePrice
                await cart.save();
            }
    
    res.render('usercartview', { 
    
        cart, 
        productCollection, 
        sessionuser: req.session.isUser, 
        payablePrice:payablePrice, 
        totalPrice, 
        totalPriceWithoutDiscount ,
        query:req.query
    });
  }catch(error){
    next(error)
  }
}



export const cartview = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;  

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }


    if (req.session && req.session.isUser) {
      try {
        const user = await User.findOne({ email: req.session.isUser });
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }

        const productDetails = await Product.findById(productId);
        if (!productDetails || productDetails.productQuantity <= 0) {
          return res.status(404).json({ message: 'Product is out of stock' });
        }
        const discountPrice= productDetails.productPrice-((productDetails.productDiscount*productDetails.productPrice)/100)
        
        let userCart = await Cart.findOne({ userId: user._id }).populate('items.productId');

        if (userCart) {
          
          const existingItem = userCart.items.find(item => item.productId.equals(productId));

          if (existingItem) {
            if (existingItem.productCount + quantity > 4) {
              return res.status(400).json({ message: 'Product count cannot exceed 4' });
            } else {
            existingItem.productCount += quantity;

          } }
          else {
            
            userCart.items.push({
              productId,
              productCount: quantity,
              productPrice: productDetails.productPrice,
              discountPrice: discountPrice,
            });
          }

          
          await userCart.save();

          return res.status(200).json({ message: 'Product added to cart' });

        } else {
          
          const newCart = new Cart({
            userId: user._id,
            items: [{
              productId: productDetails._id,
              productCount: quantity,
              productPrice: productDetails.productPrice,
              discountPrice: discountPrice,
            }]
          });

        
          await newCart.save();

          return res.status(200).json({ message: 'Product added to cart' });
        }

      } catch (error) {
        console.error('Error adding product to cart:', error);
        return res.status(500).json({ message: 'Error adding product to cart' });
      }
    } else {
      return res.status(401).json({ message: 'Please log in to add products to the cart' });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    next(error)
    // return res.status(500).json({ message: 'Unexpected error occurred' });
  }
};





export const cartincrement= async (req, res) => {
  try {
      const productId = req.params.productId;
      const user = await User.findOne({ email: req.session.isUser });
      
      if (!user) {
          return res.status(401).json({ message: 'Please log in to update the cart.' });
      }

   
      const cart = await Cart.findOneAndUpdate(
          { userId: user._id, 'items.productId': productId },
          { $inc: { 'items.$.productCount': 1 } },  
          { new: true }
      ).populate('items.productId'); 

      if (!cart) {
          return res.status(404).json({ message: 'Cart not found or item does not exist' });
      }

  
      let totalPrice = 0;
      let totalPriceWithoutDiscount = 0;

      cart.items.forEach(item => {
          const productPrice = item.productId.productPrice || 0;
          const discount = (item.productId.discountPrice || 0) / 100;
          const quantity = item.productCount || 0;

          const priceWithDiscount = (productPrice - (discount * productPrice)) * quantity;
          totalPrice += priceWithDiscount;
          totalPriceWithoutDiscount += productPrice * quantity;
      });

      cart.payablePrice = Math.round(totalPrice);
      cart.totalPrice = Math.round(totalPriceWithoutDiscount);

  
      await cart.save();

      res.status(200).json({ message: 'Quantity incremented', cart });

  } catch (error) {
      console.error('Error incrementing quantity:', error);
      // res.status(500).json({ message: 'Error incrementing quantity' });
      next(error)
  }
};


export const cartdecrement= async (req, res) => {
  try {
      const productId = req.params.productId;
      const user = await User.findOne({ email: req.session.isUser });

      if (!user) {
          return res.status(401).json({ message: 'Please log in to update the cart.' });
      }

  
      const cart = await Cart.findOneAndUpdate(
          { userId: user._id, 'items.productId': productId },  
          { $inc: { 'items.$.productCount': -1 } }, 
          { new: true }
      ).populate('items.productId');

      if (!cart) {
          return res.status(404).json({ message: 'Cart not found or item does not exist' });
      }

     
      let totalPrice = 0;
      let totalPriceWithoutDiscount = 0;

      cart.items.forEach(item => {
          const productPrice = item.productId.productPrice || 0;
          const discount = (item.productId.discountPrice || 0) / 100;
          const quantity = item.productCount || 0;

          const priceWithDiscount = (productPrice - (discount * productPrice)) * quantity;
          totalPrice += priceWithDiscount;
          totalPriceWithoutDiscount += productPrice * quantity;
      });

      cart.payablePrice = Math.round(totalPrice);
      cart.totalPrice = Math.round(totalPriceWithoutDiscount);

 
      await cart.save();

      res.status(200).json({ message: 'Quantity decremented', cart });

  } catch (error) {
      console.error('Error decrementing quantity:', error);
      // res.status(500).json({ message: 'Error decrementing quantity' });
      next(error)
  }
};




  

export const cartdelete= async (req, res) => {
    try {
        const productId = req.params.productId;

      
        const user = await User.findOne({ email: req.session.isUser });
        if (!user) {
            return res.status(401).json({ message: 'Please log in to delete items from your cart.' });
        }

     
        const cart = await Cart.findOneAndUpdate(
            { userId: user._id },
            { $pull: { items: { productId: productId } } },  
            { new: true }  
        ).populate('items.productId');  

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found or item does not exist' });
        }

        
        let totalPrice = 0;
        let totalPriceWithoutDiscount = 0;

        cart.items.forEach(item => {
            const productPrice = item.productId.productPrice || 0;
            const discount = (item.productId.discountPrice || 0) / 100;
            const quantity = item.productCount || 0;

            const priceWithDiscount = (productPrice - (discount * productPrice)) * quantity;
            totalPrice += priceWithDiscount;
            totalPriceWithoutDiscount += productPrice * quantity;
        });

        cart.payablePrice = Math.round(totalPrice);
        cart.totalPrice = Math.round(totalPriceWithoutDiscount);

      
        await cart.save();

        res.status(200).json({ message: 'Item deleted successfully', cart });
    } catch (error) {
        console.error("Error deleting item from cart:", error);
        // res.status(500).json({ message: 'Error deleting item from cart' });
        next(error)
    }
};


export const checkout= async (req,res)=>{
  try{
    const sessionuser = req.session.isUser;
    const productCollection = await Category.find({ isActive: true });
    
    if (!req.session.isUser) {
        return res.redirect('/user/home')
    }
    
    const user = await User.findOne({ email: req.session.isUser });
    const userid=user._id
    const cart = await Cart.findOne({ userId:user._id }).populate('items.productId')
    // const coupons=await Coupon.find()
    const coupons = await Coupon.find({
      isActive: true,
      isDeleted: false,
      startDate: { $lte: new Date() },  
      expiryDate: { $gte: new Date() }  
  });
    const validCoupons = coupons.filter(coupon => cart.payablePrice >= coupon.minOrderAmount);
    if (!user) {
        console.log("User not found");
        return res.status(404).send("User not found");
    }
    const itemsOutOfStock = cart.items.some(item => {
      return item.productId.productQuantity< item.productCount; 
  });

  if (itemsOutOfStock) {
      return res.redirect('/user/addtocart'); 
  }
    // //const addresses = user.address({isDeleted:false});
    const addresses = user.address.filter(address => !address.isDeleted);

    res.render('usercheckout', { user,coupons,sessionuser, productCollection,addresses,cart,query:req.query });

    
  }catch(error){
    console.log("error from checkout page",error)
    next(error)
  }
}
 


export const checkoutpost = async (req, res) => {
  try {
    const {
      selectedAddress,
      paymentMethod,
      cartId,
      appliedCoupon,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;
    console.log(req.body)

    
    const user = await User.findOne({ email: req.session.isUser });
    const customerAddress = user.address.id(selectedAddress);
    const cart = await Cart.findById(cartId).populate('items.productId');

    if (paymentMethod === 'Wallet') {
      const wallet = await Wallet.findOne({ userID: user._id });
      console.log(wallet)
      if (!wallet || wallet.balance < cart.payablePrice) {
        return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
      }}
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    if (!customerAddress) {
      return res.status(400).json({ success: false, message: 'Invalid address selected' });
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

    // Create and save order
    const newOrder = new Order({
      customerId: user._id,
      products: cart.items.map((item) => ({
        productId: item.productId._id,
        productname: item.productId.productName,
        productquantity: item.productCount,
        productprice: item.discountPrice,
        productimage: item.productId.productImages[0],
        productstatus: 'Pending',
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
        landMark: customerAddress.landMark,
      },
      paymentMethod,
      orderStatus: 'Pending',
      couponApplied: appliedCoupon ? coupon._id : null,
      discountApplied: discount,
      // Store Razorpay payment details if applicable
      razorpayPaymentId: paymentMethod === 'razorpay' ? razorpay_payment_id : null,
      razorpayOrderId: paymentMethod === 'razorpay' ? razorpay_order_id : null,
      razorpaySignature: paymentMethod === 'razorpay' ? razorpay_signature : null,
    });

    // Save the order before using it in wallet transactions
    await newOrder.save();

    const orderIdCode = newOrder._id.toString().slice(-5);
    newOrder.orderId = orderIdCode;
    await newOrder.save();

    // Wallet payment logic
    if (paymentMethod === 'Wallet') {
      const wallet = await Wallet.findOne({ userID: user._id });
      // console.log(wallet)
      // if (!wallet || wallet.balance < cart.payablePrice) {
      //   return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
      // }

      wallet.balance -= cart.payablePrice;
      console.log("done")
      wallet.transaction.push({
        walletAmount: cart.payablePrice,
        orderId: newOrder.orderId, 
        transactionType: 'Debited',
        transactionDescription:"Order Placed",
        transactionDate: new Date(),
      });
      console.log("veendeum")

      await wallet.save();
    }

    // Verify Razorpay payment if applicable
    // if (paymentMethod === 'razorpay') {
      
    //   const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
    //   hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    //   const generated_signature = hmac.digest('hex');

    //   if (generated_signature !== razorpay_signature) {
    //     return res.status(400).json({ success: false, message: 'Payment verification failed' });
    //   }
    // }

    // Update product stock
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product.productQuantity < item.productCount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.productName}`,
        });
      }
      product.productQuantity -= item.productCount;
      await product.save();
    }

    await Cart.findByIdAndDelete(cartId);

    res.json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    console.error(error); 
    // res.status(500).json({ success: false, message: 'Order processing failed', error: error.message });
    next(error)
   }
};




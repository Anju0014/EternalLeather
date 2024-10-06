 
 import Category from '../../model/categoryModel.mjs'
 import User from '../../model/userModel.mjs'
 import Product from '../../model/productModel.mjs'
 import Cart from '../../model/cartModel.mjs'
 import Order from '../../model/orderModel.mjs'
 import Coupon from '../../model/couponModel.mjs'
 import Wallet from '../../model/walletModel.mjs'
 
 
 
 export const cartdata= async (req,res)=>{
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
}

// export const cartdata = async (req, res) => {
//     try {
//         const sessionuser = req.session.isUser;
//         console.log(req.session.isUser)
//         const user = await User.findOne({ email: req.session.isUser });
//         const userid= user._id
//         const cart = await Cart.findOne({ userId: userid});

//         if (!cart) {
//             return res.status(404).json({ message: "Cart not found" });
//         }

//         res.render('usercartview', {
//             sessionuser,
//             products: cart.items,
//             payablePrice: cart.payablePrice // Only access this if cart exists
//         });
//     } catch (error) {
//         console.log(`Error fetching cart data: ${error}`);
//         res.status(500).send("Internal Server Error");
//     }
// };


// export const cartview = async (req, res) => {
//     if (!req.session.user) {
//         req.flash('error', "User is Not Found , Please Login Again"  )
//         return res.redirect('/login');
//     }
//     try {

//         const user=await User.findOne({email:req.session.isUser})
//         const cart = await Cart.findOne({ userId:user._id }).populate('items.productId')
//         let totalPrice = 0;
//         let totalPriceWithoutDiscount=0;
//         let  cartItemCount = 0;
//         if (cart) {
//             cart.items.forEach((item) => {
//                 if (item.productId.discountPrice === 0) {
//                     totalPrice += (item.productId.productPrice * item.productCount);
//                     totalPriceWithoutDiscount += (item.productId.productPrice * item.productCount);
//                 }
//                 else {
//                     const pricewithdiscount = (item.productId.productPrice - ((item.productId.discountPrice / 100) * (item.productId.productPrice)) * item.productCount
//                     totalPrice += pricewithdiscount;
//                     totalPriceWithoutDiscount += (item.productId.productPrice * item.productCount)
//                 }
//                 cartItemCount += item.productCount
//             })
//             if (cart.payableAmount != totalPrice || cart.totalPrice != totalPriceWithoutDiscount) {
//                 cart.payableAmount = Math.round(totalPrice);
//                 cart.totalPrice = Math.round(totalPriceWithoutDiscount);
//             }
//             if(cart.payableAmount < 1000){
//                 cart.payableAmount = cart.payableAmount + 50
//             }
//             await cart.save();
//         }
//         res.render('user/cart', { totalPrice, cartItemCount, totalPriceWithOutDiscount, alertMessage: req.flash('error'), user: req.session.user })
//     } catch (err) {
//         console.log(`error rendering in the cart ${err}`)
//     }
// }






// export const cartview = async (req, res) => {
//     if (!req.session.isUser) {
//         req.flash('error', "User is Not Found, Please Login Again");
//         return res.redirect('/login');
//     }

//     try {
//         const user = await User.findOne({ email: req.session.isUser });
//         const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');
        
//         let totalPrice = 0;
//         let totalPriceWithoutDiscount = 0;
//         let cartItemCount = 0;

//         if (cart) {
//             cart.items.forEach((item) => {
//                 if (!item.productId.discountPrice) {
//                     totalPrice += item.productId.productPrice * item.productCount;
//                     totalPriceWithoutDiscount += item.productId.productPrice * item.productCount;
//                 } else {
//                     const priceWithDiscount = item.productId.productPrice * item.productCount * (1 - item.productId.discountPrice / 100);
//                     totalPrice += priceWithDiscount;
//                     totalPriceWithoutDiscount += item.productId.productPrice * item.productCount;
//                 }
//                 cartItemCount += item.productCount;
//             });

//             if (Math.round(cart.payableAmount) !== Math.round(totalPrice) || Math.round(cart.totalPrice) !== Math.round(totalPriceWithoutDiscount)) {
//                 cart.payableAmount = Math.round(totalPrice);
//                 cart.totalPrice = Math.round(totalPriceWithoutDiscount);
//             }

//             if (cart.payableAmount < 1000) {
//                 cart.payableAmount += 50; // Add shipping charge
//             }

//             await cart.save();
//         }

//         res.render('usercartview', { 
     
//             cart, 
//             totalPrice, 
//             cartItemCount, 
//             totalPriceWithoutDiscount, 
//             sessionuser: req.session.isUser 
//         });

//     } catch (err) {
//         console.log(`Error rendering the cart: ${err}`);
//         res.status(500).send('Internal Server Error');
//     }
// };

// export const addToCart = async (req, res) => {
//     try {
//         const productId = req.params.id;
//         const user = await User.findOne({email:req.session.user});
//         const userId=user._id
//         const productPrice = parseInt(req.query.price);
//         const productQuantity = 1;
//         const ProductDetails = await productSchema.findById(productId);
//         if (ProductDetails.productQuantity <=0) {
//             return res.status(404).json({ error: "Product is out of stock" })
//         }
//         const checkCart = await cartSchema.findOne({ userId: userId }).populate('items.productId');
//         if (checkCart) {
//             let productExist = false;
//             checkCart.items.forEach((item) => {
//                 if (item.productId.id === productId) {
//                     productExist = true;
//                     return res.status(404).json({ error: "Product is already in the cart" })
//                 }
//             });
//             if (!productExist) {
//                 checkCart.items.push({ productId: ProductDetails._id, productCount: 1, productPrice: productPrice });
//             }
//             await checkCart.save();
//         }
//         else {
//             const newCart = new cartSchema({
//                 userId: userId,
//                 items: [{ productId: ProductDetails._id, productCount: 1, productPrice: productPrice }]
//             });
//             await newCart.save();
//         }
//         return res.status(200).json({ message: "Product added to cart" })    }
//     catch (err) {
//         console.log(`Error during adding product to cart: ${err}`);
//     }
// }



// export const cartview = async (req, res) => {

//   //  try{
//     console.log("hai")
//     console.log(req.body)
//     const { productId, quantity} = req.body;  // Extract productId and quantity from the request body

//     if (!productId) {
//         return res.status(400).json({ message: 'Product ID is required' });
//     }

//     // Check if user is logged in (using session or JWT)
//     if (req.session && req.session.isUser) {
//         try {
//             console.log("wonder")
//             const user = await User.findOne({ email: req.session.isUser });
//             const userId=user._id;
//             console.log(userId)
//             const productDetails=await productSchema.findById(productId);
//              if(productDetails.productQuantity<=0){    
//                return res.status(404).json({message:"Productis out of Stock"})
//              }
//             const userCart = await Cart.findOne({ userId: user._id }).populate('items.productId');
//             console.log("hhe")
//             console.log(userCart)
//             if(userCart){
//                 const existingItem = userCart.items.find(item => item.productId.toString() === productId);
//                 if (existingItem) {
//                     // Update quantity if item already exists
//                     existingItem.productCount+= productCount;
//                 } else {
//                     // Add new item to the cart
//                     userCart.items.push({productId,productCount:1,productPrice:productDetails.productPrice, discountPrice:productDetails.discountPrice});
//                 }
                
//                 await userCart.save();
          
//             // Add product to the cart or update quantity logic here
            
//             return res.status(200).json({ message: 'Product added to cart' });}
//             else{
//                const newCart= new Cart({
//                 userId:userId,
//                 items:[{productId:productDetails._id, productCount:1,productPrice:productDetails.productPrice, discountPrice:productDetails.discountPrice}]
//                })
//                 await newCart.save();
//                 return res.status(200).json({ message: 'Product added to cart' });
//             }
           
            
//         } catch (error) {
//             return res.status(500).json({ message: 'Error adding product to cart' });
//         }
//     } else {
//         console.log("display")
//         return res.status(401).json({ message: 'Please log in to add products to the cart' });
//     }
// // }catch(error){
// //     console.log(error)
// //}
// };


// export const cartview = async (req, res) => {
//     try {
//       console.log("hai");
//       console.log(req.body);
//       const { productId, quantity=1 } = req.body;  // Default quantity to 1 if not provided
  
//       if (!productId) {
//         return res.status(400).json({ message: 'Product ID is required' });
//       }
  
//       // Check if user is logged in (using session or JWT)
//       if (req.session && req.session.isUser) {
//         try {
//           console.log("wonder");
//           const user = await User.findOne({ email: req.session.isUser });
//           const userId = user._id;
//           console.log(userId);
  
//           const productDetails = await Product.findById(productId);
//           if (!productDetails || productDetails.productQuantity <= 0) {
//             return res.status(404).json({ message: "Product is out of stock" });
//           }
  
//           let userCart = await Cart.findOne({ userId: user._id }).populate('items.productId');
//           console.log("hhe");
//           console.log(userCart);
  
//           if (userCart) {
//             const existingItem = userCart.items.find(item => item.productId.toString() === String(productId));
//             if (existingItem) {
//               // Update quantity if item already exists
//               existingItem.productCount += quantity;
//             } else {
//               // Add new item to the cart
//               userCart.items.push({
//                 productId,
//                 productCount: quantity,
//                 productPrice: productDetails.productPrice,
//                 discountPrice: productDetails.discountPrice
//               });
//             }
  
//             await userCart.save();
  
//             // Return success message
//             return res.status(200).json({ message: 'Product added to cart' });
//           } else {
//             // Create new cart if user doesn't have one
//             const newCart = new Cart({
//               userId: userId,
//               items: [{
//                 productId: productDetails._id,
//                 productCount: quantity,
//                 productPrice: productDetails.productPrice,
//                 discountPrice: productDetails.discountPrice
//               }]
//             });
  
//             await newCart.save();
//             return res.status(200).json({ message: 'Product added to cart' });
//           }
  
//         } catch (error) {
//           console.error("Error adding product to cart:", error);
//           return res.status(500).json({ message: 'Error adding product to cart' });
//         }
//       } else {
//         console.log("display");
//         return res.status(401).json({ message: 'Please log in to add products to the cart' });
//       }
//     } catch (error) {
//       console.error("Unexpected error:", error);
//       return res.status(500).json({ message: 'Unexpected error occurred' });
//     }
//   };
  

export const cartview = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;  // Default quantity to 1 if not provided

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if user is logged in (using session or JWT)
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

          // Save the updated cart
          await userCart.save();

          return res.status(200).json({ message: 'Product added to cart' });

        } else {
          // If no cart exists for the user, create a new one
          const newCart = new Cart({
            userId: user._id,
            items: [{
              productId: productDetails._id,
              productCount: quantity,
              productPrice: productDetails.productPrice,
              discountPrice: discountPrice,
            }]
          });

          // Save the new cart
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
    return res.status(500).json({ message: 'Unexpected error occurred' });
  }
};





// Increment item quantity in the cart
export const cartincrement= async (req, res) => {
  try {
      const productId = req.params.productId;
      const user = await User.findOne({ email: req.session.isUser });
      
      if (!user) {
          return res.status(401).json({ message: 'Please log in to update the cart.' });
      }

      // Find the cart and increment the quantity of the item
      const cart = await Cart.findOneAndUpdate(
          { userId: user._id, 'items.productId': productId },
          { $inc: { 'items.$.productCount': 1 } },  // Increment the quantity by 1
          { new: true }
      ).populate('items.productId');  // Populate the product details

      if (!cart) {
          return res.status(404).json({ message: 'Cart not found or item does not exist' });
      }

      // Recalculate total prices
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

      // Save updated cart
      await cart.save();

      res.status(200).json({ message: 'Quantity incremented', cart });

  } catch (error) {
      console.error('Error incrementing quantity:', error);
      res.status(500).json({ message: 'Error incrementing quantity' });
  }
};

// Decrement item quantity in the cart
export const cartdecrement= async (req, res) => {
  try {
      const productId = req.params.productId;
      const user = await User.findOne({ email: req.session.isUser });

      if (!user) {
          return res.status(401).json({ message: 'Please log in to update the cart.' });
      }

      // Find the cart and decrement the quantity of the item
      const cart = await Cart.findOneAndUpdate(
          { userId: user._id, 'items.productId': productId },  // Ensure quantity > 1
          { $inc: { 'items.$.productCount': -1 } },  // Decrement the quantity by 1
          { new: true }
      ).populate('items.productId');

      if (!cart) {
          return res.status(404).json({ message: 'Cart not found or item does not exist' });
      }

      // Recalculate total prices
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

      // Save updated cart
      await cart.save();

      res.status(200).json({ message: 'Quantity decremented', cart });

  } catch (error) {
      console.error('Error decrementing quantity:', error);
      res.status(500).json({ message: 'Error decrementing quantity' });
  }
};




  // export const cartdelete= async (req,res)=>{
  //   const productId= req.query.id;
  //   const user=await User.findOne({email:req.session.isUser})
  //   const cart = await Cart.findOne({ userId:user._id }).populate('items.productId')

  // }
  






// Route to delete an item from the cart
// export const cartdelete= async (req, res) => {
//     try {
//         const productId = req.params.productId;

//         // Check if the user is logged in
//         const user = await User.findOne({ email: req.session.isUser });
//         if (!user) {
//             return res.status(401).json({ message: 'Please log in to delete items from your cart.' });
//         }

//         // Use $pull to remove the item directly from the cart by productId
//         const cart = await Cart.findOneAndUpdate(
//             { userId: user._id },
//             { $pull: { items: { productId: productId } } },  // Removes the item with this productId from the items array
//             { new: true }  // Return the updated cart
//         ).populate('items.productId');  // Optionally, populate the remaining items

//         if (!cart) {
//             return res.status(404).json({ message: 'Cart not found or item does not exist' });
//         }

//         // Recalculate the total price and payable price
//         let totalPrice = 0;
//         let totalPriceWithoutDiscount = 0;

//         cart.items.forEach(item => {
//             const productPrice = item.productId.productPrice || 0;
//             const discount = (item.productId.discountPrice || 0) / 100;
//             const quantity = item.productCount || 0;

//             const priceWithDiscount = (productPrice - (discount * productPrice)) * quantity;
//             totalPrice += priceWithDiscount;
//             totalPriceWithoutDiscount += productPrice * quantity;
//         });

//         cart.payablePrice = Math.round(totalPrice);
//         cart.totalPrice = Math.round(totalPriceWithoutDiscount);

//         // Save the updated cart after recalculation
//         await cart.save();

//         res.status(200).json({ message: 'Item deleted successfully', cart });
//     } catch (error) {
//         console.error("Error deleting item from cart:", error);
//         res.status(500).json({ message: 'Error deleting item from cart' });
//     }
// };



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
        res.status(500).json({ message: 'Error deleting item from cart' });
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
  }
}
 


// // GET Checkout Page
// router.get('/checkout', async (req, res) => {
//     try {
//         // Check if the user is logged in
//         if (!req.session.isUser) {
//             return res.redirect('user/home');  // Redirect to login if not authenticated
//         }

//         // Fetch the user from the session
//         const user = await User.findOne({ email: req.session.isUser });
//         if (!user) {
//             return res.status(401).json({ message: 'User not found, please log in again.' });
//         }

//         // Fetch the saved addresses for the user
//         const addresses = await Address.find({ userId: user._id });
//         if (!addresses || addresses.length === 0) {
//             return res.redirect('/user/addresses');  // Redirect if no addresses found
//         }

//         // Fetch the cart details for the user
//         const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');
//         if (!cart || cart.items.length === 0) {
//             return res.redirect('/cart');  // Redirect to cart if it's empty
//         }

//         // Render the checkout page with addresses and cart details
//         res.render('checkout', {
//             user: req.session.isUser,   // Pass the user info if needed
//             addresses: addresses,       // Send the list of addresses to the view
//             cart: cart,                 // Send the cart details to the view
//             totalPayable: cart.payablePrice
//         });

//     } catch (error) {
//         console.error('Error fetching checkout data:', error);
//         res.status(500).json({ message: 'An error occurred while fetching checkout data' });
//     }
// });

// module.exports = router;





// Handle checkout submission
// router.post('/checkout', async (req, res) => {
//     try {
//         const user = await User.findOne({ email: req.session.isUser });

//         if (!user) {
//             return res.status(401).json({ message: 'Please log in to complete the checkout.' });
//         }

//         const { selectedAddress, paymentMethod } = req.body;

//         // Fetch the cart and address details
//         const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');
//         const address = user.address.findById(selectedAddress);

//         if (!cart || !address) {
//             return res.status(400).json({ message: 'Invalid cart or address selection.' });
//         }

//         // Create a new order
//         const order = new Order({
//             userId: user._id,
//             items: cart.items,
//             shippingAddress: address,
//             paymentMethod: paymentMethod,
//             totalAmount: cart.payablePrice,
//             status: 'Pending'
//         });

//         // Save the order and clear the cart
//         await order.save();
//         await Cart.deleteOne({ userId: user._id });

//         // Handle payment logic here (e.g., redirect to Razorpay payment page if selected)
//         if (paymentMethod === 'razorpay') {
//             // Razorpay integration logic goes here
//         }

//         res.status(200).json({ message: 'Order placed successfully', order });

//     } catch (error) {
//         console.error('Error during checkout:', error);
//         res.status(500).json({ message: 'Error during checkout' });
//     }
// });

export const checkoutpost = async (req, res) => {
  try {
    const { selectedAddress, paymentMethod, cartId, appliedCoupon } = req.body;
    
    console.log(appliedCoupon)
    const user = await User.findOne({ email: req.session.isUser });
    const customerAddress = user.address.id(selectedAddress);
    const cart = await Cart.findById(cartId).populate('items.productId');

    if (!customerAddress) {
      return res.status(400).json({ success: false, message: 'Invalid address selected' });
    }



    // Validate the coupon if applied
    let discount = 0;
    let coupon;
    if (appliedCoupon) {
      coupon = await Coupon.findById(appliedCoupon);
      console.log(coupon)

      if (!coupon || !coupon.isActive || coupon.isDeleted || new Date() > coupon.expiryDate) {
        return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
      }
       

      if (appliedCoupon && coupon) {
        const existingCouponUsage = user.couponsUsed.find(c => c.couponId.equals(coupon._id));

        if (existingCouponUsage) {
            // Check if the user has exceeded the usage limit
            if (existingCouponUsage.usageCount >= coupon.maxUsageCount) {
                return res.status(400).json({
                    success: false,
                    message: `Coupon usage limit exceeded. You can only use this coupon ${coupon.usageLimit} times.`
                });
            }

            // Increment the usage count and update the last used time
            existingCouponUsage.usageCount += 1;
            existingCouponUsage.lastUsed = Date.now();
        } else {
            // Add the coupon to the user's coupon usage array if they haven't used it yet
            user.couponsUsed.push({
                couponId: coupon._id,
                usageCount: 1,
                lastUsed: Date.now()
            });
        }

        // Save the updated user document
        await user.save();
    }
      // Apply coupon discount (percentage or flat discount)
      if (coupon.discountType === 'percentage') {
        discount = (cart.payablePrice * coupon.discountValue) / 100;
      } else if (coupon.discountType === 'flat') {
        discount = coupon.discountValue;
      }

      // Ensure that the total price is not less than zero after applying the discount
      cart.payablePrice = Math.max(0, cart.payablePrice - discount);
    }

    if (paymentMethod === 'Wallet') {
      const wallet = await Wallet.findOne({ userID: user._id });
      if (!wallet || wallet.balance < cart.payablePrice) {
          return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
      }

      // Deduct the wallet balance
      wallet.balance -= cart.payablePrice;

      // Add transaction record
      wallet.transaction.push({
          walletAmount: cart.payablePrice,
          orderId: newOrder._id,
          transactionType: 'Debited',
          transactionDate: new Date(),
      });

      await wallet.save();
  }


    // Create a new order
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
      paymentMethod: paymentMethod,
      orderStatus: 'Pending',
      couponApplied: appliedCoupon ? coupon._id : null,
      discountApplied: discount
    });

    // Save order and generate a short order ID
    await newOrder.save();
    const orderIdCode = newOrder._id.toString().slice(-5); // Last 5 characters of the order id
    newOrder.orderId = orderIdCode;
    await newOrder.save();

    // Update product stock
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

    // Clear the user's cart after successful order placement
    await Cart.findByIdAndDelete(cartId);

    res.json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};





// export const checkoutpost= async (req,res)=>{

//     try {
//     const { selectedAddress, paymentMethod, cartId } = req.body;
//     console.log(selectedAddress)
//     console.log(paymentMethod)
//     const user = await User.findOne({email:req.session.isUser});
//     const customerAddress = user.address.id(selectedAddress);
//     const cart = await Cart.findById(req.body.cartId).populate('items.productId');
//         if (!customerAddress) {
//             return res.status(400).json({ success: false, message: 'Invalid address selected' });
//         }
//         const newOrder = new Order({
//             customerId: user._id,  
//             //orderId: Math.floor(Math.random() * 1000000),
//             products: cart.items.map(item => ({
//               productId: item.productId._id,
//               productname: item.productId.productName,
//               productquantity: item.productCount,
//               productprice: item.discountPrice,
//               productimage: item.productId.productImages[0],
//               productstatus: 'Pending'
//           })),
//           totalQuantity: cart.items.reduce((acc, item) => acc + item.productCount, 0),
//          totalPrice: cart.items.reduce((acc, item) => acc + item.productPrice * item.productCount, 0),
//           //totalPrice:cart.totalPrice,
//           totalPayablePrice: cart.payablePrice,
//             // totalQuantity: totalQuantity,
//             // totalPrice: totalPrice,
//             address: {
//                 customerName: customerAddress.contactname,
//                 customerEmail: customerAddress.email,  
//                 building: customerAddress.building,
//                 street: customerAddress.street,
//                 city: customerAddress.city,
//                 country: customerAddress.country,
//                 pincode: customerAddress.pincode,
//                 phonenumber: customerAddress.phoneno,
//                 landMark: customerAddress.landMark
//             },
//             paymentMethod: paymentMethod,
//             orderStatus: 'Pending'
//         });

     
//         await newOrder.save();
//         const orderIdCode = newOrder._id.toString().slice(-5); // Last 5 characters of the order id

        
//         newOrder.orderId = orderIdCode;
//         await newOrder.save();
        
//         for (const item of cart.items) {
//           const product = await Product.findById(item.productId);

         
//           if (product.productQuantity < item.productCount) {
//               return res.status(400).json({
//                   success: false,
//                   message: `Insufficient stock for product: ${product.name}`
//               });
//           }

         
//           product.productQuantity -= item.productCount;

        
//           await product.save();
//       }

//       await Cart.findByIdAndDelete(req.body.cartId);

      
//         res.json({ success: true, message: 'Order placed successfully' });
//     } catch (error) {
//         console.error('Error placing order:', error);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// }


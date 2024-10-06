import User from '../../model/userModel.mjs'
import Product from '../../model/productModel.mjs'
import Category from '../../model/categoryModel.mjs'

import WishList from '../../model/wishlistModel.mjs'
import Order from '../../model/orderModel.mjs'


export const wishListView= async (req,res)=>{
    try{

    if (!req.session.isUser) {
        req.flash('error', "User is Not Found , Please Login "  )
        return res.redirect('/user/home');
    }

    const productCollection = await Category.find({ isActive: true });
    const user=await User.findOne({email:req.session.isUser})
    console.log("reached")
    const wishList = await WishList.findOne({ userId:user._id }).populate('items.productId')
    console.log(wishList)
    console.log("wowww.....")
   
    res.render('userWishList', { 
    
        wishList, 
        productCollection, 
        sessionuser: req.session.isUser, 
        query:req.query
    });
}
catch(error){
    console.log(error)
}
}




export const wishListAdd = async (req, res) => {
    try {
      const { productId} = req.body;  // Default quantity to 1 if not provided
    console.log("ethi");
    
      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }
  
      // Check if user is logged in (using session or JWT)
      if (req.session && req.session.isUser) {
        try {
          const user = await User.findOne({ email: req.session.isUser });

          if (!user) {
            console.log("not here");
            
            return res.status(401).json({ message: 'User not found' });
          }
  
          const productDetails = await Product.findById(productId);
          if (!productDetails) {
            return res.status(404).json({ message: 'Product is out of stock' });
          }
          const discountPrice= productDetails.productPrice-((productDetails.productDiscount*productDetails.productPrice)/100)
          
          let userWishList = await WishList.findOne({ userId: user._id }).populate('items.productId');
  
          if (userWishList) {
            
            const existingItem = userWishList.items.find(item => item.productId.equals(productId));
  
            if (existingItem) {
              
                return res.status(200).json({ message: 'Product is already added to WishList' });
  
            } else {
              
              userWishList.items.push({
                productId,
                productPrice: productDetails.productPrice,
                discountPrice: discountPrice,
              });
            }
  
            // Save the updated cart
            await userWishList.save();
  
            return res.status(200).json({ message: 'Product added to WishList' });
  
          } else {
            // If no cart exists for the user, create a new one
            const newWishList = new WishList({
              userId: user._id,
              items: [{
                productId: productDetails._id,
                productPrice: productDetails.productPrice,
                discountPrice: discountPrice,
              }]
            });
  
            // Save the new cart
            await newWishList.save();
  
            return res.status(200).json({ message: 'Product added to WishList' });
          }
  
        } catch (error) {
          console.error('Error adding product to WishList:', error);
          return res.status(500).json({ message: 'Error adding product to WishList' });
        }
      } else {
        console.log("sending msg")
        return res.status(401).json({ message: 'Please log in to add products to the WishList' });
      }
  
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ message: 'Unexpected error occurred' });
    }
  };
  
  export const wishListDelete= async (req, res) => {
    try {
        const productId = req.params.productId;

      
        const user = await User.findOne({ email: req.session.isUser });
        if (!user) {
            return res.status(401).json({ message: 'Please log in to delete items from your cart.' });
        }

     
        const wishList = await WishList.findOneAndUpdate(
            { userId: user._id },
            { $pull: { items: { productId: productId } } },  
            { new: true }  
        ).populate('items.productId');  

        if (!wishList) {
            return res.status(404).json({ message: 'WishList not found or item does not exist' });
        }

        
        
        await wishList.save();

        res.status(200).json({ message: 'Item deleted successfully', wishList });
    } catch (error) {
        console.error("Error deleting item from wishList:", error);
        res.status(500).json({ message: 'Error deleting item from wishList' });
    }
};




// export const wishCartAdd = async (req, res) => {
//     try {
//       const { productId, quantity = 1 } = req.body;  // Default quantity to 1 if not provided
      

     
//       if (!productId) {
//         return res.status(400).json({ message: 'Product ID is required' });
//       }
  
//       // Check if user is logged in (using session or JWT)
//       if (req.session && req.session.isUser) {
//         try {
//           const user = await User.findOne({ email: req.session.isUser });
//           if (!user) {
//             return res.status(401).json({ message: 'User not found' });
//           }
//           const wishList = await WishList.findOne({ userId:user._id }).populate('items.productId')
//           const Cart= await Cart.findOne({ userId:user._id }).populate('items.productId')
//           wishList.items.productId.forEach(productId){
                      
//           }
//         //   const productDetails = await Product.findById(productId);
//         //   if (!productDetails || productDetails.productQuantity <= 0) {
//         //     return res.status(404).json({ message: 'Product is out of stock' });
//         //   }

//           const discountPrice= productDetails.productPrice-((productDetails.productDiscount*productDetails.productPrice)/100)
          
//           let userCart = await Cart.findOne({ userId: user._id }).populate('items.productId');
  
//           if (userCart) {
            
//             const existingItem = userCart.items.find(item => item.productId.equals(productId));
  
//             if (existingItem) {
              
//               existingItem.productCount += quantity;
  
//             } else {
              
//               userCart.items.push({
//                 productId,
//                 productCount: quantity,
//                 productPrice: productDetails.productPrice,
//                 discountPrice: discountPrice,
//               });
//             }
  
//             // Save the updated cart
//             await userCart.save();
  
//             return res.status(200).json({ message: 'Product added to cart' });
  
//           } else {
//             // If no cart exists for the user, create a new one
//             const newCart = new Cart({
//               userId: user._id,
//               items: [{
//                 productId: productDetails._id,
//                 productCount: quantity,
//                 productPrice: productDetails.productPrice,
//                 discountPrice: discountPrice,
//               }]
//             });
  
//             // Save the new cart
//             await newCart.save();
  
//             return res.status(200).json({ message: 'Product added to cart' });
//           }
  
//         } catch (error) {
//           console.error('Error adding product to cart:', error);
//           return res.status(500).json({ message: 'Error adding product to cart' });
//         }
//       } else {
//         return res.status(401).json({ message: 'Please log in to add products to the cart' });
//       }
  
//     } catch (error) {
//       console.error('Unexpected error:', error);
//       return res.status(500).json({ message: 'Unexpected error occurred' });
//     }
//   };
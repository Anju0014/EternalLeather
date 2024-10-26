import express from "express";
import {  checkOtpForgot, emailpasswordchange, passwordchange, passwordnew, resendOtp, useremail, userforgotresendOtp, userhome, userlanding, userlogin, userlogout, userregister, usersearch, usersignup, userverify, verifyOtp, } from "../controllers/userController/userController.mjs";
import { googleauth, googleAuthCallback } from "../controllers/userController/userauthController.mjs";
import isUser from "../middleware/userSession.mjs";
import { userproductdetail, userproductview } from "../controllers/userController/productdetail.mjs";
import { cartdata, cartdecrement, cartdelete, cartincrement, cartview, checkout, checkoutpost } from "../controllers/userController/cartController.mjs";
import { addressAdd, changePasswordUser2, editAddress, useraddressdelete, useraddressedit, userchangepassword, userdata, useredit } from "../controllers/userController/profileController.mjs";
import { orderconfirm } from "../controllers/userController/orderController.mjs";
import checkUser from "../middleware/checkuserSession.mjs";
import nocache from "nocache";
import { orderList, userorderCancel, userorderReturn, userProductCancel, userProductReturn } from "../controllers/userController/orderListController.mjs";
import { wishListAdd, wishListDelete, wishListView } from "../controllers/userController/wishlistController.mjs";
import { couponList } from "../controllers/userController/couponController.mjs";
import { checkWalletBalance, walletView } from "../controllers/userController/walletController.mjs";
import { paymentRender, paymentRetryStatus, paymentVerify, userPaymentRetry } from "../controllers/userController/checkOutController.mjs";

const user_router=express();



// user_router.use(express.json());
// user_router.use(express.urlencoded({extended:true}));
 user_router.set('view engine','ejs');
user_router.set('views','./views/user');
// user_router.use(express.static('public'));


user_router.get('/',userlanding)

user_router.get('/user/login',userlogin);
user_router.post('/user/login',userverify);
// user_router.get('/user/forgotpassword',useremail);
// user_router.post('/user/forgotpassword',passwordchange);


user_router.get('/user/forgotpassword',useremail);
user_router.post('/user/forgotpassword',emailpasswordchange);
user_router.post('/user/otpforgotpassword', checkOtpForgot)
user_router.post('/user/resendforgotOtp',userforgotresendOtp)



user_router.post('/user/renewpassword',passwordnew)

user_router.get('/user/signup',usersignup);
user_router.post('/user/signup',userregister);

user_router.post('/user/otpverify',verifyOtp);
user_router.post('/user/resendOtp',resendOtp);

user_router.get('/user/home',userhome);
user_router.get('/user/productdetail/:id',userproductdetail)
user_router.get('/user/allproducts',userproductview)
user_router.post('/user/search',usersearch)
user_router.get('/user/profile',checkUser,userdata)
user_router.post('/user/profile/edit',checkUser,useredit)
user_router.post('/user/profile/changepassword',userchangepassword)
user_router.post('/user/profile/address/add',checkUser,addressAdd)
user_router.get('/user/profile/address/edit',checkUser,useraddressedit)
user_router.post('/user/profile/address/edit',checkUser,editAddress)
user_router.get('/user/profile/address/delete',checkUser,useraddressdelete)

user_router.get('/user/addtocart',checkUser,cartdata)
user_router.post('/user/addtocart/',checkUser,cartview)
user_router.post('/user/addtocart/delete/:productId',checkUser,cartdelete)
user_router.post('/user/cart/increment/:productId',checkUser,cartincrement)
user_router.post('/user/cart/decrement/:productId',checkUser,cartdecrement)
user_router.get('/user/checkout',checkUser,checkout)
user_router.post('/user/checkout',checkUser,checkoutpost)
user_router.get('/user/order/summary',checkUser,orderconfirm)
user_router.get('/user/profile/order',checkUser,orderList)
user_router.get('/user/order/cancel',checkUser,userorderCancel)
user_router.post('/user/order/return',checkUser,userorderReturn)
user_router.post('/user/order/cancelProduct',userProductCancel);
user_router.post('/user/order/returnProduct',userProductReturn);

user_router.get('/user/profile/changePassword',checkUser,changePasswordUser2)
user_router.get('/user/profile/coupons',checkUser,couponList)
user_router.get('/user/profile/wallet',checkUser,walletView)
user_router.post('/user/wallet',checkUser,checkWalletBalance)
user_router.post('/user/razorPayOrder',checkUser,paymentRender)
user_router.post('/user/verifyPayment',checkUser,paymentVerify)
user_router.post('/user/retryPayment',userPaymentRetry);
user_router.put('/user/paymentRetryStatus',paymentRetryStatus)
user_router.get('/user/wishList',checkUser,wishListView)
user_router.post('/user/addToWishList',checkUser,wishListAdd)
user_router.post('/user/wishList/delete/:productId',checkUser,wishListDelete)

// user_router.get('/user/cartWish',checkUser,wishCartAdd)




user_router.get('/auth/google',googleauth);

user_router.get('/auth/google/callback',googleAuthCallback)
user_router.get('/user/logout',userlogout)


export default user_router
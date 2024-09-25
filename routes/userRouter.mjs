import express from "express";
import {  passwordchange, passwordnew, resendOtp, useremail, userhome, userlanding, userlogin, userlogout, userregister, usersignup, userverify, verifyOtp, } from "../controllers/userController/userController.mjs";
import { googleauth, googleAuthCallback } from "../controllers/userController/userauthController.mjs";
import isUser from "../middleware/userSession.mjs";
import { userproductdetail, userproductview } from "../controllers/userController/productdetail.mjs";
import { cartdata, cartdecrement, cartdelete, cartincrement, cartview, checkout, checkoutpost } from "../controllers/userController/cartController.mjs";
import { addressAdd, editAddress, useraddressdelete, useraddressedit, userdata } from "../controllers/userController/profileController.mjs";
import { orderconfirm } from "../controllers/userController/orderController.mjs";

const user_router=express();



user_router.use(express.json());
user_router.use(express.urlencoded({extended:true}));
user_router.set('view engine','ejs');
user_router.set('views','./views/user');
user_router.use(express.static('public'));


user_router.get('/',userlanding)

user_router.get('/user/login',userlogin);
user_router.post('/user/login',userverify);
user_router.get('/user/forgotpassword',useremail);
user_router.post('/user/forgotpassword',passwordchange);


user_router.post('/user/renewpassword',passwordnew)

user_router.get('/user/signup',usersignup);
user_router.post('/user/signup',userregister);

user_router.post('/user/otpverify',verifyOtp);
user_router.post('/user/resendOtp',resendOtp);

user_router.get('/user/home',userhome);
user_router.get('/user/productdetail/:id',userproductdetail)
user_router.get('/user/allproducts',userproductview)
user_router.get('/user/profile',userdata)
user_router.post('/user/profile/address/add',addressAdd)
user_router.get('/user/profile/address/edit',useraddressedit)
user_router.post('/user/profile/address/edit',editAddress)
user_router.get('/user/profile/address/delete',useraddressdelete)

user_router.get('/user/addtocart',cartdata)
user_router.post('/user/addtocart/',cartview)
user_router.post('/user/addtocart/delete/:productId',cartdelete)
user_router.post('/user/cart/increment/:productId',cartincrement)
user_router.post('/user/cart/decrement/:productId',cartdecrement)
user_router.get('/user/checkout',checkout)
user_router.post('/user/checkout',checkoutpost)
user_router.get('/user/order/summary',orderconfirm)


user_router.get('/auth/google',googleauth);

user_router.get('/auth/google/callback',googleAuthCallback)
user_router.get('/user/logout',userlogout)


export default user_router
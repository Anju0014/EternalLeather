import express from "express";
import {  passwordchange, passwordnew, resendOtp, useremail, userhome, userlanding, userlogin, userlogout, userregister, usersearch, usersignup, userverify, verifyOtp, } from "../controllers/userController/userController.mjs";
import { googleauth, googleAuthCallback } from "../controllers/userController/userauthController.mjs";
import isUser from "../middleware/userSession.mjs";
import { userproductdetail, userproductview } from "../controllers/userController/productdetail.mjs";
import { cartdata, cartdecrement, cartdelete, cartincrement, cartview, checkout, checkoutpost } from "../controllers/userController/cartController.mjs";
import { addressAdd, editAddress, useraddressdelete, useraddressedit, userchangepassword, userdata, useredit } from "../controllers/userController/profileController.mjs";
import { orderconfirm } from "../controllers/userController/orderController.mjs";
import checkUser from "../middleware/checkuserSession.mjs";
import nocache from "nocache";
import { orderList, userorderCancel, userorderReturn } from "../controllers/userController/orderListController.mjs";

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



user_router.get('/auth/google',googleauth);

user_router.get('/auth/google/callback',googleAuthCallback)
user_router.get('/user/logout',userlogout)


export default user_router
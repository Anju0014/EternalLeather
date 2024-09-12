import express from "express";
import {  nouser, passwordchange, passwordnew, resendOtp, useremail, userhome, userlogin, userlogout, userregister, usersignup, userverify, verifyOtp, } from "../controllers/userController/userController.mjs";
import { googleauth, googleAuthCallback } from "../controllers/userController/userauthController.mjs";
import isUser from "../middleware/userSession.mjs";
import { userproductdetail } from "../controllers/userController/productdetail.mjs";

const user_router=express();



user_router.use(express.json());
user_router.use(express.urlencoded({extended:true}));
user_router.set('view engine','ejs');
user_router.set('views','./views/user');
user_router.use(express.static('public'));


user_router.get('/',nouser)

user_router.get('/user/login',userlogin);
user_router.post('/user/login',userverify);
user_router.get('/user/forgotpassword',useremail);
user_router.post('/user/forgotpassword',passwordchange);

user_router.post('/user/renewpassword',passwordnew)

user_router.get('/user/signup',usersignup);
user_router.post('/user/signup',userregister);

user_router.post('/user/otpverify',verifyOtp);
user_router.post('/user/resendOtp',resendOtp);

user_router.get('/user/home',isUser,userhome);
user_router.get('/user/productdetail/:id',isUser,userproductdetail)
user_router.get('/auth/google',googleauth);

user_router.get('/auth/google/callback',googleAuthCallback)
user_router.get('/user/logout',userlogout)


export default user_router
import express from "express";
import {  passwordchange, passwordnew, useremail, userhome, userlogin, userregister, usersignup, userverify, verifyOtp } from "../controllers/userController/userController.mjs";
import { googleauth, googleAuthCallback } from "../controllers/userController/userauthController.mjs";

const user_router=express();



user_router.use(express.json());
user_router.use(express.urlencoded({extended:true}));
user_router.set('view engine','ejs');
user_router.set('views','./views/user');
user_router.use(express.static('public'));


//user_router.get('/',nouser)

user_router.get('/user/login',userlogin);
user_router.post('/user/login',userverify);
user_router.get('/user/forgotpassword',useremail);
user_router.post('/user/forgotpassword',passwordchange);

user_router.post('/user/renewpassword',passwordnew)

user_router.get('/user/signup',usersignup);
user_router.post('/user/signup',userregister);


user_router.post('/user/otpverify',verifyOtp)

user_router.get('/user/home',userhome);
user_router.get('/auth/google',googleauth);
user_router.get('/auth/google/callback',googleAuthCallback)



export default user_router
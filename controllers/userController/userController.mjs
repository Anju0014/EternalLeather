import User from "../../model/userModel.mjs";
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import crypto from 'crypto'
import Product from "../../model/productModel.mjs"
import Category from"../../model/categoryModel.mjs"

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'eternalleather09@gmail.com', // Your email
        pass: 'efsq yiti dhcb ellq',  // Your email password
    },
});



const securePassword = async(password)=>{
    try{

        const passwordHash=await bcrypt.hash(password,10);
        return passwordHash;

    }catch(error){
        console.log(error.message)

    }
}

export const nouser=async(req,res)=>{
    if(!req.session.isUser){
    res.render('landingpage')}
    else{
        res.redirect('/user/home')
    }
}


export const user=async(req,res)=>{
    try{  
        res.redirect('/user/login')
    }catch(error){
        console.log(`error from user ${error}`);
    }
}

export const userlogin=async(req,res)=>{
    try{  
        if(req.session.isUser){
            res.redirect('/user/home')
       }
        else{
            res.render('userlogin', { message: req.flash() })
        }
    }catch(error){
        console.log(`error from user login ${error}`);
    }
}

export const useremail=async(req,res)=>{
    try{ 
        res.render('useremail')
    }catch(error){
        console.log(`error from user forgot password email ${error}`);
    }
}
export const passwordchange=async(req,res)=>{
    try{
        const email= req.body.email;
        res.render('forgotpassword',{user:email})
    }
    catch(error){
        console.log(`error from user forgot password ${error}`)
    }

}
export const passwordnew= async(req,res)=>{
    try{
        const remail=req.body.email;
        console.log(remail)
        console.log(req.body.password);
      const snewpassword= await securePassword(req.body.password)
        const userExist= await User.findOne({email:remail})
        console.log(userExist)
        if(!userExist){
            req.flash("error", "Invalid Email");
            console.log(1)
            res.redirect('/user/login')
        }else{
            userExist.password=snewpassword;
            console.log(2)
            await userExist.save();
            res.redirect('/user/login')
        }

    }catch(error){

    }

}

export const usersignup=async(req,res)=>{
    try{
        if(req.session.isUser){
          redirect('/user/home')
        }else{
          res.render('usersign',{ message: req.flash() })
        }
    }catch(error){
        console.log(`error from user signup ${error}`)
    }
}

export const userregister=async(req,res)=>{
    try{
        const spassword= await securePassword(req.body.password)
        const exemail=req.body.email
        const userExist=await User.findOne({email:exemail});
        if(userExist){
            req.flash("error", "User Already Exists");
            console.log(1)
            res.redirect('/user/signup')
        }else{

          
            //user.otpExpires = Date.now() + 3600000; // OTP valid for 1 hour

          const user=new User({
            name:req.body.name,
            email:req.body.email,
            password:spassword,
            phoneno:req.body.phoneno
          })
        
          console.log(2)
          const otp = crypto.randomInt(100000, 999999).toString();
          user.otp = otp;
          console.log(2)
       
          const savedUser=await user.save();  

          console.log(3)
          if(savedUser){
            const mailOptions = {
                from: 'eternalleather09@gmail.com',
                to: user.email,
                subject: 'Email Verification',
                text: `Your OTP is ${otp}`,
            };
        console.log(4)
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('OTP sent: ' + info.response);
            });
        console.log(5)
          
            res.render('userotpverify',{user:user._id})

          
          }
          else{
            req.flash("error", "Registration Failed");
            res.redirect('/user/signup')
          }
        }
    }catch(error){
        console.log(`error from user signup registration ${error}`)
    }
}




export const verifyOtp = async (req, res) => {
    const { userId, otp } = req.body;
    console.log(otp);
    const user = await User.findById(userId);
    console.log(user)


    console.log(user.otp)
    console.log(otp)
    if (user.otp != otp) {
        req.flash("error", "Invalid or expired OTP");
        res.redirect('/user/signup',);
    }else{

    user.isVerified = true;
    user.otp = undefined;
    //user.otpExpires = undefined;
    await user.save();
    
    res.redirect('/user/login'); }
    
};


export const userverify=async(req,res)=>{
    try{
          const email=req.body.email;
          const password=req.body.password;
          const userExist=await User.findOne({email});
          if(userExist){
           //const passwordHash=await bcrypt.hash(password,10);
           const passwordMatch=await bcrypt.compare(password,userExist.password);
           console.log(passwordMatch)
            if(passwordMatch){
                    req.session.isUser=true;
                    req.session.user=req.body.email;
                    res.redirect('/user/home');
            }
            else{
                req.flash("error", "Invalid Username or Password");
                res.redirect("/user/login");
            }
         }else{
            req.flash("error", "Invalid Username or Password");
            res.redirect("/user/login");
          }
    }catch(error){
        console.log(`error from user verification ${error}`);
    }
}

export const userhome=async(req,res)=>{
    
    try{

    //    if (!req.session.isUser) {
    
    //        return res.redirect('user/login');
    //       }
          const viewproduct= await Product.find({isDeleted:false}).limit(4);
          console.log(viewproduct);
          const recentproduct = await Product.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(4);
          console.log(recentproduct);
          const productgreen= await Product.findOne({productName:'Spencer-Green'});
          console.log(productgreen);
          const productcase= await Product.findOne({productName:'CARDO'})
;
          res.render('userhome',{viewproduct,recentproduct,productgreen,productcase});
        
    }catch(error){
        console.log(`error from user home ${error}`);
    }
}

export const userlogout=async(req,res)=>{
    try{
        req.session.destroy();
        res.redirect('user/login')
    }catch(error){
        console.log(error.message)
    }
}

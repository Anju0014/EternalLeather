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
    res.render('userhome')}
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

          const user=new User({
            name:req.body.name,
            email:req.body.email,
            password:spassword,
            phoneno:req.body.phoneno
          })
          user.otpExpires =Date.now() + 10 * 60 * 1000;
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
    if (user.otp != otp && Date.now() < user.otpExpires) {
        req.flash("error", "Invalid or expired OTP");
        res.redirect('/user/signup',);
    }else{

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    res.redirect('/user/login'); }
    
};

export const resendOtp = async (req, res) => {
    try {
        const userId  = req.body.userId1;

        const user = await User.findById(userId);

        if (user) {
         
            const newOtp = crypto.randomInt(100000, 999999).toString();
            user.otp = newOtp;
            user.otpExpires = Date.now() + 10 * 60 * 1000;  // 10-minute expiration

            await user.save();

         
            const mailOptions = {
                from: 'eternalleather09@gmail.com',
                to: user.email,
                subject: 'Resend OTP - Email Verification',
                text: `Your new OTP is ${newOtp}. It will expire in 10 minutes.`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                    return res.status(500).send('Error resending OTP');
                }
                console.log('OTP resent:', info.response);
            });

            req.flash('success', 'OTP has been resent');
            res.render('userotpverify',{user:user._id, resend:"Otp has been resent"});
        } else {
            req.flash('error', 'User not found');
            res.redirect('/user/signup');
        }
    } catch (error) {
        console.log('Error resending OTP:', error);
        res.status(500).send('Server error');
    }
};


// export const verifyOtp = async (req, res) => {
//     try {
//         const userId = req.body.userId; // assuming user ID is passed in request
//         const otp = req.body.otp;       // the OTP entered by the user
        
//         const user = await User.findById(userId);
//         if (!user) {
//             req.flash('error', 'User not found');
//             return res.redirect('/user/signup');
//         }

//         // Check if OTP matches and if it's still valid
//         if (user.otp === otp && Date.now() < user.otpExpires) {
//             // OTP is valid
//             user.isVerified = true; // Optionally, mark the user as verified
//             user.otp = null;        // Clear OTP after successful verification
//             user.otpExpires = null; // Clear OTP expiration
//             await user.save();

//             res.send('OTP verified successfully');
//         } else {
//             req.flash('error', 'OTP is invalid or expired');
//             res.redirect('/user/otpverify'); // Redirect back to the OTP input form
//         }
//     } catch (error) {
//         console.log(`Error from OTP verification: ${error}`);
//         req.flash('error', 'Something went wrong. Please try again.');
//         res.redirect('/user/otpverify');
//     }
// };


export const userverify=async(req,res)=>{
    try{
          const email=req.body.email;
          const password=req.body.password;
          const userExist=await User.findOne({email});
          if(userExist && !userExist.isBlocked){
           //const passwordHash=await bcrypt.hash(password,10);
           const passwordMatch=await bcrypt.compare(password,userExist.password);
           console.log(passwordMatch)
            if(passwordMatch){
                    req.session.isUser=req.body.email;
                    // req.session.user=req.body.email;

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
          const sessionuser=req.session.isUser
          const viewproduct= await Product.find({isDeleted:false}).limit(4);
          console.log(viewproduct);
          const recentproduct = await Product.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(4);
          console.log(recentproduct);
          const productgreen= await Product.findOne({productName:'Spencer-Green'});
          console.log(productgreen);
          const productcase= await Product.findOne({productName:'CARDO'});
          res.render('userhome',{viewproduct,recentproduct,productgreen,productcase,sessionuser});
        
    }catch(error){
        console.log(`error from user home ${error}`);
    }
}

export const userlogout=async(req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/user/login')
    }catch(error){
        console.log(error.message)
    }
}

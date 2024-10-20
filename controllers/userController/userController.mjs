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
        next(error)

    }
}

export const userlanding=async(req,res)=>{
    try{
        res.redirect('/user/home')
    }
    catch(error){
        console.log(`error from landing page ${error}`)
        next(error)
    }
}


export const user=async(req,res)=>{
    try{  
        res.redirect('/user/login')
    }catch(error){
        console.log(`error from user ${error}`);
        next(error)
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
        next(error)
    }
}

export const useremail=async(req,res)=>{
    try{ 
        res.render('useremail')
    }catch(error){
        console.log(`error from user forgot password email ${error}`);
        next(error)
    }
}
export const passwordchange=async(req,res)=>{
    try{

        const email= req.body.email;
        res.render('forgotpassword',{user:email})
    }
    catch(error){
        console.log(`error from user forgot password ${error}`)
        next(error)
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
        next(error)
    }

}

export const usersignup=async(req,res)=>{
    try{
        if(req.session.isUser){
          res.redirect('/user/home')
        }else{
          res.render('usersign',{ message: req.flash() })
        }
    }catch(error){
        console.log(`error from user signup ${error}`)
        next(error)
    }
}

// export const userregister=async(req,res)=>{
//     try{
//         const spassword= await securePassword(req.body.password)
//         const exemail=req.body.email
//         const userExist=await User.findOne({email:exemail});
//         if(userExist){
//             req.flash("error", "User Already Exists");
//             console.log(1)
//             res.redirect('/user/signup')
//         }else{

//           const user=new User({
//             name:req.body.name,
//             email:req.body.email,
//             password:spassword,
//             phoneno:req.body.phoneno
//           })
//           user.otpExpires =Date.now() + 1 * 60 * 1000;
//           console.log(2)
//           const otp = crypto.randomInt(100000, 999999).toString();
//           user.otp = otp;
//           console.log(2)
       
//           const savedUser=await user.save();  

//           console.log(3)
//           if(savedUser){
//             const mailOptions = {
//                 from: 'eternalleather09@gmail.com',
//                 to: user.email,
//                 subject: 'Email Verification',
//                 text: `Your OTP is ${otp}`,
//             };
//         console.log(4)
//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                     return console.log(error);
//                 }
//                 console.log('OTP sent: ' + info.response);
//             });
//         console.log(5)
          
//             res.render('userotpverify',{user:user._id,message:req.flash(),otpExpires: user.otpExpires-Date.now()})

          
//           }
//           else{
//             req.flash("error", "Registration Failed");
//             res.redirect('/user/signup')
//           }
//         }
//     }catch(error){
//         console.log(`error from user signup registration ${error}`)
//         next(error)
//     }
// }

export const userregister = async (req, res, next) => {
    try {
        const spassword = await securePassword(req.body.password);
        const exemail = req.body.email;

        // Check if user already exists
        const userExist = await User.findOne({ email: exemail });
        if (userExist) {
            req.flash("error", "User Already Exists");
            console.log(1);
            return res.redirect('/user/signup');
        }

        // Store registration details in the session
        req.session.registrationData = {
            name: req.body.name,
            email: req.body.email,
            password: spassword,
            phoneno: req.body.phoneno,
            otpExpires: Date.now() + 1 * 60 * 1000, 
            otp: crypto.randomInt(100000, 999999).toString() 
        };

        console.log(2);
        const { otp, otpExpires } = req.session.registrationData;

        // Send OTP via email
        const mailOptions = {
            from: 'eternalleather09@gmail.com',
            to: req.session.registrationData.email,
            subject: 'Email Verification',
            text: `Your OTP is ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('OTP sent: ' + info.response);
        });

        console.log(5);
    
        res.render('userotpverify', {
            user: req.session.registrationData,
            message: req.flash(),
            otpExpires: otpExpires - Date.now()
        });
    } catch (error) {
        console.log(`Error from user signup registration: ${error}`);
        next(error);
    }
};


// export const verifyOtp = async (req, res) => {
//     const { userId, otp } = req.body;
//     console.log(otp);
//     const user = await User.findById(userId);
//     console.log(user)


//     console.log(user.otp)
//     console.log(otp)
//     if (user.otp == otp && Date.now() < user.otpExpires) {
//         user.isVerified = true;
//         user.otp = undefined;
//         user.otpExpires = undefined;
//         await user.save();
        
//     res.redirect('/user/login'); }
//     else{
//         req.flash("error", "Invalid OTP or Expired OTP");
//         res.render('userotpverify',{user:user._id,message:req.flash(), otpExpires: user.otpExpires - Date.now()})
//     }

        
//     // }if(user.otp ==otp && Date.now()>user.otpExpires)
//     // else{

//     // user.isVerified = true;
//     // user.otp = undefined;
//     // user.otpExpires = undefined;
//     // await user.save();
    
//     // res.redirect('/user/login'); }
    
// };

// export const verifyOtp = async (req, res) => {
//     const { userId, otp } = req.body;

//     try {
//         const user = await User.findById(userId);

//         if (!user) {
//             req.flash("error", "User not found.");
//             return res.redirect('/user/otpverify'); // Redirect to the OTP verification page
//         }

//         // Check if the OTP is valid and not expired
//         if (user.otp === otp && Date.now() < user.otpExpires) {
//             user.isVerified = true;
//             user.otp = undefined;
//             user.otpExpires = undefined;
//             await user.save();

//             req.flash("success", "Registration successful! You can now log in.");
//             return res.redirect('/user/login');
//         } else {
//             req.flash("error", "Invalid OTP or Expired OTP");
//             return res.render('userotpverify', {
//                 user: user._id,
//                 message: req.flash(),
//                 otpExpires: user.otpExpires - Date.now()
//             });
//         }
//     } catch (error) {
//         console.error("Error verifying OTP:", error);
//         req.flash("error", "An error occurred while verifying the OTP. Please try again.");
//         return res.redirect('/user/otpverify'); // Redirect to the OTP verification page
//     }
// };


// export const verifyOtp = async (req, res) => {
//     const { userId, otp } = req.body;

//     try {
//         const user = await User.findById(userId);

//         if (!user) {
//             req.flash("error", "User not found.");
//             return res.redirect('/user/otpverify');
//         }

        
//         console.log("Received OTP from user:", otp);
//         console.log("Stored OTP in DB:", user.otp);
//         console.log("OTP Expiration Time:", user.otpExpires);
//         console.log("Current Time:", Date.now());

   
//         if (user.otp.toString() === otp.toString() && Date.now() < user.otpExpires) {
//             user.isVerified = true;
//             user.otp = undefined;
//             user.otpExpires = undefined;
//             await user.save();

//             req.flash("success", "Registration successful! You can now log in.");
//             return res.redirect('/user/login');
//         } else {
//             req.flash("error", "Invalid OTP or Expired OTP");
//             return res.render('userotpverify', {
//                 user: user._id,
//                 message: req.flash(),
//                 otpExpires: user.otpExpires - Date.now()
//             });
//         }
//     } catch (error) {
//         console.error("Error verifying OTP:", error);
//         // req.flash("error", "An error occurred while verifying the OTP. Please try again.");
//         // return res.redirect('/user/otpverify');
//         next(error)
//     }
// };

export const verifyOtp = async (req, res, next) => {
    try {
        const { otp } = req.body;
        const sessionData = req.session.registrationData;

        if (!sessionData) {
            req.flash("error", "Session expired. Please register again.");
            return res.redirect('/user/signup');
        }

        console.log("Received OTP from user:", otp);
        console.log("Stored OTP in session:", sessionData.otp);
        console.log("OTP Expiration Time:", sessionData.otpExpires);
        console.log("Current Time:", Date.now());

   
        if (otp === sessionData.otp && Date.now() < sessionData.otpExpires) {
        
            const newUser = new User({
                name: sessionData.name,
                email: sessionData.email,
                password: sessionData.password,
                phoneno: sessionData.phoneno,
                isVerified:true
            });

            await newUser.save();

            req.session.registrationData = null;

            req.flash("success", "Registration successful! You can now log in.");
            return res.redirect('/user/login');
        } else {
            req.flash("error", "Invalid OTP or OTP expired.");
          
            return res.render('userotpverify', {
                user: req.session.registrationData,
                message: req.flash(),
                otpExpires: sessionData.otpExpires - Date.now()
            });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        next(error);
    }
};

// export const resendOtp = async (req, res) => {
//     try {
//         const userId  = req.body.userId1;

//         const user = await User.findById(userId);

//         if (user) {
         
//             const newOtp = crypto.randomInt(100000, 999999).toString();
//             user.otp = newOtp;
//             user.otpExpires = Date.now() + 1 * 60 * 1000;  // 2-minute expiration

//             await user.save();

         
//             const mailOptions = {
//                 from: 'eternalleather09@gmail.com',
//                 to: user.email,
//                 subject: 'Resend OTP - Email Verification',
//                 text: `Your new OTP is ${newOtp}. It will expire in 10 minutes.`,
//             };

//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                     console.log('Error sending email:', error);
//                     return res.status(500).send('Error resending OTP');
//                 }
//                 console.log('OTP resent:', info.response);
//             });

//             req.flash('success', 'OTP has been resent');
//             res.render('userotpverify',{user:user._id, message:req.flash(),otpExpires: user.otpExpires - Date.now()});
//         } else {
//             req.flash('error', 'User not found');
//             res.redirect('/user/signup');
//         }
//     } catch (error) {
//         console.log('Error resending OTP:', error);
//         // res.status(500).send('Server error');
//         next(error)
//     }
// };


export const resendOtp = async (req, res, next) => {
    try {
        const sessionData = req.session.registrationData;

        if (!sessionData) {
            req.flash("error", "Session expired. Please register again.");
            return res.redirect('/user/signup');
        }

        const newOtp = crypto.randomInt(100000, 999999).toString();
        sessionData.otp = newOtp; 
        sessionData.otpExpires = Date.now() + 1 * 60 * 1000; 
        const mailOptions = {
            from: 'eternalleather09@gmail.com',
            to: sessionData.email,
            subject: 'Resend OTP - Email Verification',
            text: `Your new OTP is ${newOtp}. It will expire in 1 minute.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.status(500).send('Error resending OTP');
            }
            console.log('OTP resent:', info.response);
            req.flash('success', 'New OTP has been sent to your email.');
            return res.render('userotpverify', {
                user: req.session.registrationData,
                message: req.flash(),
                otpExpires: sessionData.otpExpires - Date.now()
            });
        });
    } catch (error) {
        console.log('Error resending OTP:', error);
        next(error);
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


// export const userverify=async(req,res)=>{
//     try{
//           const email=req.body.email;
//           const password=req.body.password;
//           const userExist=await User.findOne({email});
//           if(userExist && !userExist.isBlocked && userExist.isVerified){
//            //const passwordHash=await bcrypt.hash(password,10);
//            const passwordMatch=await bcrypt.compare(password,userExist.password);
//            console.log(passwordMatch)
//             if(passwordMatch){
//                     req.session.isUser=req.body.email;
//                     // req.session.user=req.body.email;

//                     res.redirect('/user/home');
//             }
//             else{
//                 req.flash("error", "Invalid Username or Password");
//                 res.redirect("/user/login");
//             }
//          }else{
//             req.flash("error", "Invalid Username or Password");
//             res.redirect("/user/login");
//           }
//     }catch(error){
//         console.log(`error from user verification ${error}`);
//         next(error)
//     }
// }

export const userverify = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userExist = await User.findOne({ email });

        if (userExist) {
            
            if (userExist.isBlocked) {
                req.flash("error", "Access is denied by the Admin.");
                return res.redirect("/user/login");
            }

  
            if (!userExist.isVerified) {
                req.flash("error", "Your account is not verified. Please check your email for the verification link.");
                return res.redirect("/user/login");
            }

            
            const passwordMatch = await bcrypt.compare(password, userExist.password);
            console.log(passwordMatch);

            if (passwordMatch) {
                req.session.isUser = req.body.email; 
               
                return res.redirect('/user/home');
            } else {
                req.flash("error", "Invalid Username or Password.");
                return res.redirect("/user/login");
            }
        } else {
            req.flash("error", "Invalid Username or Password.");
            return res.redirect("/user/login");
        }
    } catch (error) {
        console.log(`Error from user verification: ${error}`);
        next(error);
    }
};

export const userhome=async(req,res)=>{
    
    try{
          const sessionuser=req.session.isUser
          const viewproduct= await Product.find({isDeleted:false}).limit(4);
        //   console.log(viewproduct);
          const recentproduct = await Product.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(4);
        //   console.log(recentproduct);
          const productgreen= await Product.findOne({productName:'Spencer-Green'});
        //   console.log(productgreen);
          const productcase= await Product.findOne({productName:'CARDO'});
          const productCollection=await Category.find({isActive:true});
          res.render('userhome',{viewproduct,recentproduct,productgreen,productcase,sessionuser,productCollection,message:req.flash(),query:req.query});
        
    }catch(error){
        console.log(`error from user home ${error}`);
        next(error)
    }
}

// export const usersearch = async (req, res, next) => {
//     try {
//         const catid = req.query.id || ''; // Get category ID if present
//         const searchname = req.body.searchvalue || ''; // Get the search query from the user
//         const page = parseInt(req.query.page) || 1;
//         const pageSize = 12;
//         const skip = (page - 1) * pageSize;
//         const sortstyle = req.query.sortstyle || ''; // Sorting option

//         let sortCriteria = {};
//         if (sortstyle === 'lowToHigh') {
//             sortCriteria = { productPrice: 1 };
//         } else if (sortstyle === 'highToLow') {
//             sortCriteria = { productPrice: -1 };
//         } else if (sortstyle === 'aToZ') {
//             sortCriteria = { productName: 1 };
//         } else if (sortstyle === 'zToA') {
//             sortCriteria = { productName: -1 };
//         }

//         // Build query object based on search, category, etc.
//         let query = {
//             isDeleted: false
//         };

//         if (catid) {
//             query.productCategory = catid; // Filter by category if provided
//         }

//         if (searchname) {
//             const regex = new RegExp(searchname, 'i'); // Case-insensitive regex search
//             query.productName = { $regex: regex }; // Search by product name
//         }

//         // Fetch products based on the query
//         const product = await Product.find(query)
//             .populate('productCategory', 'categoryName')
//             .sort(sortCriteria)
//             .skip(skip)
//             .limit(pageSize);

//         const totalProducts = await Product.countDocuments(query);
//         const totalPages = Math.ceil(totalProducts / pageSize);
//         const productCollection = await Category.find({ isActive: true });

//         // Render the same view with search results
//         res.render('userAllProducts', {
//             product,
//             currentPage: page,
//             totalPages,
//             productCollection,
//             sessionuser: req.session.isUser,
//             catid,
//             sortstyle,
//             query: req.query
//         });
//     } catch (error) {
//         console.error('Error in search functionality:', error);
//         next(error); // Pass the error to the error handler middleware
//     }
// };


export const usersearch = async (req, res, next) => {
    try {
        const catid = req.query.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = 12;
        const skip = (page - 1) * pageSize;
        const { sortstyle } = req.query;
        const searchname = req.body.searchvalue;
        
       
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
        const type = req.query.type || '';  

        let product;
        let totalProducts;

        if (searchname) {
            const regex = new RegExp(searchname, 'i');
            const productcheck = await Product.find({ productName: { $regex: regex } });

            if (productcheck.length > 0) {
                let sortCriteria = {};
                if (sortstyle === 'lowToHigh') {
                    sortCriteria = { productPrice: 1 };
                } else if (sortstyle === 'highToLow') {
                    sortCriteria = { productPrice: -1 };
                } else if (sortstyle === 'aToZ') {
                    sortCriteria = { productName: 1 };
                } else if (sortstyle === 'zToA') {
                    sortCriteria = { productName: -1 };
                }

                if (!catid) {
                    product = await Product.find({ isDeleted: false, productName: { $regex: regex } })
                        .populate('productCategory', 'categoryName')
                        .sort(sortCriteria)
                        .skip(skip)
                        .limit(pageSize);

                    totalProducts = await Product.countDocuments({ isDeleted: false, productName: { $regex: regex } });
                } else {
                    product = await Product.find({ isDeleted: false, productCategory: catid, productName: { $regex: regex } })
                        .populate('productCategory', 'categoryName')
                        .sort(sortCriteria)
                        .skip(skip)
                        .limit(pageSize);

                    totalProducts = await Product.countDocuments({ isDeleted: false, productCategory: catid, productName: { $regex: regex } });
                }

                const totalPages = Math.ceil(totalProducts / pageSize);
                const productCollection = await Category.find({ isActive: true });

                
                res.render('userAllProducts', {
                    product,
                    currentPage: page,
                    totalPages: totalPages,
                    productCollection,
                    sessionuser: req.session.isUser,
                    catid,
                    minPrice,
                    maxPrice,
                    type,  
                    sortstyle,
                    query: req.query
                });
            } else {
                res.redirect('/user/allproducts');
            }
        } else {
            res.redirect('/user/allproducts');
        }
    } catch (error) {
        console.error('Error in search functionality:', error);
        next(error);
    }
};

// export const usersearch = async (req, res) => {
//     try {
//         const catid = req.query.id;
//         const page = parseInt(req.query.page) || 1;
//         const pageSize = 12;
//         const skip = (page - 1) * pageSize;
//         const { sortstyle } = req.query; 
//         const searchname = req.body.searchvalue;

//         console.log('Category ID:', catid);
//         console.log('Sort Style:', sortstyle);
//         console.log('Search Name:', searchname);

//         let product;
//         let totalProducts;

//         if (searchname) {
//             const regex = new RegExp(searchname, 'i'); 
//             const productcheck = await Product.find({ productName: { $regex: regex } });

//             if (productcheck.length > 0) {  // Check if products were found
//                 let sortCriteria = {};
//                 if (sortstyle === 'lowToHigh') {
//                     sortCriteria = { productPrice: 1 };
//                 } else if (sortstyle === 'highToLow') {
//                     sortCriteria = { productPrice: -1 }; 
//                 } else if (sortstyle === 'aToZ') {
//                     sortCriteria = { productName: 1 }; 
//                 } else if (sortstyle === 'zToA') {
//                     sortCriteria = { productName: -1 }; 
//                 }

//                 if (!catid) {
//                     product = await Product.find({ isDeleted: false, productName: { $regex: regex } })
//                         .populate('productCategory', 'categoryName')
//                         .sort(sortCriteria)
//                         .skip(skip)
//                         .limit(pageSize);

//                     totalProducts = await Product.countDocuments({ isDeleted: false, productName: { $regex: regex } });
//                 } else {
//                     product = await Product.find({ isDeleted: false, productCategory: catid, productName: { $regex: regex } })
//                         .populate('productCategory', 'categoryName')
//                         .sort(sortCriteria)
//                         .skip(skip)
//                         .limit(pageSize);

//                     totalProducts = await Product.countDocuments({ isDeleted: false, productCategory: catid, productName: { $regex: regex } });
//                 }

//                 const totalPages = Math.ceil(totalProducts / pageSize);
//                 const productCollection = await Category.find({ isActive: true });

//                 // Render the search result page
//                 res.render('userAllProducts', {
//                     product,
//                     currentPage: page,
//                     totalPages: totalPages,
//                     productCollection,
//                     sessionuser: req.session.isUser,
//                     catid,

//                     query: req.query
//                 });
//             } else {
              
//                 res.redirect('/user/allproducts');
//             }
//         } else {
            
//             res.redirect('/user/allproducts');
//         }
//     } catch (error) {
//         console.error('Error in search functionality:', error);
//         next(error)
//         // res.status(500).send('An error occurred while searching for products');
//     }
// }


export const userlogout=async(req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/user/home')
    }catch(error){
        console.log(error.message)
        next(error)
    }
}

import User from "../../model/userModel.mjs"
import Category from "../../model/categoryModel.mjs"
import bcrypt from "bcrypt"
import addressSchema from "../../model/addressModel.mjs"

// export const userdata=async (req,res)=>{
//     try{
//         const sessionuser=req.session.isUser
//         const productCollection=await Category.find({isActive:true});
//         const user= await User.findOne({email:req.session.user})
//         const addresses=user.address;
//         //const addresses=await Address.find({isDeleted:false})
//         res.render('userprofile',{sessionuser,productCollection,addresses})
//     }catch(error){
//         console.log(error)
//     }

// }

const securePassword = async(password)=>{
    try{

        const passwordHash=await bcrypt.hash(password,10);
        return passwordHash;

    }catch(error){
        console.log(error.message)

    }
}

export const userdata = async (req, res) => {
    try {
        console.log(req.session.isUser)
        const sessionuser = req.session.isUser;
        const productCollection = await Category.find({ isActive: true });
        
        if (!req.session.isUser) {
            console.log("User session is missing");
            req.flash("error", "User is not Logged In");
            return res.redirect('/user/home');
        }
        
        const user = await User.findOne({ email: req.session.isUser });
        
        if (!user) {
            console.log("User not found");
            req.flash("error", "User not found");
            return res.redirect('/user/home');
        }

        //const addresses = user.address({isDeleted:false});
        const addresses = user.address.filter(address => !address.isDeleted);
        
        res.render('userprofile', { sessionuser, productCollection, addresses, user ,message:req.flash(),query:req.query});
    } catch (error) {
        console.log(`Error in userdata function: ${error}`);
        return res.redirect('/user/home');
    }
};


export const useredit = async (req, res) => {
    try{
        const user = await User.findOne({ email: req.session.isUser });
        if (!user) {
            console.log("User not found");
            return res.redirect('/user/profile'); 
        }
        const {phoneno} = req.body;
        user.phoneno=phoneno;
        await user.save();
        console.log("saved")
        res.redirect('/user/profile')
    }catch(error){
        console.log(error)
        res.redirect('/user/profile')
    }
}
export const userchangepassword= async (req,res)=>{
    try{
         const{newPassword,currentPassword}= req.body
    //      console.log(req.body)
    //      console.log("hello")
         const user = await User.findOne({ email: req.session.isUser });

    console.log(user);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Compare plain text currentPassword with stored hashed password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password); 
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
    }

    
    const snewpassword = await securePassword(newPassword);
    console.log('New hashed password:', snewpassword);

    user.password = snewpassword;
    console.log("Updated password", user.password);

    // Save the updated user information
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });

} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
}
    // }
}
export const addressAdd = async (req, res) => {
    try {
         // Getting user ID from query parameter
        const user = await User.findOne({email:req.session.isUser});

        if (!user) {
            req.flash("error", "User not found");
            return res.redirect('/user/home');
        }

        // Creating a new address object
        const newAddress = {
            contactname: req.body.contactname,  
            country: req.body.country,
            building: req.body.building,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            landMark: req.body.landMark,
            pincode: req.body.postalCode,
            phoneno: req.body.phoneNumber
        };

        console.log(newAddress)

     
        user.address.push(newAddress);
        console.log(newAddress)

      
        await user.save();

        req.flash("success", 'Address added successfully');
        return res.redirect('/user/profile');
    } catch (error) {
        console.log(`Error from user address add: ${error}`);
        req.flash("error", "An error occurred while adding the address");
        return res.redirect('/user/profile');
    }
};


export const useraddressdelete = async (req, res) => {
    try {
        const addressId=req.query.id;
        console.log(req.url)
        const user = await User.findOne({email:req.session.isUser});
        console.log(user)
        const address1 = user.address.id(addressId);
        console.log(address1)
        if (!address1) {
            req.flash("error", "Address not found");
            return res.redirect('/user/profile');
        }
        // console.log(address)
        address1.isDeleted=true
        await user.save();

    res.redirect('/user/profile')

    } catch (error) {
        console.log(`Error deleting Address: ${error}`);
        req.flash("error", "An error occurred while deleting the address");
        res.redirect('/user/profile');
    }
};

 export const useraddressedit = async (req, res) => {
    try {

        console.log(req.session.isUser)
        const sessionuser = req.session.isUser;
        const productCollection = await Category.find({ isActive: true });
        
        if (!req.session.isUser) {
            console.log("User session is missing");
            req.flash("error", "User is not logged in.");
           res.redirect('/user/home')
        }
        
        const user = await User.findOne({ email: req.session.isUser });
        
        if (!user) {
            console.log("User not found");
            req.flash("error", "User is not found.");
            res.redirect('/user/home');
        }

        const addressId=req.query.id;
        const address = user.address.id(addressId);



        //const addresses = user.address({isDeleted:false});
        //const addresses = user.address.filter(address => !address.isDeleted);
        
       
       res.render('useraddressedit',{sessionuser,productCollection,address,query:req.query})
    } catch (error) {
      console.log('Error updating address:', error)
      req.flash("error", "'Error updating address'");
      res.redirect('/user/profile');
    //   res.status(500).send('Error updating address');
    }
};
  

// In your controller file

export const editAddress = async (req, res) => {
    try {
      const { addressId, contactname, building, street, city, state, country, postalCode, landMark, phoneNumber } = req.body;
      const user = await User.findOne({ email: req.session.isUser });
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const address = user.address.id(addressId);
  
      if (!address) {
        // return res.status(404).send('Address not found');
        req.flash("error", "Address not found");
        res.redirect('/user/profile');
      }
  
      address.contactname = contactname;
      address.building = building;
      address.street = street;
      address.city = city;
      address.state = state;
      address.country = country;
      address.pincode = postalCode;
      address.landMark = landMark;
      address.phoneno = phoneNumber;
  
      await user.save();
    
      res.redirect('/user/profile')
    } catch (error) {
        console.error('Error updating address:', error);
        req.flash("error", "'Error updating address'");
        res.redirect('/user/profile');
     
    //   res.status(500).send('Error updating address');
    }
  };
  
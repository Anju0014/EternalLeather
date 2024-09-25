import User from "../../model/userModel.mjs"
import Category from "../../model/categoryModel.mjs"
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
export const userdata = async (req, res) => {
    try {
        console.log(req.session.isUser)
        const sessionuser = req.session.isUser;
        const productCollection = await Category.find({ isActive: true });
        
        if (!req.session.isUser) {
            console.log("User session is missing");
            return res.status(400).send("User is not logged in.");
        }
        
        const user = await User.findOne({ email: req.session.isUser });
        
        if (!user) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        //const addresses = user.address({isDeleted:false});
        const addresses = user.address.filter(address => !address.isDeleted);
        
        res.render('userprofile', { sessionuser, productCollection, addresses, user });
    } catch (error) {
        console.log(`Error in userdata function: ${error}`);
        res.status(500).send("Internal Server Error");
    }
};


export const addressAdd = async (req, res) => {
    try {
         // Getting user ID from query parameter
        const user = await User.findOne({email:req.session.isUser});

        if (!user) {
            req.flash("error", "User not found");
            return res.redirect('/user/profile');
        }

        // Creating a new address object
        const newAddress = {
            contactname: req.body.contactname,  // Ensure this is coming from req.body
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

        // Adding the new address to the user's address array
        user.address.push(newAddress);
        console.log(newAddress)

        // Saving the updated user with the new address
        await user.save();

        req.flash("success", 'Address added successfully');
        res.redirect('/user/profile');
    } catch (error) {
        console.log(`Error from user address add: ${error}`);
        req.flash("error", "An error occurred while adding the address");
        res.redirect('/user/profile');
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
            return res.status(400).send("User is not logged in.");
        }
        
        const user = await User.findOne({ email: req.session.isUser });
        
        if (!user) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        const addressId=req.query.id;
        const address = user.address.id(addressId);



        //const addresses = user.address({isDeleted:false});
        //const addresses = user.address.filter(address => !address.isDeleted);
        
       
       res.render('useraddressedit',{sessionuser,productCollection,address})
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).send('Error updating address');
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
        return res.status(404).send('Address not found');
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
      res.status(500).send('Error updating address');
    }
  };
  
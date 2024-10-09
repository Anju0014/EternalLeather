import User from "../../model/userModel.mjs";
import addressSchema from "../../model/addressModel.mjs";

// import addressSchema from './addressModel.mjs'; 

export const addressAdd2 = async (req, res) => {
    try {
        const userId = req.query.user;  
        const user = await User.findById(userId);

        if (!user) {
            req.flash("error", "User not found");
            return res.redirect('/user/profile');
        }

      
        const newAddress = {
            contactname: req.body.contactname,  
            country: req.body.country,
            building: req.body.building,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            landMark: req.body.landMark,
            pincode: req.body.pincode,
            phoneno: req.body.phoneno
        };

      
        user.address.push(newAddress);

       
        await user.save();

        req.flash("success", 'Address added successfully');
        res.redirect('/user/profile');
    } catch (error) {
        console.log(`Error from user address add: ${error}`);
        // req.flash("error", "An error occurred while adding the address");
        // res.redirect('/user/profile');
        next(error)
    }
};




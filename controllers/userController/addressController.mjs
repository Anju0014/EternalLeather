import User from "../../model/userModel.mjs";
import addressSchema from "../../model/addressModel.mjs";

//   export const admincategory=async(req,res)=>{
    
//     try{

    
//           const addresses=await Address.find({ isDeleted: false }); 
//           //console.log(users);
//           res.render('adminCategory',{message: categories});
        
//     }catch(error){
//         console.log(`error from admin category ${error}`);
//     }
// }


  

import addressSchema from './addressModel.mjs'; 

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
        req.flash("error", "An error occurred while adding the address");
        res.redirect('/user/profile');
    }
};



// export const admincategoryeditform = async (req, res) => {
//     try {
//         const categoryId = req.query.id;
//         const category = await Category.findById(categoryId);
        
//         // if (!category) {
//         //     req.flash("error", "Category not found");
//         //     return res.redirect('/admin/category');
//         // }

//         res.render('adminCategoryEdit', { category, message: req.flash() }); 
//     } catch (error) {
//         console.log(`Error fetching category for edit: ${error}`);
//         req.flash("error", "An error occurred while fetching the category");
//         return res.redirect('/admin/category');
//     }
// };


// Update Category
// export const admincategoryupdate = async (req, res) => {
//     try {
//         const categoryId = req.body.id;  // Extract category ID from the request
//         const { catname, status, adddate } = req.body;

//         // Find and update the category
//         const category = await Category.findByIdAndUpdate(categoryId, {
//             categoryName: catname,
//             isActive: status,
//             addDate: adddate
//         }, { new: true });
//         console.log(category);
//         if (!category) {
//             req.flash("error", "Category not found");
//             return res.redirect('/admin/category');
//         }

//         req.flash("success", "Category updated successfully");
//         return res.redirect('/admin/category');
        
//     } catch (error) {
//         console.log(`Error updating category: ${error}`);
//         req.flash("error", "An error occurred while updating the category");
//         return res.redirect(`/admin/category/edit/${req.params.id}`);
//     }
// };

// export const admincategorysearch=async(req,res)=>{
//     try{
       
        
//         const name=req.body.sename;
//         if(name){
//             const regex = new RegExp(name, 'i'); // 'i' for case-insensitive
//             const user1= await Category.find({categoryName:{ $regex: regex } });
//         if(user1){
//             console.log("entered");
           
//             res.render('adminCategory',{message: user1});
//         }else{
//             res.redirect('/admin/category')
//         }
//         } 
//         else{
//             res.redirect('/admin/category')
//         }
       
//     }catch(error){
//         console.log(error.message)
//     }
// }


// export const admincategorydelete = async (req, res) => {
//     console.log(req.url)
//     const category = await Category.findByIdAndUpdate(req.query.id,{
//         isDeleted: true,
//         deletedAt: new Date(),
//       });
//     res.redirect('/admin/category')

// };

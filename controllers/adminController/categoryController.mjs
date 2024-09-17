
import Category from "../../model/categoryModel.mjs";
  

export const check= async (req,res)=>{

   const category= await Category.find()
   res.render('trypage',{message: category})
}

  export const admincategory=async(req,res)=>{
    
    try{

        if (!req.session.isAdmin) {
           
            return res.redirect('/admin/login');
          }
          const categories=await Category.find({ isDeleted: false }); 
          //console.log(users);
          res.render('adminCategory',{message: categories});
        
    }catch(error){
        console.log(`error from admin category ${error}`);
    }
}

export const admincategoryaddform = async (req, res) => {
    try {
        res.render('adminCategoryAdd', { message: req.flash() });
    } catch (error) {
      console.log(`error from admin category ${error}`);
    }
  };
  

  // Adjust the path to your category schema model

export const admincategoryAdd = async (req, res) => {
    try {
        const categoryname = req.body.catname; 

        console.log(req.body.catname)
        const existingCategory = await Category.findOne({ categoryName:categoryname });
        if (existingCategory) {
            req.flash("error", "Category already exists");
            res.redirect('/admin/category/add');
        }else{
        const newCategory = new Category({
            categoryName: categoryname,
            isActive: req.body.status,
            addDate: req.body.adddate
        });

        const savedCategory= await newCategory.save();
        
        req.flash("success", 'Category added successfully');
        res.redirect('/admin/category')
    }
    } catch (error) {
        console.log(`error from admin category add ${error}`)
    }
};



export const admincategoryeditform = async (req, res) => {
    try {
        const categoryId = req.query.id;
        const category = await Category.findById(categoryId);
        
        // if (!category) {
        //     req.flash("error", "Category not found");
        //     return res.redirect('/admin/category');
        // }

        res.render('adminCategoryEdit', { category, message: req.flash() }); 
    } catch (error) {
        console.log(`Error fetching category for edit: ${error}`);
        req.flash("error", "An error occurred while fetching the category");
        return res.redirect('/admin/category');
    }
};


// Update Category
export const admincategoryupdate = async (req, res) => {
    try {
        const categoryId = req.body.id;  // Extract category ID from the request
        const { catname, status, adddate } = req.body;

        // Find and update the category
        const category = await Category.findByIdAndUpdate(categoryId, {
            categoryName: catname,
            isActive: status,
            addDate: adddate
        }, { new: true });
        console.log(category);
        if (!category) {
            req.flash("error", "Category not found");
            return res.redirect('/admin/category');
        }

        req.flash("success", "Category updated successfully");
        return res.redirect('/admin/category');
        
    } catch (error) {
        console.log(`Error updating category: ${error}`);
        req.flash("error", "An error occurred while updating the category");
        return res.redirect(`/admin/category/edit/${req.params.id}`);
    }
};

export const admincategorysearch=async(req,res)=>{
    try{
       
        
        const name=req.body.sename;
        if(name){
            const regex = new RegExp(name, 'i'); // 'i' for case-insensitive
            const user1= await Category.find({categoryName:{ $regex: regex } });
        if(user1){
            console.log("entered");
           
            res.render('adminCategory',{message: user1});
        }else{
            res.redirect('/admin/category')
        }
        } 
        else{
            res.redirect('/admin/category')
        }
       
    }catch(error){
        console.log(error.message)
    }
}


// export const admincategorydelete = async (req, res) => {
//     console.log(req.url)
//     const category = await Category.findByIdAndUpdate(req.query.id,{
//         isDeleted: true,
//         deletedAt: new Date(),
//       });
//     res.redirect('/admin/category')

// };

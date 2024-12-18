
import Category from "../../model/categoryModel.mjs";
  

export const check= async (req,res,next)=>{
   const category= await Category.find()
   res.render('tryPage',{message: category,light:req.flash()})
}

  export const admincategory=async(req,res,next)=>{
    
    try{

        if (!req.session.isAdmin) {
           
            return res.redirect('/admin/login');
          }
          const categories=await Category.find({ isDeleted: false }); 
          //console.log(users);
          res.render('adminCategory',{message: categories,light:req.flash()});
        
    }catch(error){
        console.log(`error from admin category ${error}`);
        next(error);
    }
}

export const admincategoryaddform = async (req, res,next) => {
    try {
        res.render('adminCategoryAdd', { message: req.flash() });
    } catch (error) {
      console.log(`error from admin category ${error}`);
      next(error)
    }
  };
  



export const admincategoryAdd = async (req, res,next) => {
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
          
        });

        const savedCategory= await newCategory.save();
        
        req.flash("success", 'Category added successfully');
        res.redirect('/admin/category')
    }
    } catch (error) {
        console.log(`error from admin category add ${error}`)
        next(error)
    }
};



export const admincategoryeditform = async (req, res,next) => {
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
     
        next(error);
    }
};


export const admincategoryupdate = async (req, res,next) => {
    try {
        const categoryId = req.body.id; 
        const { catname, status, adddate } = req.body;

   
        const category = await Category.findByIdAndUpdate(categoryId, {
            categoryName: catname,
            isActive: status,
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
      
        next(error);
    }
};

export const admincategorysearch=async(req,res,next)=>{
    try{
        const name=req.body.sename;
        if(name){
            const regex = new RegExp(name, 'i'); 
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
        next(error);
    }
}


export const admincategorydelete = async (req, res) => {
    console.log(req.url)
    const category = await Category.findByIdAndUpdate(req.query.id,{
        isDeleted: true,
        isActive:false,
        deletedAt: new Date(),
      });
    res.redirect('/admin/category')

};

export const admincategorypost= async (req, res,next) => {
    try{
    const { id } = req.params;
    const { isActive } = req.body; 
    const category = await Category.findById(id);
    
    console.log(category)

    category.isActive = isActive 
    console.log(isActive)
    await category.save();

    res.redirect('/admin/category'); 
}catch (error) {
    console.error('Error toggling toggling category:', error);
    next(error);
   
}
};

import Category from "../../model/categoryModel.mjs";


// export const admincategory = async (req, res) => {
//     try {
//         res.render('adminCategory');
//     } catch (error) {
//       console.log(`error from admin category ${error}`);
//     }
//   };
  
  export const admincategory=async(req,res)=>{
    
    try{

        if (!req.session.isAdmin) {
           
            return res.redirect('/admin/login');
          }
          const categories=await Category.find(); 
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

        const catname = req.body.catname; 
        const existingCategory = await Category.findOne({ categoryName:catname });
        if (existingCategory) {
            req.flash("error", "Category already exists");
            res.redirect('/admin/category/add');
        }else{
        const newCategory = new Category({
            categoryName: req.body.catname,
            isActive: req.body.status,
            addDate: req.body.adddate
        });

        const savedCategory= await newCategory.save();
        
        req.flash("success", 'Category added successfully');
        res.redirect('/admin/category/add')
    }
    } catch (error) {
        console.log(`error from admin category add ${error}`)
    }
};


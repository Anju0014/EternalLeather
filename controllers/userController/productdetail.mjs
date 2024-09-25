import Product from '../../model/productModel.mjs'
import Category from '../../model/categoryModel.mjs'


export const userproductdetail = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id); // Use findById for a single document
        
        if (!product) {
            return res.status(404).send('Product not found');
        }

        console.log(product);
        const productCollection = await Category.find({ isActive: true });
        const relateproduct= await Product.find({isDeleted:false}).limit(4).skip(4);
        console.log(relateproduct);
        res.render('userproductdetail', { product,relateproduct,sessionuser:req.session.isUser,productCollection });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// export const userproductview= async(req,res)=>{
//     try{
//         const catid=req.query.id;
//         console.log(catid)
//         const page = parseInt(req.query.page) || 1;
//         const pageSize = 12
//         const skip = (page - 1) * pageSize;

//         let product;
//         // Fetch the products with pagination
//         if(!catid){
//         product = await Product.find({ isDeleted: false })
//             .populate('productCategory', 'categoryName')
//             .skip(skip)
//             .limit(pageSize);
//         }
//         else{
//             product = await Product.find({ isDeleted: false ,productCategory:catid})
//             .populate('productCategory', 'categoryName')
//             .skip(skip)
//             .limit(pageSize);
//         }
//         // Debugging: Log the fetched products
//         //console.log('Fetched Products:', product);

//         const productCollection=await Category.find({isActive:true});
//         const totalProducts = await Product.countDocuments();
//         const totalPages = Math.ceil(totalProducts / pageSize);

//         res.render('userAllProducts',
//             {
//             product,
//             currentPage: page,
//             totalPages: totalPages,
//             productCollection,
//             sessionuser:req.session.isUser})
//     }catch(error){
//          console.log(error)
//     }
// }

export const userproductview = async (req, res) => {
    try {
        const catid = req.query.id;
        console.log('Category ID:', catid);

        const page = parseInt(req.query.page) || 1;
        const pageSize = 12;
        const skip = (page - 1) * pageSize;

        // Declare the 'product' variable and 'totalProducts'
        let product;
        let totalProducts;

        // Fetch the products and count based on whether a category is selected
        if (!catid) {
            product = await Product.find({ isDeleted: false })
                .populate('productCategory', 'categoryName')
                .skip(skip)
                .limit(pageSize);

            // Total product count without category filter
            totalProducts = await Product.countDocuments({ isDeleted: false });
        } else {
            product = await Product.find({ isDeleted: false, productCategory: catid })
                .populate('productCategory', 'categoryName')
                .skip(skip)
                .limit(pageSize);

            // Total product count for the specific category
            totalProducts = await Product.countDocuments({ isDeleted: false, productCategory: catid });
        }

        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / pageSize);

        // Fetch all active categories
        const productCollection = await Category.find({ isActive: true });

        res.render('userAllProducts', {
            product,
            currentPage: page,
            totalPages: totalPages,
            productCollection,
            sessionuser: req.session.isUser,
            catid
        });
    } catch (error) {
        console.log(error);
    }
};


export const userproductcategorywise= async(req,res)=>{
   try {
        const catid= req.params.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = 12
        const skip = (page - 1) * pageSize;

        // Fetch the products with pagination
        const product = await Product.find({ isDeleted: false ,productCategory:catid})
            .populate('productCategory', 'categoryName')
            .skip(skip)
            .limit(pageSize);

        // Debugging: Log the fetched products
        console.log('Fetched Products:', product);

        const productCollection=await Category.find({isActive:true});
        const totalProducts = await Product.countDocuments({productCategory:catid});
        const totalPages = Math.ceil(totalProducts / pageSize);

        res.render('userAllProducts',
            {
            product,
            currentPage: page,
            totalPages: totalPages,
            productCollection,
            sessionuser:req.session.isUser})
    }catch(error){
         console.log(error)
    }
}

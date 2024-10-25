import Product from '../../model/productModel.mjs'
import Category from '../../model/categoryModel.mjs'


export const userproductdetail = async (req, res,next) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id); 
        
        if (!product) {
            return res.status(404).send('Product not found');
        }

        console.log(product);
        const productCollection = await Category.find({ isActive: true });
        const relateproduct= await Product.find({isDeleted:false}).limit(4).skip(4);
        console.log(relateproduct);
        res.render('userproductdetail', { product,relateproduct,sessionuser:req.session.isUser,productCollection,query:req.query});
    } catch (error) {
        console.error(error);
        // res.status(500).send('Server Error');
        next(error)
    }
};



export const userproductview = async (req, res,next) => {
    try {
        const catid = req.query.category || ''; 
        const minPrice = parseFloat(req.query.minPrice) || 0; 
        const maxPrice = parseFloat(req.query.maxPrice) || 10000; 
        const type = req.query.type || ''; 
        const sortstyle = req.query.sortstyle || ''; 

        const page = parseInt(req.query.page) || 1;
        const pageSize = 12;
        const skip = (page - 1) * pageSize;

        let product;
        let totalProducts;

        let sortCriteria = {};
        if (sortstyle === 'lowToHigh') {
            sortCriteria = { productPrice: 1 }; 
        } else if (sortstyle === 'highToLow') {
            sortCriteria = { productPrice: -1 }; 
        } else if (sortstyle === 'aToZ') {
            sortCriteria = { productName: 1 };
        } else if (sortstyle === 'zToA') {
            sortCriteria = { productName: -1 }; 
        } else if (sortstyle === 'recent') {
            sortCriteria = { createdAt: -1 }; 
        } else if (sortstyle === 'ratings') {
            sortCriteria = { ratings: -1 }; 
        }

        const query = {
            isDeleted: false,
            productPrice: { $gte: minPrice, $lte: maxPrice }
        };

        if (catid) {
            query.productCategory = catid;
        }

        if (type) {
            query.productType = type;
        }

        product = await Product.find(query)
            .populate('productCategory', 'categoryName')
            .sort(sortCriteria) 
            .skip(skip)
            .limit(pageSize);

        totalProducts = await Product.countDocuments(query);
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
    } catch (error) {
        console.log(error);
        next(error)
        // res.status(500).send('Internal Server Error'); // Handle error response
    }
};





export const userproductcategorywise= async(req,res,next )=>{
   try {
        const catid= req.params.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = 12
        const skip = (page - 1) * pageSize;

       
        const product = await Product.find({ isDeleted: false ,productCategory:catid})
            .populate('productCategory', 'categoryName')
            .skip(skip)
            .limit(pageSize);

       
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
            sessionuser:req.session.isUser,
            query:req.query})
    }catch(error){
         console.log(error)
         next(error)
    }
}





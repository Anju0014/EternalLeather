import bcrypt from "bcrypt";
import Category from "../../model/categoryModel.mjs";
import Order from "../../model/orderModel.mjs";
import moment from 'moment'
import Product from "../../model/productModel.mjs"

const adminEmail = process.env.ADMINEMAIL;
const adminPassword = process.env.ADMINPASSWORD;


export const admin = async (req, res,next) => {
  try {
    res.redirect("/admin/login");
  } catch (error) {
    console.error(`error from admin ${error}`);
    next(error)
  }
};

export const adminlogin = async (req, res,next) => {
  try {
    if (req.session.isAdmin) {
      res.redirect("/admin/home");
    } else {
      res.render("adminlogin", { message: req.flash() });
    }
  } catch (error) {
    console.error(`error from admin login ${error}`);
    next(error)
  }
};

export const adminverify = async (req, res,next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (email === adminEmail) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const passwordMatch = await bcrypt.compare(password, passwordHash);

      if (passwordMatch) {
        req.session.isAdmin = req.body.email;
        res.redirect("/admin/home");
      } else {
        req.flash("error", "Invalid Username or Password");
        res.redirect("/admin/login");
      }
    } else {
      req.flash("error", "Invalid Username or Password");
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(`error from admin verification ${error}`);
    next(error)
  }
};

export const adminhome = async (req, res,next) => {
  try {
    const orderCount = await Order.countDocuments(); 
    const productCollection = await Category.find({ isActive: true }); 
    const orders = await Order.find().select('totalPayablePrice createdAt');
    
    const revenueResult = await Order.aggregate([
      { 
          $match: {
              paymentStatus: 'Paid' 
          }
      },
      { $unwind: "$products" }, 
      { 
          $match: {
              "products.productstatus": { $nin: ['Cancelled', 'Returned'] } 
          }
      },
      { 
          $group: { 
              _id: null, 
              total: { 
                $sum: { 
                  $subtract: [
                      { $multiply: [ "$products.productprice", "$products.productquantity" ] }, 
                      { $ifNull: ["$products.couponDiscount", 0] } 
                  ]
              }
              } 
          } 
      }
  ]);

  
  const Revenue = revenueResult.length > 0 ? revenueResult[0].total.toFixed(2) : 0;

  const productCount = await Order.aggregate([
  { $unwind: "$products" }, 
  { 
      $match: {
          "products.productstatus": { $nin: ['Cancelled', 'Returned'] }, 
          
      }
  },
  { 
      $group: { 
          _id: null, 
          total: { $sum: "$products.productquantity" } 
      } 
  }
]);
const deliveredProductCountx = await Order.aggregate([
  { $unwind: "$products" }, 
  { 
      $match: {
          "products.productstatus": 'Delivered', 
          
      }
  }
]);
const deliveredProductCount=deliveredProductCountx.length
        
   const category= await Category.find();
  
 

const categoryProductCount=await Category.aggregate([
  {$match:{
    isActive:true
  }},
  {$lookup:{
    from:'products',
    localField:'_id',
    foreignField:'productCategory',
    as:'Products'
  }},
  {
    $addFields: {
      Products: {
        $filter: {
          input: '$Products',
          as: 'product',
          cond: { $eq: ['$$product.isDeleted', false] }
        }
      }
    }
  },
  {$project:{
    
    categoryName:1,
    productCount:{$size:'$Products'}
  }}
  
]);

const salesOfProducts = await Order.aggregate([
  { $unwind: "$products" },
  {
    $match: {
      productstatus: { $nin: ['Cancelled', 'Returned'] }  
    }
  },
  {
    $group: {
      _id: '$products.productId',  
      totalQuantity: { $sum: "$products.productquantity" } 
    }
  },
  { $sort: { totalQuantity: -1 } } ,
  
]);

const productId = salesOfProducts.map(value => value._id);

const products = await Product.find({ _id: { $in: productId } }). populate('productCategory', 'categoryName');

// let bestProducts = productId.map(id => products.find(product => product._id.toString() === id.toString()));
// console.log(bestProducts);
let bestProducts = productId.map(id => {
  const product = products.find(p => p._id.toString() === id.toString());
  const salesData = salesOfProducts.find(sale => sale._id.toString() === id.toString());
  
  return {
    ...product.toObject(),  
    totalQuantity: salesData ? salesData.totalQuantity : 0
  };
});

const freq={};
bestProducts.forEach(product => {
  const category = product.productCategory.categoryName; 

  if (freq[category]) {
      freq[category]++;
  } else {
      freq[category] = 1;
  }
});

const sortedCategories = Object.entries(freq).sort((a, b) => b[1] - a[1]);
const bestCategories = sortedCategories.slice(0, 5);
bestCategories.forEach(([category, count]) => {
  console.log(`Category: ${category}, Sales: ${count}`);
});


bestProducts=bestProducts.slice(0, 5); 


    res.render("adminDashboard",{
      Revenue,
      productCollection,
      productCount: productCount[0]?.total || 0, 
      orderCount,
      orders,
      products:bestProducts,
      bestCategories,
      deliveredProductCount,
      categoryProductCount,
      
    });
  } catch (error) {
    console.log(`error from admin home ${error}`);
    next(error)
  }
};




export const admindashBoardFilter= async (req,res,next)=>{
  try{
    const {filter}= req.body;
    console.log(filter);
    let dateRange = getDateRange(filter);
    console.log(dateRange)
    const filteredOrders = await Order.find(dateRange).select('totalPayablePrice createdAt');
    console.log(filteredOrders);
    res.json({'success':true,filteredOrders})

  }catch(error){
    console.log("Error in updating the graph filter",error)
    next(error)
  }
}

export const adminlogout = async (req, res,next) => {
  try {
    req.session.destroy();
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

const getDateRange = (filter) => {
  const now = moment();
  let dateRange = {};
  console.log(filter)
  if (filter === 'thisYear') {
      dateRange = {
          createdAt: {
              $gte: now.startOf('year').toDate(),
              $lte: now.endOf('year').toDate()
          }
      };
  } else if (filter === 'thisMonth') {
      dateRange = {
          createdAt: {
              $gte: now.startOf('month').toDate(),
              $lte: now.endOf('month').toDate()
          }
      };
  } else if (filter === 'thisWeek') {
      dateRange = {
          createdAt: {
              $gte: now.startOf('week').toDate(),
              $lte: now.endOf('week').toDate()
          }
      };
  }else if (filter === 'thisDay') {
      dateRange = {
          createdAt: {
              $gte: now.startOf('day').toDate(),   
              $lte: now.endOf('day').toDate()      
          }
      };
  } else{
    dateRange={}
  }
  console.log(dateRange)

  return dateRange;
};
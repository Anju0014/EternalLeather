import bcrypt from "bcrypt";
import Category from "../../model/categoryModel.mjs";
import Order from "../../model/orderModel.mjs";
import moment from 'moment'
import Product from "../../model/productModel.mjs"

const adminEmail = "anjum1495pkr@gmail.com";
const adminPassword = "anjuanju";


export const admin = async (req, res) => {
  try {
    res.redirect("/admin/login");
  } catch (error) {
    console.error(`error from admin ${error}`);
    next(error)
  }
};

export const adminlogin = async (req, res) => {
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

export const adminverify = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (email === adminEmail) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const passwordMatch = await bcrypt.compare(password, passwordHash);

      if (passwordMatch) {
        // req.session.isAdmin = true;
        req.session.isAdmin = req.body.email;
        res.redirect("/admin/home");
      } else {
        req.flash("error", "Invalid Username or Password");
        res.redirect("/admin/login");
        //res.render('adminlogin',{message:"Invalid Username or Password"});
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

// export const adminhome = async (req, res) => {
//   try {
//     if (!req.session.isAdmin) {
//       return res.redirect("/admin");
//     }


//     const orderCount = await Order.countDocuments(); // Total number of orders
//     const productCollection = await Category.find({ isActive: true }); // Active product categories


//         const revenueResult = await Order.aggregate([
//           { $unwind: "$products" }, // Deconstruct products array
//           { 
//               $match: {
//                   "products.productstatus": { $in: ['Shipped', 'Delivered'] }, // Filter by product status
                 
//               }
//           },
//           { 
//               $group: { 
//                   _id: null, 
//                   total: { $sum: "$products.productprice" } // Calculate total price from products
//               } 
//           }
//       ]);

        
//    const category= await Category.find();
//    console.log(category)



//     res.render("adminDashboard");
//   } catch (error) {
//     console.log(`error from admin home ${error}`);
//     next(error)
//   }
// };

export const adminhome = async (req, res,next) => {
  try {
    if (!req.session.isAdmin) {
      return res.redirect("/admin");
    }


    const orderCount = await Order.countDocuments(); 
    const productCollection = await Category.find({ isActive: true }); 
    const orders = await Order.find().select('totalPayablePrice createdAt');
    // const orders=await Order.find();
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
  {$project:{
    
    categoryName:1,
    productCount:{$size:'$Products'}
  }}
  
]);

console.log("loooolloollooo");

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

console.log("hoooooohiiii")
// console.log(salesOfProducts)
const productId = salesOfProducts.map(value => value._id);

const products = await Product.find({ _id: { $in: productId } }). populate('productCategory', 'categoryName');


let bestProducts = productId.map(id => products.find(product => product._id.toString() === id.toString()));
// console.log(bestProducts);

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
console.log("llalla")
// console.log(salesOfCategory)
// console.log(categoryProductCount);
// console.log("hoooooohiiii")

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
    console.log("reached.....reached...................")
    // console.log(req.body)
    const {filter}= req.body;
    console.log(filter);
    console.log("........")
    let dateRange = getDateRange(filter);
    console.log("{/////////}")

   console.log(dateRange)

    const filteredOrders = await Order.find(dateRange).select('totalPayablePrice createdAt');
    
   
    console.log(filteredOrders);
    res.json({'success':true,filteredOrders})

  }catch(error){
    console.log("Error in updating the graph filter",error)
    next(error)
  }
}

export const adminlogout = async (req, res) => {
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
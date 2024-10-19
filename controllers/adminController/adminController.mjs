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


    const orderCount = await Order.countDocuments(); // Total number of orders
    const productCollection = await Category.find({ isActive: true }); // Active product categories
    const orders = await Order.find().select('totalPayablePrice createdAt');
    // const orders=await Order.find();
    const revenueResult = await Order.aggregate([
      { 
          $match: {
              paymentStatus: 'Paid' // Only include orders with paymentStatus as 'Paid'
          }
      },
      { $unwind: "$products" }, // Deconstruct products array
      { 
          $match: {
              "products.productstatus": { $nin: ['Cancelled', 'Returned'] } // Filter by product status
          }
      },
      { 
          $group: { 
              _id: null, 
              total: { 
                $sum: { 
                  $subtract: [
                      { $multiply: [ "$products.productprice", "$products.productquantity" ] }, // productprice * productquantity
                      { $ifNull: ["$products.couponDiscount", 0] } // Subtract couponDiscount
                  ]
              }
              } // Calculate total as productprice - couponDiscount
          } 
      }
  ]);

  
  const Revenue = revenueResult.length > 0 ? revenueResult[0].total.toFixed(2) : 0;

  const productCount = await Order.aggregate([
  { $unwind: "$products" }, // Deconstruct products array
  { 
      $match: {
          "products.productstatus": { $nin: ['Cancelled', 'Returned'] }, // Filter by product status
          
      }
  },
  { 
      $group: { 
          _id: null, 
          total: { $sum: "$products.productquantity" } // Calculate total quantity
      } 
  }
]);
const deliveredProductCount = await Order.aggregate([
  { $unwind: "$products" }, // Deconstruct products array
  { 
      $match: {
          "products.productstatus": 'Delivered', // Match products that are delivered
          
      }
  }
]).length;
        
   const category= await Category.find();
  //  console.log(category)
 

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
// console.log("llalla")
// console.log(categoryProductCount);
// console.log("hoooooohiiii")

    res.render("adminDashboard",{
      Revenue,
      productCollection,
      productCount: productCount[0]?.total || 0, 
      orderCount,
      orders,
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


// const home = async (req, res) => {
//   try {
//       const orderCount = await orderSchema.countDocuments();
//       const userCount = await userSchema.countDocuments();

//       const revenueResult = await orderSchema.aggregate([
//           {
//               $match: {
//                   orderStatus: { $in: ['Shipped', 'Delivered'] }
//               }
//           },
//           {
//               $group: {
//                   _id: null,
//                   total: { $sum: "$totalPrice" }
//               }
//           }
//       ]);
//       const Revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

//       const product = await orderSchema.aggregate([
//           {
//               $group: {
//                   _id: null,
//                   total: { $sum: "$totalQuantity" }
//               }
//           }
//       ]);
//       const productCount = product.length > 0 ? product[0].total : 0;
//       // const productCount = await orderSchema.find({
//       //     orderStatus: { $in: ['Pending', 'Shipped', 'Delivered'] }
//       // }).count();
      

//       // Find the best seller
//       const productSale = await orderSchema.aggregate([
//           { $unwind: "$products" },
//           { $group: { _id: '$products.product_id', totalQuantity: { $sum: "$products.product_quantity" } } },
//           { $sort: { totalQuantity: -1 } }
//       ]);

//       const productId = productSale.map(sale => sale._id);

//       const products = await productSchema.find({ _id: { $in: productId } });

//       const bestProducts = productId.map(id => products.find(product => product._id.toString() === id.toString()));

//       const bestCategory = new Map();
//       bestProducts.forEach(element => {
//           if (element && element.productCollection) {
//               if (bestCategory.has(element.productCollection)) {
//                   bestCategory.set(element.productCollection, bestCategory.get(element.productCollection) + 1);
//               } else {
//                   bestCategory.set(element.productCollection, 1);
//               }
//           }
//       });

//       res.render('admin/home', {
//           title: "Home",
//           orderCount,
//           userCount,
//           Revenue,
//           productCount,
//           bestProducts,
//           bestCategory
//       });
//   } catch (error) {
//       console.log(`error from home ${error}`);
//   }
// };

// const salesChart = async (req,res)=>{
//   try {
//       const orders = await orderSchema.find({
//           orderStatus: { $in: ['Pending','Shipped','Delivered'] }
//       });

//       let salesData = Array.from({ length: 12 }, () => 0);
//       let revenueData = Array.from({ length: 12 }, () => 0);
//       let productsData = Array.from({ length: 12 }, () => 0);

//       orders.forEach(order => {
//           const month = order.createdAt.getMonth();
//           revenueData[month] += order.totalPrice;
//           for(product of order.products){
//               productsData[month] += order.totalQuantity;
//           }
//       });

//       const Orders = await orderSchema.find({})

//       Orders.forEach(order => {
//           const month = order.createdAt.getMonth();
//           salesData[month]++
//       })

//       res.json({
//           salesData,
//           revenueData,
//           productsData
//       });
//   } catch (error) {
//       console.error('Error fetching data:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//   }
// }




// function applyFilter(filterValue,orders) {
//   const now = new Date();
//   let filteredOrders = [];

//   switch (filterValue) {
//       case 'thisDay':
//           filteredOrders = orders.filter(order => {
//               const orderDate = new Date(order.createdAt);
//               return orderDate.toDateString() === now.toDateString();
//           });
//           break;

//       case 'thisWeek':
//           const firstDayOfWeek = new Date(now);
//           firstDayOfWeek.setDate(now.getDate() - now.getDay());
//           filteredOrders = orders.filter(order => {
//               const orderDate = new Date(order.createdAt);
//               return orderDate >= firstDayOfWeek && orderDate <= now; // Include today's orders
//           });
//           break;

//       case 'thisMonth':
//           filteredOrders = orders.filter(order => {
//               const orderDate = new Date(order.createdAt);
//               return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
//           });
//           break;

//       case 'thisYear':
//           filteredOrders = orders.filter(order => {
//               const orderDate = new Date(order.createdAt);
//               return orderDate.getFullYear() === now.getFullYear();
//           });
//           break;

//       default:
//           // Show all orders
//           filteredOrders = orders;
//           break;
//   }
//   return filteredOrders;
// }



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
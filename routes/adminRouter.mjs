import express from "express";
const admin_router=express();

import { admin, admindashBoardFilter, adminhome, adminlogin, adminlogout, adminverify } from "../controllers/adminController/adminController.mjs";
import isAdmin from "../middleware/adminsession.mjs";
import { admincategory, admincategoryAdd, admincategoryaddform, admincategorydelete, admincategoryeditform, admincategorypost, admincategorysearch, admincategoryupdate, check } from "../controllers/adminController/categoryController.mjs";
import { adminproduct, adminproductadd, adminproductaddform, adminproductdelete, adminproducteditform, adminproductsearch, adminproductupdate, pst } from "../controllers/adminController/productController.mjs";
import { upload } from "../config/cloudinaryConfig.mjs";
import { adminuserget, adminuserpost, adminusersearch } from "../controllers/adminController/userController.mjs";
import { adminorderCancel, adminorders, adminorderupdate } from "../controllers/adminController/orderController.mjs";
import { adminCoupon, adminCouponAdd, adminCouponAddform, adminCouponStatus } from "../controllers/adminController/couponController.mjs";
import { adminOffer, adminOfferAdd, adminOfferAddform, adminOfferDelete } from "../controllers/adminController/offerController.mjs";
import { adminSales, downloadSalesExcel, downloadSalesPdf } from "../controllers/adminController/salesController.mjs";


// admin_router.use(express.json());
// admin_router.use(express.urlencoded({extended:true}));
admin_router.set('view engine','ejs');
admin_router.set('views','./views/admin');

// admin_router.use(express.static('public'));

admin_router.get('/try',check)
admin_router.get('/',admin)
admin_router.get("/login",adminlogin);
admin_router.post("/login",adminverify);
admin_router.get("/home",adminhome);
admin_router.post("/home/filter",admindashBoardFilter)

admin_router.get("/category",isAdmin, admincategory);
admin_router.get("/category/add",isAdmin,admincategoryaddform);
admin_router.post("/category/add",isAdmin, admincategoryAdd);
admin_router.get("/category/edit/",isAdmin, admincategoryeditform);
admin_router.post("/category/edit",isAdmin, admincategoryupdate);
admin_router.get("/category/delete",isAdmin, admincategorydelete);
admin_router.post("/category/search",isAdmin,admincategorysearch);
admin_router.post("/category/:id/toggle-block",isAdmin, admincategorypost);

admin_router.get('/getform',pst)
//admin_router.post('/getform',adminproductadd)
admin_router.get("/user",isAdmin,adminuserget);
admin_router.post('/user/search',isAdmin,adminusersearch)
admin_router.post("/users/:id/toggle-block",isAdmin, adminuserpost);
admin_router.get("/product",isAdmin,adminproduct);
admin_router.get('/products', isAdmin,adminproduct); //page

admin_router.get('/product/add',upload.none(),isAdmin,adminproductaddform);
admin_router.post('/product/add', isAdmin,adminproductadd);

admin_router.get("/product/edit",isAdmin,adminproducteditform);
admin_router.put("/product/edit",isAdmin,adminproductupdate);
admin_router.get("/product/delete",isAdmin,adminproductdelete);
admin_router.post("/product/search",isAdmin,adminproductsearch);

admin_router.get("/order",isAdmin,adminorders)
admin_router.get("/order/cancel",isAdmin,adminorderCancel);
admin_router.post("/order/:id/toggle-block",isAdmin, adminorderupdate);
// admin_router.post("/category/add",admincategoryAdd);


admin_router.get("/coupon",isAdmin,adminCoupon)
admin_router.get("/coupon/add",isAdmin,adminCouponAddform)
admin_router.post("/coupon/add",isAdmin,adminCouponAdd)
admin_router.post("/coupon/:id/toggle-block",isAdmin, adminCouponStatus);

admin_router.get("/sales",isAdmin,adminSales)
admin_router.get("/sales/downloadExcel",isAdmin,downloadSalesExcel)
admin_router.get("/sales/downloadPdf",isAdmin,downloadSalesPdf)


admin_router.get("/offer",isAdmin,adminOffer)
admin_router.get("/offer/add",isAdmin,adminOfferAddform)
admin_router.post("/offer/add",isAdmin,adminOfferAdd)
admin_router.get("/offer/delete",isAdmin,adminOfferDelete);

admin_router.get("/logout",adminlogout);


export default  admin_router


import express from "express";
const admin_router=express();

import { admin, adminhome, adminlogin, adminlogout, adminverify } from "../controllers/adminController/adminController.mjs";
import isAdmin from "../middleware/adminsession.mjs";
import { admincategory, admincategoryAdd, admincategoryaddform, admincategorydelete, admincategoryeditform, admincategorysearch, admincategoryupdate, check } from "../controllers/adminController/categoryController.mjs";
import { adminproduct, adminproductadd, adminproductaddform, adminproductdelete, adminproducteditform, adminproductsearch, adminproductupdate, pst } from "../controllers/adminController/productController.mjs";
import { upload } from "../config/cloudinaryConfig.mjs";
import { adminuserget, adminuserpost } from "../controllers/adminController/userController.mjs";


admin_router.use(express.json());
admin_router.use(express.urlencoded({extended:true}));
admin_router.set('view engine','ejs');
admin_router.set('views','./views/admin');

admin_router.use(express.static('public'));

 admin_router.get('/try',check)
admin_router.get('/',admin)
admin_router.get("/login",adminlogin);
admin_router.post("/login",adminverify);
admin_router.get("/home",adminhome);

admin_router.get("/category",isAdmin, admincategory);
admin_router.get("/category/add",isAdmin,admincategoryaddform);
admin_router.post("/category/add",isAdmin, admincategoryAdd);
admin_router.get("/category/edit/",isAdmin, admincategoryeditform);
admin_router.post("/category/edit",isAdmin, admincategoryupdate);
admin_router.get("/category/delete",isAdmin, admincategorydelete);
admin_router.post("/category/search",isAdmin,admincategorysearch);

admin_router.get('/getform',pst)
//admin_router.post('/getform',adminproductadd)
admin_router.get("/user",adminuserget);
admin_router.post("/users/:id/toggle-block", adminuserpost);
admin_router.get("/product",adminproduct);
admin_router.get('/products', adminproduct);

admin_router.get("/product/add",upload.none(),adminproductaddform);
admin_router.post('/product/add', adminproductadd);

admin_router.get("/product/edit",adminproducteditform);
admin_router.post("/product/edit",adminproductupdate);
admin_router.get("/product/delete",adminproductdelete);
admin_router.post("/product/search",adminproductsearch);


// admin_router.post("/category/add",admincategoryAdd);

admin_router.get("/logout",adminlogout);


export default  admin_router


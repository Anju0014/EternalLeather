import express from "express";
const admin_router=express();
import { admin, adminhome, adminlogin, adminverify } from "../controllers/adminController/adminController.mjs";
import isAdmin from "../middleware/adminsession.mjs";
import { admincategory, admincategoryAdd, admincategoryaddform } from "../controllers/adminController/categoryController.mjs";


admin_router.use(express.json());
admin_router.use(express.urlencoded({extended:true}));
admin_router.set('view engine','ejs');
admin_router.set('views','./views/admin');

admin_router.use(express.static('public'));


admin_router.get('/',admin)
admin_router.get("/login",adminlogin);
admin_router.post("/login",adminverify);
admin_router.get("/home",adminhome);
admin_router.get("/category",admincategory);
admin_router.get("/category/add",admincategoryaddform);
admin_router.post("/category/add",admincategoryAdd);


export default  admin_router


import express from "express"
import connectDB from "./config/db.mjs"
import dotenv from "dotenv"
import flash from "connect-flash"
import userroute from "./routes/userRouter.mjs"
import adminroute from "./routes/adminRouter.mjs"
import productroute from "./routes/productRouter.mjs"
import session from "express-session"
import nocache from "nocache"
import path from "path"
import passport from "passport"
import "./config/google.mjs"
import "./config/cloudinaryConfig.mjs"



dotenv.config();

const app=express();
const port=process.env.PORT||3001


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs');
app.use(flash());
app.use(express.static(path.resolve('public')));



app.use(nocache());
app.use(session({
    secret:'dream',
    resave:false,
    saveUnintialized:true,
}))


app.use(passport.initialize());
app.use(passport.session());

app.use('/admin/product',productroute)
app.use('/admin',adminroute); 
app.use('/', userroute);


connectDB();

app.listen(port,(error)=>{
    if(error){
        console.log("Error connecting to port")
    }else{
    console.log(`Server is running at port ${port}`)}
})




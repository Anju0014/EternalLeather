import mongoose from "mongoose"
import addressSchema from "./addressModel.mjs";


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
    },
   address:[{
        type: addressSchema,
       
    }],
    isVerified:{
        type:Boolean,
        default:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    phoneno:{
        type:Number
    },
    otp:{
        type:Number
    },
    otpExpires:{
        type:String
    },
    googleID:{
        type:String
    },
    facebookID: {
        type: String
    }
},{timestamps: true})
export default mongoose.model('user',userSchema)
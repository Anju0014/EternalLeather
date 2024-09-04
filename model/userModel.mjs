import mongoose from "mongoose"
import address from "./addressModel.mjs";


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
        required:true
    },
   address:{
        type: [address],
        default: [],
        required:false
       
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isBlocked:{
        type:Boolean
    },
    phoneno:{
        type:Number
    },
    otp:{
        type:Number
    },
    otpExpires:{
        type:String
    }
    
});
export default mongoose.model('user',userSchema)
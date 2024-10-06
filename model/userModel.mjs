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
    },
    couponsUsed: [
        {
            couponId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Coupon',
                required: true
            },
            usageCount: {
                type: Number,
                default: 1
            },
            lastUsed: {
                type: Date,
                default: Date.now
            }
        }
    ]
},{timestamps: true})
export default mongoose.model('user',userSchema)
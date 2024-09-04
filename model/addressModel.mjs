import mongoose from "mongoose"


const addressSchema=new mongoose.Schema({
    contactname:{
        type:String,
    },
    country:{
        type:String,
        required:true
    },
    Building:{
        type:String,
        required:true
    },
    street:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    landMark:{
        type:String,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    phoneno:{
        type:Number
    }
    
});
export default addressSchema
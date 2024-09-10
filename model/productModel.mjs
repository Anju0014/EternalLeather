import mongoose from 'mongoose'


const productSchema = new mongoose.Schema({
    productName:{
        type: String,
        required: true
    },
    productPrice:{
        type:Number,
        required: true
    },
    productDescription:{
        type: String,
        required:true
    },
    productAdddate:{
        type:String
    },
    productQuantity:{
        type: Number,
        required: true
    },
    productColour:{
        type:String
    },
    productDiscount:{
        type:Number,
    },
    productCategory: {
        type: String,
        //required: true
    },
    productImages: {
        type: Array,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    deletedAt:{
        type:Date
    }
},{ timestamps:true });

export default  mongoose.model("product",productSchema)
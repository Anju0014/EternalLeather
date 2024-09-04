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
    productQuantity:{
        type: Number,
        required: true
    },
    productDiscount:{
        type:Number,
    },
    productCategory: {
        type: String,
        required: true
    },
    productImage: {
        type: Array,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
},{ timestamps:true });

export default  mongoose.model("product",productSchema)
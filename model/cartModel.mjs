
import mongoose from 'mongoose'

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[{
        productId: {
           type: mongoose.Schema.Types.ObjectId,
           ref:'Product',
           required: true
        },
        productCount : {
            type: Number,
            default: 1
        },
        productPrice:{
            type:Number,
            required:true
        },
        discountPrice:{
            type:Number,
            default:0
        }
    }],
    totalPrice:{
        type:Number,
        default:0
    },
    payablePrice:{
        type:Number,
        default:0
    },
 
  
},{ timestamps: true })

export default mongoose.model('Cart',cartSchema)



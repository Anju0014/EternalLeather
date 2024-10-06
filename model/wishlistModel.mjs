import mongoose from 'mongoose'

const wishListSchema = mongoose.Schema({
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
    }],
  
},{ timestamps: true })

export default mongoose.model('WishList',wishListSchema)



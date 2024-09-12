import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    productDescription: {
        type: String,
        required: true
    },
    productAdddate: {
        type: Date  // Changed from String to Date
    },
    productQuantity: {
        type: Number,
        required: true
    },
    productColor: {
        type: String  // Changed from Date to String
    },
    productDiscount: {
        type: Number
    },
    productType: {
        type: String
    },
    productReviews: {
        type: [String]
    },
    productCategory: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true
    },
    productImages: {
        type: Array,  
        required: true
    },
    ratings: {
        type: Number,
        default: 5
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }
}, { timestamps: true });  

export default mongoose.model("Product", productSchema);

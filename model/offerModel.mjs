
import mongoose from 'mongoose'

// const offerSchema = mongoose.Schema({
//     offerName: {
//         type: String,
//         required: true,
//       },
//       offerType: { 
//         type: mongoose.Schema.Types.ObjectId, 
//         ref: 'Category', // Assuming you have a Category model
//         required: true
//       },
//       discountPercentage: {
//         type: Number,
//         required: true,
//         min: 0,   // Minimum discount is 0%
//         max: 95  // Maximum discount is 100%
//       },
//       isActive: {
//         type: Boolean,
//         default: true
//       }
  
// },{ timestamps: true })
const offerSchema = mongoose.Schema({
  offerName: {
      type: String,
      required: true,
  },
  offerType: {
      type: String,
      enum: ['category', 'product'], 
      required: true,
  },
  categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', 
  },
  productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', 
  },
  discountPercentage: {
      type: Number,
      required: true,
      min: 0,   
      max: 95   
  },
  isActive: {
      type: Boolean,
      default: true
  }
}, { timestamps: true });



export default mongoose.model('Offer',offerSchema)
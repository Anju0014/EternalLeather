import mongoose from 'mongoose'

const categorySchema = mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    isActive : {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false, 
      },
  
    
},{ timestamps: true })

export default mongoose.model('Category',categorySchema)

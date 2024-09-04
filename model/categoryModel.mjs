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
    addDate:{
        type:String
    }
  
    
},{ timestamps: true })

export default mongoose.model('category',categorySchema)

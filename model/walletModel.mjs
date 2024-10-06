import mongoose from 'mongoose'

const walletSchema = mongoose.Schema({
    userID :{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    balance:{
        type : Number,
        default: 0
    },
    transaction:[{
        walletAmount :{
            type : Number,
            default: 0
        },
        orderId:{
            type: String
        },
        transactionType:{
            type: String,
            enum:['Credited','Debited']
        },
        transactionDate:{
            type:Date,
            required: true,
            default:Date.now()
        }
    }]
}, {timestamps: true})

export default mongoose.model('Wallet',walletSchema)

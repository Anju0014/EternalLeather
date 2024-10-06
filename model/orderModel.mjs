import mongoose from "mongoose"


const orderSchema = new mongoose.Schema({
    customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
    },
    orderId: {
        type: String,
        unique:true,
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId ,
            ref:"Product"
        },
        productname: {
            type: String
        },
        productcategory: {
            type: String
        },
        productquantity: {
            type: Number
        },
        productprice: {
            type: Number
        },
        productdiscount: {
            type: Number
        },
        productimage: {
            type: String
        },
        productstatus: {
            type: String,
            enum:['Confirmed', 'Pending', 'Delivered', 'Returned', 'Cancelled'],
            default:'Pending'
        },
        isproductCancelled:{
            type: Boolean,
            default: false
        }
    }],
    totalQuantity: {
        type: Number
    },
    totalPrice: {
        type: Number
    },
    totalPayablePrice:{
        type:Number
    },
    address: {
        customerName: String,
        customerEmail: String,
        building: String,
        street: String,
        city: String,
        country: String,
        pincode: Number,
        phonenumber:Number,
        landMark:String
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash On Delivery','razorpay', 'Wallet']
    },
    paymentId: {
        type: String,
        required: false
    },
    paymentStatus:{
        type:String,
        required: false
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    returnReason:{
        type:String,
    },
    orderStatus: {
        type: String,
        enum:['Pending', 'Shipped', 'Confirmed', 'Delivered', 'Cancelled', 'Returned']
        
    },
    deliveredDate:{
        type:Date,
    },
    returnedDate:{
        type:Date,
    },
    couponApplied: {
        type: String, 
        default: null 
    },
    discountApplied: {
        type: Number, 
        default: 0 
    }
},{timestamps:true})


export default mongoose.model("Order", orderSchema);
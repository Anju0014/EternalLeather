import mongoose from "mongoose"
import dotenv from  "dotenv"

dotenv.config();

const connectDB= async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        //  console.log(process.env.MONGO_URL)
        console.log("Mongodb connected");
    } catch(error){
        console.log("Error Connecting DB")
        console.log(error.message)
    }

}

export default connectDB
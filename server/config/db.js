import mongoose from "mongoose";
import dotenv from "dotenv";
export const connectDb = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected");
    }catch(e){
        console.log(e.message);
        process.exit(1);
    }
}
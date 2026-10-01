import dns from "dns";
import mongoose from "mongoose"
import dotenv from "dotenv"

dns.setServers(["8.8.8.8", "1.1.1.1"]);
export const connectDB = async() =>{
    try {
        //mongoose.connect("url")
        await mongoose.connect(process.env.MONGO_URI)
        .then(()=> console.log("MongoDB Connection Successfull"))
        
    } catch (error) {
        console.error("Error connecting MongoDB", error)  
        process.exit(1) 
    }
}
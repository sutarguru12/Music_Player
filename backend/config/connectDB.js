import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected Successfully");
  } catch (error) {
    console.error("mongoDB connection error : ", error.message);
    // process.exit(1);
  }
};

export default connectDB;

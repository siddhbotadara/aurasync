import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB Connected");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
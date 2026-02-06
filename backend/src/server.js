import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import {connectDB} from "./config/db.js";

const start = async () => {
    await connectDB();

    console.log("GEMINI_ENDPOINT =", process.env.GEMINI_ENDPOINT); // DEBUG
    console.log("GEMINI_ENDPOINT =", process.env.ONBOARDING_API); // DEBUG

    const PORT = process.env.PORT || 3000;
    try {
        await app.listen({port: PORT});
        console.log(`Server listening on port ${PORT}`);
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    } 

};

start();
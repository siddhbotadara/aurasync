import app from "./app.js";
import {connectDB} from "./config/db.js";

const start = async () => {
    await connectDB();

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
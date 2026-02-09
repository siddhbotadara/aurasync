import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const start = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 3000;

    await app.listen({
      port: PORT,
      host: "0.0.0.0"
    });

    console.log(`Server listening on port ${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
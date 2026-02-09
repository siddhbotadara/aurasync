import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import onboardingRoutes from "./routes/onboarding.routes.js";
import assistRoutes from "./routes/assist.route.js";
import audioRoutes from "./routes/audio.routes.js";
import cors from '@fastify/cors' 
import mermaidRoutes from "./routes/mermaid.routes.js";

const app = Fastify({
  logger:true,
  ignoreTrailingSlash:true,
  bodyLimit: 20 * 1024 * 1024
});

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    // Allow Vercel frontend
    if (origin.includes("vercel.app")) {
      return cb(null, true);
    }

    // Allow Render
    if (origin.includes("onrender.com")) {
      return cb(null, true);
    }

    // Allow local dev
    if (origin === "http://localhost:5173") {
      return cb(null, true);
    }

    // Allow Chrome extension
    if (origin.startsWith("chrome-extension://")) {
      return cb(null, true);
    }

    cb(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
});

app.register(audioRoutes, { prefix: process.env.ROUTE_API});
app.register(onboardingRoutes, {prefix: process.env.ROUTE_API});
app.register(assistRoutes, { prefix: process.env.ROUTE_API});
app.register(mermaidRoutes, { prefix: process.env.ROUTE_API});

export default app;
import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import onboardingRoutes from "./routes/onboarding.routes.js";
import assistRoutes from "./routes/assist.route.js";
import audioRoutes from "./routes/audio.routes.js";
import cors from '@fastify/cors' 

const app = Fastify({
  logger:true,
  ignoreTrailingSlash:true,
  bodyLimit: 20 * 1024 * 1024
});

await app.register(cors, {
  origin: (origin, cb) => {
    // allow requests with no origin (like curl, Postman)
    if (!origin) return cb(null, true)

    // allow website
    if (origin === 'http://localhost:5173') {
      return cb(null, true)
    }

    // allow chrome extensions
    if (origin.startsWith('chrome-extension://')) {
      return cb(null, true)
    }

    return cb(new Error('Not allowed by CORS'), false)
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
})

app.register(audioRoutes, { prefix: process.env.ROUTE_API});
app.register(onboardingRoutes, {prefix: process.env.ROUTE_API});
app.register(assistRoutes, { prefix: process.env.ROUTE_API});

export default app;
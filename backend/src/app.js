import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import onboardingRoutes from "./routes/onboarding.routes.js";
import cors from '@fastify/cors' 

const app = Fastify({logger:true});

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

app.register(onboardingRoutes, {prefix: process.env.ONBOARDING_API});

export default app;
import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import onboardingRoutes from "./routes/onboarding.routes.js";
import cors from '@fastify/cors' 

const app = Fastify({logger:true});

await app.register(cors, {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS']
})

app.register(onboardingRoutes, {prefix: process.env.ONBOARDING_API});

export default app;
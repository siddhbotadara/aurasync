import { createOnboardingProfile } from "../controllers/onboarding.controllers.js";

export default async function onboardingRoutes(app){
    app.post("/onboarding", createOnboardingProfile)
}
import { randomUUID } from "crypto";
import UserProfile from "../models/UserProfile.js";

export const createOnboardingProfile = async (request, reply) => {
  console.log("📥 BODY RECEIVED:", request.body);
  try {
    const {
      comprehensionBreak,
      learningPreference,
      listeningThought,
      struggleNote,
      uiPreferences
    } = request.body;

    const profile = new UserProfile({
      profileId: randomUUID(),
      onboarding: {
        comprehensionBreak,
        learningPreference,
        listeningThought,
        struggleNote
      },
      uiPreferences
    });
    
    await profile.save();

    reply.code(201).send({
      success: true,
      profileId: profile.profileId
    });
  } catch (error) {
    console.error("❌ Onboarding save error:", error);

    reply.code(500).send({
      success: false,
      message: error.message || "Failed to create onboarding profile"
    });
  }
};

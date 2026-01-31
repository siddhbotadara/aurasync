import { randomUUID } from "crypto";
import UserProfile from "../models/UserProfile.js";

export const createOnboardingProfile = async (request, reply) => {
  try {
    const {
      comprehensionBreak,
      learningPreference,
      struggleNote,
      uiPreferences
    } = request.body;

    const profile = new UserProfile({
      profileId: randomUUID(),
      onboarding: {
        comprehensionBreak,
        learningPreference,
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
    reply.code(500).send({
      success: false,
      message: "Failed to create onboarding profile"
    });
  }
};

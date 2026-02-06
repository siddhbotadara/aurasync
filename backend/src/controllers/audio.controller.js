import { transcribeAudio } from "../services/transcribe.service.js";
import { processWithGemini } from "../services/gemini.service.js";

export async function handleAudio(req, reply) {
  const { audio, mimeType, userProfile } = req.body;

  console.log("BODY RECEIVED:", {
    hasAudio: !!req.body.audio,
    hasUserProfile: !!req.body.userProfile,
    hasOnboarding: !!req.body.userProfile?.onboarding
  });


  if (!audio || !userProfile) {
    return reply.code(400).send({ error: "Missing audio or user profile" });
  }

  // 1️⃣ Audio → Text (Gemini 2.5 Flash)
  const transcript = await transcribeAudio({
    base64Audio: audio,
    mimeType,
  });

  // 2️⃣ Text → Your existing Gemini 3 logic
  const aiResult = await processWithGemini({
    text: transcript,
    userProfile,
  });

  return {
    transcript,
    aiResult,
  };
}

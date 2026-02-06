import { processNativeAudio } from "../services/geminiAudio.service.js";
import { processWithGemini } from "../services/gemini.service.js";

export async function handleAudio(req, reply) {
  const { audio, mimeType, userProfile } = req.body;

  if (!audio || !userProfile?.onboarding) {
    return reply.code(400).send({ error: "Missing audio or user profile" });
  }

  // 1️⃣ Native audio understanding (Gemini 2.5 Flash)
  const spokenText = await processNativeAudio({
    base64Audio: audio,
    mimeType,
  });

  // 2️⃣ APD structured response (Gemini 3)
  const aiResult = await processWithGemini({
    text: spokenText,
    userProfile,
  });

  return {
    transcript: spokenText,
    aiResult,
  };
}

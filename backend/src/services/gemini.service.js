import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_SIDDH_API_1
});


export async function processWithGemini({ text, userProfile }) {
  const { onboarding } = userProfile;

  const prompt = `
You are an accessibility AI for users with Auditory Processing Disorder.

USER PROFILE:
- Comprehension issue: ${onboarding.comprehensionBreak}
- Learning preference: ${onboarding.learningPreference}
- Listening issue: ${onboarding.listeningThought}
- User struggle note: "${onboarding.struggleNote || "None"}"

Return ONLY valid JSON:
{
  "simplified": "",
  "keyPoints": [],
  "steps": [],
  "flags": {
    "complex_concept": false,
    "needs_visual": false
  }
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `${prompt}\n\nTRANSCRIPT:\n${text}` }]
      }
    ],
    config: {
      thinkingConfig: {
        thinkingLevel: "low" // low latency for real-time assist
      }
    }
  });

  const raw = response.text;

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error("❌ Gemini raw output:", raw);
    throw new Error("Invalid Gemini response");
  }

  return JSON.parse(match[0]);
}

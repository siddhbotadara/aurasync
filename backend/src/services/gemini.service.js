import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_SIDDH_API_2
});


export async function processWithGemini({ text, userProfile }) {
  const { onboarding } = userProfile;

  const prompt = `
You are an accessibility AI for users with Auditory Processing Disorder.

If the transcript contains instructions, procedures, or actions:
- Detect whether it has multiple steps
- Set flags.multi_step = true if more than one step exists
- Break the instructions into clear, short, numbered steps
- Each step must be simple and actionable
- Do NOT combine multiple actions into one step

IMPORTANT RULES:
- "simplified" must be a complete sentence by itself
- "simplified" must NOT reference steps, lists, numbers, or variables
- Do NOT append words like "undefined", "below", "following", or placeholders
- If steps exist, they MUST appear ONLY inside the "steps" array


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
    "needs_visual": false,
    "multi_step": false
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

  const result = JSON.parse(match[0]);

  // 🧼 HARD SANITIZATION (IMPORTANT)
  if (typeof result.simplified === "string") {
    result.simplified = result.simplified
      .replace(/\bundefined\b/gi, "")
      .replace(/\s+,/g, ",")
      .trim();
  }

  // 🧼 Normalize steps (remove numbering if Gemini added it)
  if (Array.isArray(result.steps)) {
    result.steps = result.steps.map(step =>
      typeof step === "string"
        ? step.replace(/^\d+[\).\s]+/, "").trim()
        : step
    );
  }

  console.log("BACKEND simplified →", JSON.stringify(result.simplified));
  return result;
}

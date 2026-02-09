import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_FINAL_KEY
});

export async function detectVisualIntent({ simplified, keyPoints }) {
  const prompt = `
You are classifying whether a visual diagram would meaningfully help understanding.

Answer with ONLY one word:
- FLOWCHART (causal, process, steps, progression)
- GRAPH (comparison, change, increase/decrease)
- NONE (emotional state, status update, opinion, isolated facts)

Text:
${simplified}

Key points:
${keyPoints.join("\n")}
`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const decision = (res.text || "").trim().toUpperCase();
  return ["FLOWCHART", "GRAPH", "NONE"].includes(decision)
    ? decision
    : "NONE";
}

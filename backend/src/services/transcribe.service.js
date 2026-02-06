import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_2_5, // different key
});

export async function transcribeAudio({ base64Audio, mimeType }) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Audio,
              mimeType, // "audio/webm" | "audio/wav"
            },
          },
          { text: "Transcribe this audio to plain text only." },
        ],
      },
    ],
  });

  return response.text.trim();
}

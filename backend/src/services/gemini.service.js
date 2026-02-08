import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_SIDDH_API_4
});

export async function processWithGemini({ text, userProfile }) {
  const { onboarding } = userProfile || {};

  const prompt = `
You are an accessibility AI for users with Auditory Processing Disorder (APD).

Your primary responsibility is to preserve meaning while improving clarity.
You MUST prioritize grammatical correctness over brevity.

────────────────────────────────
CRITICAL RULE — SIMPLIFIED SENTENCE
────────────────────────────────
You MUST generate the simplified sentence AFTER you decide key points and steps.

The simplified sentence MUST:
- Be ONE complete sentence
- Contain a clear subject and verb
- Be grammatically correct spoken English
- Be at least 12 words
- Preserve scientific meaning
- Sound like a calm teacher explaining

ABSOLUTELY FORBIDDEN:
- Keyword fragments
- Telegraphic speech
- Missing verbs
- Removed connectors (the, is, are, to, using)

If unsure, REPHRASE instead of shortening.

BAD: "Plants water air make oxygen"
GOOD: "Plants use sunlight to turn water and air into food and oxygen."

────────────────────────────────
CRITICAL RULE — SIMPLIFIED SENTENCE
────────────────────────────────
The "simplified" field MUST be a single, punchy summary of the entire transcript.
- MAX 30 words.
- ONE paragraph only.
- Explain the "gist" of the conversation so a user knows exactly what happened in seconds.

ABSOLUTELY FORBIDDEN:
- Providing a full transcript in the "simplified" field.
- Going over two sentences.

────────────────────────────────
KEY POINTS
────────────────────────────────
- Write 3–5 clear sentences
- Each point must be a full sentence
- Do not oversimplify into fragments

────────────────────────────────
STEPS (VERY STRICT)
────────────────────────────────
ONLY create steps if a human must FOLLOW actions in order.

DO NOT create steps for:
- Scientific explanations
- Natural processes
- How something works

Photosynthesis, respiration, digestion = NOT steps.

If no valid steps:
- steps must be []
- flags.multi_step = false

────────────────────────────────
HARD WORD DETECTION
────────────────────────────────
Detect technical or cognitively demanding words.

Rules:
- Lowercase keys
- Max 12 words explanation
- Explain the word, not the sentence
- Skip obvious words

────────────────────────────────
FLAGS
────────────────────────────────
- complex_concept → abstract or scientific
- needs_visual → diagrams help
- multi_step → ONLY if steps exist

────────────────────
VOCAL TONE DETECTION
────────────────────
Analyze the speaker's tone based on wording and context.

Detect ONE of the following per speaker segment:
- serious
- neutral
- joking
- sarcastic
- angry
- confused
- stressed

Rules:
- Do NOT guess wildly
- If unsure, use "neutral"
- Tone must match spoken intent, not topic
- Sarcasm ONLY if clearly implied by wording

Return tone per speaker segment.

────────────────────────────────
USER PROFILE (DO NOT IGNORE)
────────────────────────────────
Comprehension issue: ${onboarding?.comprehensionBreak || "unknown"}
Learning preference: ${onboarding?.learningPreference || "unknown"}
Listening issue: ${onboarding?.listeningThought || "unknown"}
User struggle note: "${onboarding?.struggleNote || "None"}"

────────────────────
SPEAKER & NOISE DETECTION (APD CRITICAL)
────────────────────

Analyze the transcript for speaker context.

If multiple speakers are clearly implied:
- Label speakers using roles, NOT names
- Examples: "Teacher", "Student", "Interviewer", "Speaker 1", "Speaker 2"

If and only if the conversation appears to be fictional or cinematic. For example, in movie then,
infer speaker roles consistently and label them.
If unsure, use Speaker A / Speaker B.

Rules:
- ONLY add speaker labels if context strongly suggests them
- Do NOT guess randomly
- Do NOT invent dialogue
- Do NOT split unless meaning improves clarity for APD users

If background noise, interruptions, or irrelevant chatter exists:
- Set noiseDetected = true
- Ignore noise in simplified output

Noise examples:
- Side conversations
- Laughter
- Mic disturbances
- Filler speech without meaning

────────────────────
JSON ADDITION
────────────────────

Add these optional fields:

"speakerSegments": [
  { "speaker": "", "text": "" }
],
"noiseDetected": false

────────────────────────────────
RETURN ONLY VALID JSON
────────────────────────────────
{
  "simplified": "",
  "keyPoints": [],
  "steps": [],
  "hardWords": {},
  "speakerSegments": [
    {
      "speaker": "Narrator",
      "text": "",
      "tone": "neutral"
    }
  ],
  "noiseDetected": false,
  "flags": {
    "complex_concept": false,
    "needs_visual": false,
    "multi_step": false
  }
}

FINAL CHECK BEFORE RESPONDING:
If the simplified sentence sounds broken when read aloud,
REWRITE IT before returning JSON.
`;

  async function callGeminiWithRetry(payload, retries = 2) {
    try {
      return await ai.models.generateContent(payload);
    } catch (err) {
      if (retries > 0 && err?.message?.includes("503")) {
        await new Promise(r => setTimeout(r, 1200));
        return callGeminiWithRetry(payload, retries - 1);
      }
      throw err;
    }
  }

  const response = await callGeminiWithRetry({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `${prompt}\n\nTRANSCRIPT:\n${text}` }]
      }
    ],
    config: {
      thinkingConfig: { thinkingLevel: "low" }
    }
  });

  const raw = response.text;
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error("❌ Gemini raw output:", raw);
    throw new Error("Invalid Gemini response");
  }

  const result = JSON.parse(match[0]);

  const ALLOWED_TONES = [
    "serious",
    "neutral",
    "joking",
    "sarcastic",
    "angry",
    "confused",
    "stressed"
  ];

  // 🧠 SPEAKER SANITY CHECK (CRITICAL)
  if (Array.isArray(result.speakerSegments)) {
    const uniqueSpeakers = new Set(
      result.speakerSegments.map(s => s.speaker)
    );

    // ❌ If only one speaker OR no clear turn-taking → disable speaker mode
    if (uniqueSpeakers.size < 2) {
      result.speakerSegments = [];
    }
  }


  // ─────────────────────────────
  // 🧼 STRONG POST-VALIDATION
  // ─────────────────────────────

  // Normalize arrays
  if (!Array.isArray(result.keyPoints)) result.keyPoints = [];
  if (!Array.isArray(result.steps)) result.steps = [];
  if (typeof result.hardWords !== "object" || Array.isArray(result.hardWords)) {
    result.hardWords = {};
  }

  // Normalize speakerSegments
  if (!Array.isArray(result.speakerSegments)) {
    result.speakerSegments = [];
  }

  result.speakerSegments = result.speakerSegments.filter(
    seg =>
      seg &&
      typeof seg.speaker === "string" &&
      typeof seg.text === "string" &&
      seg.text.trim().length > 0
  );

  // 🎭 Normalize tone per speaker (APD-safe)
  result.speakerSegments = result.speakerSegments.map(seg => ({
    speaker: seg.speaker || "Narrator",
    text: seg.text,
    tone: ALLOWED_TONES.includes(seg.tone) ? seg.tone : "neutral"
  }));


  // Normalize noiseDetected
  result.noiseDetected = Boolean(result.noiseDetected);

  // Enforce steps rule
  if (!result.flags?.multi_step) {
    result.steps = [];
  }

  // Simplified sentence validation
  if (typeof result.simplified === "string") {
    result.simplified = result.simplified
      .replace(/\bundefined\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  } else {
    result.simplified = "";
  }

  const simplifiedWords = result.simplified.split(" ").length;
  const hasVerb = /\b(is|are|was|were|use|uses|make|makes|turn|turns|take|takes|produce|produces|convert|converts)\b/i.test(result.simplified);

  // 🚨 HARD FAILSAFE (THIS FIXES YOUR ISSUE)
  if (simplifiedWords < 10 || !hasVerb) {
    if (result.keyPoints.length > 0) {
      result.simplified = result.keyPoints[0];
    } else {
      result.simplified = "This topic explains an important scientific process in a simple and clear way.";
    }
  }

  console.log("✅ BACKEND OUTPUT:", {
    simplified: result.simplified,
    keyPoints: result.keyPoints.length,
    steps: result.steps.length,
    hardWords: Object.keys(result.hardWords).length
  });

  return result;
}

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_SIDDH_API_5
});

export async function generateMermaidDiagram({ simplified, keyPoints, type = "FLOWCHART" }) {

  const diagramType =
  type === "GRAPH"
    ? "graph TD"
    : "flowchart TD";

  const prompt = `
You are an accessibility AI generating VISUAL SCAFFOLDING.
Task: Generate a Mermaid.js ${diagramType} diagram.
Max 6 nodes. Use short labels.
ONLY return the Mermaid code. NO markdown blocks, NO explanations.
If no relationships exist, return NONE.

Summary: ${simplified}
Key Points: ${keyPoints.join("\n")}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  let output =
    response?.text ??
    response?.response?.text ??
    response?.candidates?.[0]?.content?.parts?.[0]?.text ??
    response?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

  console.log("🧠 RAW GEMINI OUTPUT:", output);

  if (!output) {
    console.error("❌ Gemini returned no readable text");
    return null;
  }

  output = output.trim();

  // 🛠️ FIX: Allow both flowchart and graph, or return null if it's junk
  // Normalize Mermaid output
  const lines = output.split("\n").map(l => l.trim()).filter(Boolean);

  // Find the first line that starts a diagram
  const startIndex = lines.findIndex(
    l => l.toLowerCase().startsWith("flowchart") || l.toLowerCase().startsWith("graph")
  );

  if (startIndex === -1) {
    console.error("❌ No Mermaid diagram found:", output);
    return null;
  }

  output = lines.slice(startIndex).join("\n");


  return output;
}
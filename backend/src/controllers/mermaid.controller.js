import { generateMermaidDiagram } from "../agents/mermaid.agent.js";
import { detectVisualIntent } from "../agents/visual.agent.js";

export async function handleMermaid(req, reply) {
  try {
    const { simplified, keyPoints, userPreferences } = req.body;
    const allowVisuals = userPreferences?.allowVisuals !== false;

    if (!simplified || !Array.isArray(keyPoints)) {
      return reply.code(400).send({ error: "Invalid input" });
    }

    if (!allowVisuals) {
      return reply.send({
        diagram: null,
        visualIntent: "USER_DISABLED"
      });
    }

    // 🧠 AGENTIC DECISION
    const visualIntent = await detectVisualIntent({ simplified, keyPoints, userPreferences });

    if (visualIntent === "NONE") {
      return reply.send({
        diagram: null,
        visualIntent: "NONE"
      });
    }

    const diagram = await generateMermaidDiagram({
      simplified,
      keyPoints,
      type: visualIntent // FLOWCHART or GRAPH
    });

    return reply.send({
      diagram,
      visualIntent
    });

  } catch (err) {
    console.error("❌ Mermaid Controller Error:", err);
    return reply.code(500).send({ error: "Visual decision failed" });
  }
}

import { useEffect, useState } from "react";

export function useMermaid(result) {
  const [diagram, setDiagram] = useState(null);

  useEffect(() => {
    if (!result?.flags?.needs_visual) return;

    fetch("/api/mermaid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        simplified: result.simplified,
        keyPoints: result.keyPoints,
        flags: result.flags
      })
    })
      .then(res => res.json())
      .then(data => setDiagram(data.diagram))
      .catch(() => setDiagram(null));
  }, [result]);

  return diagram;
}

import { handleMermaid } from "../controllers/mermaid.controller.js";

export default async function mermaidRoutes(app) {
  app.post("/mermaid", handleMermaid);
}

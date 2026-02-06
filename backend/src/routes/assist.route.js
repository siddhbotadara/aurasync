import { assistUser } from "../controllers/assist.controller.js";

export default async function assistRoutes(app) {
  app.post("/assist", assistUser);
}
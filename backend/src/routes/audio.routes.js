import { handleAudio } from "../controllers/audio.controller.js";

export default async function audioRoutes(app) {
  app.post("/audio/process", handleAudio);
}

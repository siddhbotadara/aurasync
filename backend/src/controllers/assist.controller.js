import UserProfile from "../models/UserProfile.js";
import { processWithGemini } from "../services/gemini.service.js";

export async function assistUser(request, reply) {
  try {
    const { profileId, text } = request.body;

    if (!profileId || !text) {
      return reply.code(400).send({
        error: "profileId and text are required"
      });
    }

    const userProfile = await UserProfile.findOne({ profileId });

    if (!userProfile) {
      return reply.code(404).send({
        error: "User profile not found"
      });
    }

    const result = await processWithGemini({
      text,
      userProfile
    });

    return reply.send(result);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: "Failed to process assistance request"
    });
  }
}

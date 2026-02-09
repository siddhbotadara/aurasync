import UserProfile from "../models/UserProfile.js";
import { processWithGemini, processContextQuery} from "../services/gemini.service.js";

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

export async function assistUserContext(request, reply) {
  try {
    const { query, previousResult } = request.body;

    if (!query || !previousResult) {
      return reply.code(400).send({
        error: "query and previousResult are required"
      });
    }

    const result = await processContextQuery({
      query,
      previousResult
    });

    return reply.send(result);
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({
      error: "Failed to process context request"
    });
  }
}
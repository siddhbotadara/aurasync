import { requestAssist } from "../services/assist.api.js";

export default function AssistButton({ transcriptChunk, profileId, onResult }) {
  const handleClick = async () => {
    try {
      const data = await requestAssist({
        profileId,
        text: transcriptChunk
      });

      onResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to get explanation");
    }
  };
}
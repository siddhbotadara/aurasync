import api from "../api.js";

export async function requestAssist({ profileId, text }) {
  const response = await api.post("/assist", {
    profileId,
    text
  });

  return response.data;
}
import { Navigate } from "react-router-dom";

/* 🔒 Protect /app */
export const RequireProfile = ({ children }) => {
  const profileId = localStorage.getItem("aurasync_profile_id");
  return profileId ? children : <Navigate to="/onboarding" replace />;
};

/* 🚫 Block onboarding / home after completion */
export const BlockIfProfileExists = ({ children }) => {
  const profileId = localStorage.getItem("aurasync_profile_id");
  return profileId ? <Navigate to="/app" replace /> : children;
};

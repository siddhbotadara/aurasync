import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Boarding from "./pages/Boarding";
import Dashboard from "./pages/Dashboard";

import {
  RequireProfile,
  BlockIfProfileExists,
} from "./routes/RouteGuards";

const App = () => {
  return (
    <Routes>
      {/* Home */}
      <Route
        path="/"
        element={
          <BlockIfProfileExists>
            <HomePage />
          </BlockIfProfileExists>
        }
      />

      {/* Onboarding (blocked after completion) */}
      <Route
        path="/onboarding"
        element={
          <BlockIfProfileExists>
            <Boarding />
          </BlockIfProfileExists>
        }
      />

      {/* App (protected) */}
      <Route
        path="/app"
        element={
          <RequireProfile>
            <Dashboard />
          </RequireProfile>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestAssist } from "../services/assist.api.js";
import { useTypewriter } from "../hooks/useTypewriter.js";

import {
  Settings,
  HelpCircle,
  User,
  Pause,
  Play,
  RotateCcw
} from "lucide-react";

const Dashboard = () => {
  const [profileId, setProfileId] = useState(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(50);

  const [transcriptChunk, setTranscriptChunk] = useState("");
  const [assistResult, setAssistResult] = useState(null);
  const [loadingAssist, setLoadingAssist] = useState(false);

  const navigate = useNavigate();

  const animationDelay = 200 - (speed * 1.8);

  const animatedSimplified = useTypewriter(assistResult?.simplified, animationDelay, paused);

  useEffect(() => {
    const id = localStorage.getItem("aurasync_profile_id");
    setProfileId(id);
  }, []);

  const resetProfile = () => {
    localStorage.removeItem("aurasync_profile_id");
    navigate("/", { replace: true });
  };

  // Gemini function
  const handleAssistClick = async () => {
    if (!profileId || !transcriptChunk) return;

    try {
      setLoadingAssist(true);

      const data = await requestAssist({
        profileId,
        text: transcriptChunk
      });

      setAssistResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to get explanation");
    } finally {
      setLoadingAssist(false);
    }
  };

  useEffect(() => {
    setTranscriptChunk(
      "Okay so first we initialize the state, then we lift it up so child components can access it."
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">

      {/* ───────────────── Top Navigation ───────────────── */}
      <header className="sticky top-0 z-40 h-16 bg-white border-b flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold tracking-tight">
          AuraSync
        </h1>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 focus-visible:ring">
            <HelpCircle size={20} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 focus-visible:ring">
            <Settings size={20} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 focus-visible:ring">
            <User size={20} />
          </button>
            <button
            onClick={resetProfile}
            className="
                w-full group relative overflow-hidden
                rounded-2xl px-4 py-3
                bg-gradient-to-br from-red-500/90 to-rose-600/90
                text-white font-medium tracking-wide
                shadow-lg shadow-red-500/20
                hover:shadow-red-500/40
                hover:scale-[1.01]
                active:scale-[0.98]
                transition-all duration-200 ease-out

                focus:outline-none focus-visible:ring-2
                focus-visible:ring-red-400 focus-visible:ring-offset-2
            "
            >
            <span className="relative z-10">New Session</span>

            {/* subtle glow layer */}
            <span
                className="
                pointer-events-none absolute inset-0
                bg-gradient-to-r from-white/10 to-transparent
                opacity-0 group-hover:opacity-100
                transition-opacity
                "
            />
            </button>
        </div>
      </header>

      {/* ───────────────── Main Content ───────────────── */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ───── Left: Understanding Panel ───── */}
          <section className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">
                Live Understanding
              </h2>

              {assistResult ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1 text-indigo-600 uppercase tracking-wider text-[10px]">
                      Simplified
                    </h4>
                    {/* Animated text from our hook */}
                    <p className="leading-relaxed text-gray-700 text-base">
                      {animatedSimplified}
                    </p>
                  </div>

                  {/* Key Points with a CSS fade-in animation */}
                  {assistResult.keyPoints?.length > 0 && (
                    <div className="pt-2 border-t border-gray-50 animate-in fade-in slide-in-from-bottom-2 duration-700">
                      <h4 className="font-medium mb-2 text-indigo-600 uppercase tracking-wider text-[10px]">
                        Key Points
                      </h4>
                      <ul className="grid grid-cols-1 gap-2">
                        {assistResult.keyPoints.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 bg-indigo-50/50 p-2 rounded-lg">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                /* Combined loading and empty state to fix the double message */
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className={`mb-4 ${loadingAssist ? "animate-pulse" : ""}`}>
                    <HelpCircle size={40} className="opacity-20" />
                  </div>
                  <p className="text-sm italic">
                    {loadingAssist ? "Gemini is distilling the conversation..." : "Waiting for content to begin…"}
                  </p>
                </div>
              )}
            </div>

            {/* Profile ID */}
            {profileId && (
              <div className="text-[10px] text-gray-400 uppercase tracking-widest px-2">
                Session ID: <code>{profileId}</code>
              </div>
            )}
          </section>

          {/* ───── Right: Controls ───── */}
          <aside className="space-y-6">

            {/* Pacing Controls */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Reading Pacing</h3>
                <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                  {speed < 33 ? "Slow & Steady" : speed < 66 ? "Standard" : "Fast"}
                </span>
              </div>

              <label className="text-sm block">
                <div className="flex justify-between text-[10px] text-gray-400 uppercase mb-1">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))} // Ensure it's a number
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </label>

              <button
                onClick={() => setPaused(!paused)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border transition-colors ${
                  paused ? "bg-amber-50 border-amber-200 text-amber-700" : "hover:bg-gray-100"
                }`}
              >
                {paused ? <Play size={18} /> : <Pause size={18} />}
                {paused ? "Resume Processing" : "Pause Stream"}
              </button>
            </div>

            {/* Context Tools */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
              <h3 className="font-semibold">Context</h3>
            <button
              onClick={handleAssistClick}
              disabled={loadingAssist}
              className="w-full py-2 rounded-xl border hover:bg-gray-100"
            >
              {loadingAssist ? "Thinking…" : "Recap / How did we get here?"}
            </button>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
              <h3 className="font-semibold">Preferences</h3>

              <select className="w-full border rounded-xl p-2">
                <option>Low simplification</option>
                <option>Medium simplification</option>
                <option>High simplification</option>
              </select>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" />
                Visual aids
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" />
                Text-only mode
              </label>
            </div>

          </aside>
        </div>
      </main>

      {/* ───────────────── Bottom Action Bar (Mobile) ───────────────── */}
      <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3 lg:hidden">
        <button className="flex-1 py-3 rounded-xl bg-indigo-600 text-white">
          Start Processing
        </button>
        <button className="p-3 rounded-xl border">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
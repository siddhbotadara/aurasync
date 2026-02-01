import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("aurasync_profile_id");
    setProfileId(id);
  }, []);

  const resetProfile = () => {
    localStorage.removeItem("aurasync_profile_id");
    navigate("/", { replace: true });
  };

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

              {/* Empty State */}
              <div className="text-gray-500 text-sm">
                Waiting for content to begin…
              </div>
            </div>

            {/* Profile ID (Dev / Transparency) */}
            {profileId && (
              <div className="text-xs text-gray-400">
                Profile ID: <code>{profileId}</code>
              </div>
            )}
          </section>

          {/* ───── Right: Controls ───── */}
          <aside className="space-y-6">

            {/* Pacing Controls */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="font-semibold">Pacing</h3>

              <label className="text-sm">
                Speed
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full mt-2"
                />
              </label>

              <button
                onClick={() => setPaused(!paused)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border hover:bg-gray-100"
              >
                {paused ? <Play size={18} /> : <Pause size={18} />}
                {paused ? "Resume" : "Pause"}
              </button>
            </div>

            {/* Context Tools */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
              <h3 className="font-semibold">Context</h3>

              <button className="w-full py-2 rounded-xl border hover:bg-gray-100">
                Recap / How did we get here?
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
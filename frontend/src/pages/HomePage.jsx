import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-10 md:p-8 text-center">

        {/* Logo / Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Welcome to <span className="text-indigo-600">AuraSync</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          AuraSync is designed for learners with <span className="font-semibold">Auditory Processing Disorder (APD)</span>.
          When lectures feel confusing, rushed, or hard to retain, AuraSync steps in to present information
          in a clearer, slower, and more structured way → helping you stay focused, reduce mental overload,
          and truly understand what’s being taught.
        </p>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-2xl border bg-indigo-50">
            <h3 className="font-semibold text-lg mb-2">🧠 Personalized Learning</h3>
            <p className="text-gray-600 text-sm">
              Explanations adapt based on how you understand best.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-purple-50">
            <h3 className="font-semibold text-lg mb-2">⚡ Reduced Cognitive Load</h3>
            <p className="text-gray-600 text-sm">
              No overload. Clear steps, simple language, better flow.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-pink-50">
            <h3 className="font-semibold text-lg mb-2">🎨 Accessible UI</h3>
            <p className="text-gray-600 text-sm">
              Fonts, colors, and layouts chosen for comfort and clarity.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/onboarding")}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-lg transition transform hover:scale-105"
        >
          Get Started →
        </button>

        {/* Footer note */}
        <p className="mt-6 text-sm text-gray-500">
          Takes less than 30 seconds • No signup required
        </p>
      </div>
    </div>
  );
};

export default HomePage;
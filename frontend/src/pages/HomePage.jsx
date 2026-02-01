import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur rounded-3xl shadow-2xl
                      p-6 sm:p-8 md:p-10 text-center">

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 mb-3">
          Welcome to <span className="text-indigo-600">AuraSync</span>
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
          AuraSync helps learners with
          <span className="font-semibold"> Auditory Processing Disorder (APD)</span>
          understand lectures through clearer, slower, and structured explanations —
          reducing overload and improving focus.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="p-4 sm:p-6 rounded-2xl border bg-indigo-50">
            <h3 className="font-semibold text-sm sm:text-base mb-1">
              🧠 Personalized Learning
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Explanations adapt to how you understand best.
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl border bg-purple-50">
            <h3 className="font-semibold text-sm sm:text-base mb-1">
              ⚡ Reduced Cognitive Load
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Clear steps, simple language, better flow.
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl border bg-pink-50">
            <h3 className="font-semibold text-sm sm:text-base mb-1">
              🎨 Accessible UI
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Calm colors and layouts designed for comfort.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/onboarding")}
          className="w-full sm:w-auto inline-flex items-center justify-center
                     bg-indigo-600 hover:bg-indigo-700 text-white
                     text-sm sm:text-base md:text-lg font-semibold
                     px-6 sm:px-10 py-3 sm:py-4 rounded-2xl shadow-lg
                     transition active:scale-95"
        >
          Get Started →
        </button>

        {/* Footer */}
        <p className="mt-4 text-xs sm:text-sm text-gray-500">
          Takes less than 30 seconds • No signup required
        </p>
      </div>
    </div>
  );
};

export default HomePage;

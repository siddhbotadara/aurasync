import React from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Zap, Palette, ArrowRight, Sparkles } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-[#FBFBFE] flex items-center justify-center p-4 sm:p-6 font-sans antialiased text-slate-900 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl max-h-[95vh] flex flex-col">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_32px_64px_-12px_rgba(79,70,229,0.1)] overflow-hidden flex flex-col md:flex-row flex-1">
          
          {/* Left Side: Visual/Branding (Optimized for space) */}
          <div className="hidden md:flex md:w-5/12 bg-indigo-600 p-8 lg:p-12 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="text-white" size={24} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                Deep Focus.<br />Clear Mind.
              </h2>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3 text-indigo-100/80 text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-indigo-300 shadow-[0_0_8px_rgba(165,180,252,0.6)]" />
                <span>Calibrated for APD</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-100/80 text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-indigo-300 shadow-[0_0_8px_rgba(165,180,252,0.6)]" />
                <span>Low Cognitive Load</span>
              </div>
            </div>
          </div>

          {/* Right Side: Content (Scroll-free layout) */}
          <div className="flex-1 p-6 sm:p-10 lg:p-14 text-left flex flex-col justify-center overflow-hidden">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-4 w-fit border border-indigo-100/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Now Calibrating
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-4">
              Welcome to <span className="text-indigo-600">AuraSync</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-500 leading-relaxed mb-8 max-w-xl">
              AuraSync helps learners with 
              <span className="text-slate-900 font-semibold px-1">Auditory Processing Disorder</span> 
              navigate lectures through structured and high-clarity explanations.
            </p>

            {/* Features Grid - Compact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="group p-3 lg:p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-indigo-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Brain size={18} />
                </div>
                <h3 className="font-bold text-slate-800 text-xs mb-1">Personalized</h3>
                <p className="text-[10px] text-slate-500 leading-tight">Adapts to your speed.</p>
              </div>

              <div className="group p-3 lg:p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-violet-100">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Zap size={18} />
                </div>
                <h3 className="font-bold text-slate-800 text-xs mb-1">Reduced Load</h3>
                <p className="text-[10px] text-slate-500 leading-tight">Clearer, simpler steps.</p>
              </div>

              <div className="group p-3 lg:p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-pink-100">
                <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Palette size={18} />
                </div>
                <h3 className="font-bold text-slate-800 text-xs mb-1">Accessible</h3>
                <p className="text-[10px] text-slate-500 leading-tight">Visual comfort first.</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <button
                onClick={() => navigate("/onboarding")}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95 whitespace-nowrap"
              >
                Get Started
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-xs font-bold text-slate-900 leading-none mb-1">Free to Use</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">No registration required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Static Footer - Minimal height */}
        <div className="py-4 flex justify-center gap-6 opacity-40">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Privacy Secured</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">APD Optimized</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
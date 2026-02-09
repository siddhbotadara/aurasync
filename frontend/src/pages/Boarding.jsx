import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const Boarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    comprehensionBreak: "",
    learningPreference: "",
    listeningThought: "",
    struggleNote: "",
    uiPreferences: {
      font: "",
      fontSize: "large"
    }
  });

  const isStepValid = () => {
    switch (step) {
      case 1:
        return !!form.comprehensionBreak;
      case 2:
        return !!form.learningPreference;
      case 3:
        return true; // optional
      case 4:
        return !!form.uiPreferences.font;
      case 5:
        return !!form.listeningThought;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const isFormValid = () => {
    return (
      form.comprehensionBreak &&
      form.learningPreference &&
      form.uiPreferences.font &&
      form.listeningThought
    );
  };

  const next = () => setStep((s) => s + 1);
  const back = () => {
    if (step === 1) {
      navigate("/");
    } else {
      setStep((s) => s - 1);
    }
  };

  const submit = async () => {
    if (!isFormValid()) {
      alert("Please complete all required steps before continuing.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/onboarding", form);
      localStorage.setItem("aurasync_profile_id", res.data.profileId);
      navigate("/app");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const OptionCard = ({ label, selected, onClick }) => (
    <button
      onClick={onClick}
      className={`group w-full p-3 sm:p-4 rounded-2xl border-2 text-left transition-all duration-200 flex justify-between items-center active:scale-[0.98]
        ${selected 
          ? "border-indigo-500 bg-indigo-50/50 shadow-sm shadow-indigo-100" 
          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"}`}
    >
      <span className={`text-sm sm:text-base font-medium transition-colors ${selected ? "text-indigo-700" : "text-slate-600"}`}>
        {label}
      </span>
      <div className={`flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all 
        ${selected ? "bg-indigo-500 border-indigo-500 scale-110" : "border-slate-200 group-hover:border-slate-300"}`}>
        {selected && <Check size={12} className="text-white stroke-[4]" />}
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-[#FBFBFE] flex items-center justify-center p-4 sm:p-6 font-sans antialiased text-slate-900">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-200 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Progress Strip */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 flex rounded-t-[2.5rem] overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-700 ease-in-out"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        <div className="flex flex-col h-full overflow-hidden">
          {/* Compact Header */}
          <header className="px-8 pt-10 pb-4 text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step {step} of 6</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Personalize AuraSync</h1>
          </header>

          {/* Body - Optimized for no scroll */}
          <main className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col h-full">
              
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-800 leading-snug">
                    Where do you usually lose understanding? <span className="text-indigo-400">*</span>
                  </h2>
                  <div className="grid gap-2">
                    {[
                      ["miss_key_terms", "I miss key terms"],
                      ["lose_connection", "I lose the connection between ideas"],
                      ["forget_steps", "I forget earlier steps"],
                      ["overwhelmed_speed", "Things move too fast"],
                      ["cant_retain", "I understand but can’t retain"]
                    ].map(([value, label]) => (
                      <OptionCard
                        key={value}
                        label={label}
                        selected={form.comprehensionBreak === value}
                        onClick={() => setForm({ ...form, comprehensionBreak: value })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-800 leading-snug">
                    What helps you understand best? <span className="text-indigo-400">*</span>
                  </h2>
                  <div className="grid gap-2">
                    {[
                      ["simple_words", "Simpler words"],
                      ["examples", "Practical examples"],
                      ["step_by_step", "Step-by-step breakdown"],
                      ["visuals", "Visual explanations"]
                    ].map(([value, label]) => (
                      <OptionCard
                        key={value}
                        label={label}
                        selected={form.learningPreference === value}
                        onClick={() => setForm({ ...form, learningPreference: value })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-800 leading-snug">
                    One thing you struggle with <span className="text-slate-400 font-normal">(optional)</span>
                  </h2>
                  <textarea
                    rows="5"
                    className="w-full p-5 text-base border-2 border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all outline-none resize-none placeholder:text-slate-300"
                    placeholder="Example: Fast speakers or long paragraphs..."
                    value={form.struggleNote}
                    onChange={(e) => setForm({ ...form, struggleNote: e.target.value })}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-800 leading-snug">
                    Choose a reading font <span className="text-indigo-400">*</span>
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {["Atkinson Hyperlegible", "OpenDyslexic", "Lexend", "Arial"].map((font) => (
                      <OptionCard
                        key={font}
                        label={font}
                        selected={form.uiPreferences.font === font}
                        onClick={() => setForm({
                          ...form,
                          uiPreferences: { ...form.uiPreferences, font }
                        })}
                      />
                    ))}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl mt-4 border border-slate-100">
                    <p className="text-xs text-slate-500 leading-relaxed text-center" style={{ fontFamily: form.uiPreferences.font || 'inherit' }}>
                      {form.uiPreferences.font ? `This is a preview of ${form.uiPreferences.font}.` : "Select a font to see how it looks."}
                    </p>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-800 leading-snug">
                    Which thought happens more often? <span className="text-indigo-400">*</span>
                  </h2>
                  <div className="grid gap-3">
                    <OptionCard
                      label="“Wait… what did they just say?”"
                      selected={form.listeningThought === "missed_what_was_said"}
                      onClick={() => setForm({ ...form, listeningThought: "missed_what_was_said" })}
                    />
                    <OptionCard
                      label="“I get the words, but not the meaning”"
                      selected={form.listeningThought === "hear_but_not_understand"}
                      onClick={() => setForm({ ...form, listeningThought: "hear_but_not_understand" })}
                    />
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="text-center py-6 animate-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={32} className="stroke-[3]" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">You’re all set!</h2>
                  <p className="text-slate-500 text-base leading-relaxed max-w-[280px] mx-auto">
                    AuraSync is now calibrated to your unique way of thinking.
                  </p>
                </div>
              )}
            </div>
          </main>

          {/* Navigation - Locked to bottom */}
          <footer className="px-8 py-8 mt-auto flex items-center justify-between gap-4 border-t border-slate-50">
            <button
              onClick={back}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-slate-400 hover:text-indigo-500 transition-colors"
            >
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>

            {step < 6 ? (
              <button
                onClick={next}
                disabled={!isStepValid()}
                className={`flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-white transition-all shadow-lg
                  ${isStepValid() 
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 translate-y-0 active:scale-95" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}
              >
                <span>Continue</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={loading || !isFormValid()}
                className={`flex items-center justify-center gap-3 px-8 py-3 rounded-2xl font-bold text-white transition-all shadow-lg
                  ${loading || !isFormValid() 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 translate-y-0 active:scale-95"}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter App</span>
                    <Sparkles size={18} />
                  </>
                )}
              </button>
            )}
          </footer>
        </div>
      </div>
      
      {/* Visual Indicator of height efficiency */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default Boarding;
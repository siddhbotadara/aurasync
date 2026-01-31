import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Check } from "lucide-react";

const Boarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    comprehensionBreak: "",
    learningPreference: "",
    struggleNote: "",
    uiPreferences: {
      font: "",
      fontSize: "large",
      colorMode: ""
    }
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    try {
      setLoading(true);
      const res = await api.post("/onboarding", form);
      localStorage.setItem("aurasync_profile_id", res.data.profileId);
      navigate("/app");
    } catch (err) {
      alert("Failed to save onboarding");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const OptionCard = ({ label, selected, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border text-left transition flex justify-between items-center
        ${selected ? "border-indigo-600 bg-indigo-50" : "hover:bg-gray-50"}`}
    >
      <span>{label}</span>
      {selected && (
        <span className="text-indigo-600">
          <Check size={18} />
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold">Onboarding</h1>
          <p className="text-gray-500 text-sm mt-1">
            Help AuraSync adapt to how your mind processes information.
          </p>
        </div>

        <div className="text-sm text-gray-400">
          Step {step} of 6
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold">
              Where do you usually lose understanding?
            </h2>

            <div className="space-y-3">
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
                  onClick={() =>
                    setForm({ ...form, comprehensionBreak: value })
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold">
              What helps you understand best?
            </h2>

            <div className="space-y-3">
              {[
                ["simple_words", "Simpler words"],
                ["examples", "Examples"],
                ["step_by_step", "Step-by-step breakdown"],
                ["visuals", "Visual explanations"]
              ].map(([value, label]) => (
                <OptionCard
                  key={value}
                  label={label}
                  selected={form.learningPreference === value}
                  onClick={() =>
                    setForm({ ...form, learningPreference: value })
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold">
              One thing you struggle with (optional)
            </h2>

            <textarea
              rows="4"
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-400"
              placeholder="For example: long explanations, fast lectures…"
              value={form.struggleNote}
              onChange={(e) =>
                setForm({ ...form, struggleNote: e.target.value })
              }
            />
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <h2 className="text-xl font-semibold">
              Choose a reading font
            </h2>

            <div className="space-y-3">
              {[
                "Atkinson Hyperlegible",
                "OpenDyslexic",
                "Lexend",
                "Arial"
              ].map((font) => (
                <OptionCard
                  key={font}
                  label={font}
                  selected={form.uiPreferences.font === font}
                  onClick={() =>
                    setForm({
                      ...form,
                      uiPreferences: {
                        ...form.uiPreferences,
                        font
                      }
                    })
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* STEP 5 — SAME FIELD, NEW QUESTION TEXT */}
        {step === 5 && (
          <>
            <h2 className="text-xl font-semibold">
              When listening, which thought happens more often?
            </h2>

            <div className="space-y-3">
              <OptionCard
                label="“Wait… what did they just say?”"
                selected={form.uiPreferences.colorMode === "light"}
                onClick={() =>
                  setForm({
                    ...form,
                    uiPreferences: {
                      ...form.uiPreferences,
                      colorMode: "light"
                    }
                  })
                }
              />

              <OptionCard
                label="“I get the words, but not the meaning”"
                selected={form.uiPreferences.colorMode === "dark"}
                onClick={() =>
                  setForm({
                    ...form,
                    uiPreferences: {
                      ...form.uiPreferences,
                      colorMode: "dark"
                    }
                  })
                }
              />
            </div>
          </>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <>
            <h2 className="text-2xl font-bold">
              You’re all set 🎉
            </h2>
            <p className="text-gray-600">
              AuraSync will now adapt explanations to match how you think.
            </p>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button
            onClick={back}
            disabled={step === 1}
            className="px-4 py-2 rounded-xl border disabled:opacity-40"
          >
            Back
          </button>

          {step < 6 ? (
            <button
              onClick={next}
              className="px-6 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Enter App"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Boarding;
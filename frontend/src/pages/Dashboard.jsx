import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestAssist } from "../services/assist.api.js";
import { useTypewriter } from "../hooks/useTypewriter.js";
import MermaidDiagram from "../components/MermaidDiagram";

import {
  Settings,
  HelpCircle,
  User,
  Pause,
  Play,
  RotateCcw
} from "lucide-react";

const getToneColor = (tone) => {
  switch (tone) {
    case "sarcastic":
      return "bg-purple-100 text-purple-700";
    case "joking":
      return "bg-green-100 text-green-700";
    case "angry":
      return "bg-red-100 text-red-700";
    case "confused":
      return "bg-yellow-100 text-yellow-700";
    case "stressed":
      return "bg-orange-100 text-orange-700";
    case "serious":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const DEFAULT_API_BASE_URL = "http://localhost:3000/api";

function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL;
  const resolved = configured && typeof configured === "string"
    ? configured
    : DEFAULT_API_BASE_URL;
  return resolved.replace(/\/+$/, "");
}

function buildApiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${cleanPath}`;
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, i + chunkSize)
    );
  }

  return btoa(binary);
}

function truncateLabel(text, maxWords = 8, maxChars = 56) {
  if (!text || typeof text !== "string") return "";

  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const words = normalized.split(" ").filter(Boolean);
  const byWord = words.slice(0, maxWords).join(" ");
  const clipped = byWord.length > maxChars
    ? `${byWord.slice(0, maxChars - 1).trim()}...`
    : byWord;

  return clipped.replace(/"/g, "'");
}

function normalizeMermaidDiagram(rawDiagram) {
  if (!rawDiagram || typeof rawDiagram !== "string") return null;

  const withoutFences = rawDiagram
    .replace(/```mermaid/gi, "")
    .replace(/```/g, "")
    .trim();

  if (!withoutFences || /^none$/i.test(withoutFences)) {
    return null;
  }

  const lines = withoutFences
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const diagramStart = lines.findIndex((line) =>
    /^(flowchart|graph)\b/i.test(line)
  );

  if (diagramStart === -1) {
    return null;
  }

  const normalized = lines.slice(diagramStart).join("\n");
  return normalized || null;
}

function isDiagramDense(diagram) {
  if (!diagram) return true;

  if (diagram.length > 2200) return true;

  const quotedLabels = [...diagram.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  return quotedLabels.some((label) => label.length > 90);
}

function buildFallbackDiagram({ simplified, keyPoints }) {
  const labels = [];

  if (simplified) {
    labels.push(truncateLabel(simplified, 9, 62));
  }

  if (Array.isArray(keyPoints)) {
    keyPoints.forEach((point) => {
      const compact = truncateLabel(point, 8, 56);
      if (compact) labels.push(compact);
    });
  }

  const unique = [...new Set(labels.filter(Boolean))].slice(0, 5);

  if (unique.length === 0) {
    return null;
  }

  const lines = ["flowchart TD"];

  unique.forEach((label, index) => {
    lines.push(`N${index}["${label}"]`);
  });

  for (let i = 1; i < unique.length; i += 1) {
    lines.push(`N${i - 1} --> N${i}`);
  }

  return lines.join("\n");
}

const Dashboard = () => {
  const [profileId, setProfileId] = useState(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(50);

  const [contextQuery, setContextQuery] = useState("");
  const [loadingContextQuery, setLoadingContextQuery] = useState(false);

  const [mermaidDiagram, setMermaidDiagram] = useState(null);
  const [loadingMermaid, setLoadingMermaid] = useState(false);

  const [transcriptChunk, setTranscriptChunk] = useState("");
  const [assistResult, setAssistResult] = useState(null);
  const [loadingAssist, setLoadingAssist] = useState(false);

  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  
  const audioChunksRef = React.useRef([]);
  const mediaStreamRef = React.useRef(null);
  const monitorContextRef = React.useRef(null);
  const monitorSourceRef = React.useRef(null);

  const navigate = useNavigate();

  const animationDelay = Math.max(20, 200 - speed * 1.8);

  const usedHardWordsRef = React.useRef(new Set());

  const [textOnly, setTextOnly] = useState(true);

  const [allowVisuals, setAllowVisuals] = useState(true);

  const hasSpeakers =
    Array.isArray(assistResult?.speakerSegments) &&
    assistResult.speakerSegments.length >= 2;


  const {
    text: animatedSimplified,
    done: simplifiedDone
  } = useTypewriter(
    assistResult?._rawSimplified || "",
    animationDelay,
    paused
  );

  const normalizeHardWords = (hardWords = {}) => {
    const entries = Object.entries(hardWords);

    entries.sort((a, b) => b[0].length - a[0].length);

    return entries.map(([word, description]) => ({
      word,
      description,
      used: false
    }));
  };

  const animationDone = 
    animatedSimplified === assistResult?._rawSimplified;

  const renderTextWithHighlights = (text, allowHighlighting = true) => {
    if (!text || !assistResult?.hardWords) return text;

    const hardWordsMap = assistResult.hardWords;
    const wordsToMatch = Object.keys(hardWordsMap);

    if (wordsToMatch.length === 0) return text;

    const sortedWords = [...wordsToMatch].sort((a, b) => b.length - a.length);
    
    const escapedWords = sortedWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(\\b${escapedWords.join("\\b|\\b")}\\b)`, "gi");

    const parts = text.split(regex);

    return parts.map((part, i) => {
      const lowerPart = part.toLowerCase();
      
      const originalKey = wordsToMatch.find(w => w.toLowerCase() === lowerPart);

      if (
        allowHighlighting &&
        originalKey &&
        !usedHardWordsRef.current.has(lowerPart)
      ) {
        
        return (
          <span
            key={i}
            className="relative group text-indigo-700 font-semibold underline decoration-dotted decoration-indigo-400/50 cursor-help transition-colors hover:text-indigo-800"
          >
            {part}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-2xl z-50 w-56 text-center leading-snug normal-case font-normal backdrop-blur-sm">
              {hardWordsMap[originalKey]}
            </span>
          </span>
        );
      }

      return part;
    });
  };

  const handleContextQuery = async () => {
    if (!contextQuery.trim() || !assistResult || !profileId) return;

    try {
      setLoadingContextQuery(true);

      const res = await fetch(buildApiUrl("/assist/context"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          query: contextQuery,
          previousResult: assistResult,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();

      setAssistResult({
        ...data,
        _rawSimplified: data.simplified,
      });

      setContextQuery("");
      usedHardWordsRef.current.clear();
    } catch (err) {
      console.error("Context query failed:", err);
      alert("AI could not process the request");
    } finally {
      setLoadingContextQuery(false);
    }
  };

  useEffect(() => {
    const id = localStorage.getItem("aurasync_profile_id");
    setProfileId(id);
  }, []);

  const resetProfile = () => {
    localStorage.removeItem("aurasync_profile_id");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (assistResult) {
      usedHardWordsRef.current.clear();
    }
  }, [assistResult]);

  useEffect(() => {
    if (!assistResult?.simplified) {
      setLoadingMermaid(false);
      setMermaidDiagram(null);
      return;
    }

    if (!allowVisuals) {
      setLoadingMermaid(false);
      setMermaidDiagram(null);
      return;
    }

    let cancelled = false;
    const fallbackDiagram = buildFallbackDiagram({
      simplified: assistResult.simplified,
      keyPoints: assistResult.keyPoints || [],
    });

    (async () => {
      try {
        setLoadingMermaid(true);
        setMermaidDiagram(null);

        const res = await fetch(buildApiUrl("/mermaid"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            simplified: assistResult.simplified,
            keyPoints: assistResult.keyPoints || [],
            userPreferences: {
              allowVisuals,
            },
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed (${res.status})`);
        }

        const data = await res.json();
        const normalizedRemote = normalizeMermaidDiagram(data?.diagram);
        const finalDiagram =
          normalizedRemote && !isDiagramDense(normalizedRemote)
            ? normalizedRemote
            : fallbackDiagram;

        if (!cancelled) {
          setMermaidDiagram(finalDiagram || null);
        }
      } catch (err) {
        console.error("Mermaid auto-trigger failed", err);
        if (!cancelled) {
          setMermaidDiagram(fallbackDiagram || null);
        }
      } finally {
        if (!cancelled) setLoadingMermaid(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [assistResult, allowVisuals]);

  const isExtensionContext = () =>
    typeof chrome !== "undefined" && Boolean(chrome?.runtime?.id);

  const cleanupCapturedAudio = async () => {
    try {
      if (monitorSourceRef.current) {
        monitorSourceRef.current.disconnect();
      }
    } catch (err) {
      console.warn("Failed to disconnect monitor source", err);
    } finally {
      monitorSourceRef.current = null;
    }

    try {
      if (monitorContextRef.current) {
        await monitorContextRef.current.close();
      }
    } catch (err) {
      console.warn("Failed to close monitor context", err);
    } finally {
      monitorContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const attachTabAudioMonitor = async (stream) => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    try {
      const context = new AudioContextCtor();
      const source = context.createMediaStreamSource(stream);
      source.connect(context.destination);
      if (context.state === "suspended") {
        await context.resume();
      }
      monitorContextRef.current = context;
      monitorSourceRef.current = source;
    } catch (err) {
      console.warn("Unable to mirror captured tab audio", err);
    }
  };

  const captureTabAudioStream = async () => {
    return new Promise((resolve, reject) => {
      if (!chrome?.tabCapture?.capture) {
        reject(new Error("tabCapture API unavailable"));
        return;
      }

      chrome.tabCapture.capture(
        { audio: true, video: false },
        async (stream) => {
          const runtimeError = chrome.runtime?.lastError;
          if (runtimeError) {
            reject(new Error(runtimeError.message));
            return;
          }

          if (!stream) {
            reject(new Error("Failed to capture tab audio stream"));
            return;
          }

          await attachTabAudioMonitor(stream);
          resolve(stream);
        }
      );
    });
  };

  const getRecordingStream = async () => {
    if (isExtensionContext() && chrome?.tabCapture?.capture) {
      return captureTabAudioStream();
    }
    return navigator.mediaDevices.getUserMedia({ audio: true });
  };

  const getMediaRecorderOptions = () => {
    if (
      typeof MediaRecorder.isTypeSupported === "function" &&
      MediaRecorder.isTypeSupported("audio/webm")
    ) {
      return { mimeType: "audio/webm" };
    }
    if (
      typeof MediaRecorder.isTypeSupported === "function" &&
      MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ) {
      return { mimeType: "audio/webm;codecs=opus" };
    }
    return {};
  };

  const startRecording = async () => {
    try {
      const stream = await getRecordingStream();
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream, getMediaRecorderOptions());
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error(err);
      alert(
        isExtensionContext()
          ? "Unable to capture live tab audio. Make sure audio is playing in the active tab."
          : "Unable to start microphone recording."
      );
    }
  };

  const stopRecording = () => {
    if (!mediaRecorder) return;

    setRecording(false);

    mediaRecorder.onstop = async () => {
      try {
        const recorderType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: recorderType });
        const normalizedMimeType =
          (blob.type || recorderType || "audio/webm").split(";")[0] || "audio/webm";
        await cleanupCapturedAudio();

        if (blob.size === 0) {
          alert(
            isExtensionContext()
              ? "No tab audio captured. Play audio in the active tab and try again."
              : "No audio captured. Please speak and try again."
          );
          return;
        }

        const arrayBuffer = await blob.arrayBuffer();
        const base64Audio = arrayBufferToBase64(arrayBuffer);

        const onboardingRaw = localStorage.getItem("aurasync_profile");
        const parsedProfile = onboardingRaw ? JSON.parse(onboardingRaw) : null;
        const onboarding = parsedProfile?.onboarding || parsedProfile || {
          comprehensionBreak: "Long explanations are hard",
          learningPreference: "Step by step",
          listeningThought: "I lose focus quickly",
          struggleNote: "Technical lectures",
        };

        setLoadingAssist(true);

        const res = await fetch(buildApiUrl("/audio/process"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: base64Audio,
            mimeType: normalizedMimeType,
            userProfile: { onboarding },
          }),
        });

        if (!res.ok) {
          const rawError = await res.text();
          let parsedError = rawError;
          try {
            const parsed = JSON.parse(rawError);
            parsedError = parsed?.error || rawError;
          } catch (_parseErr) {}
          throw new Error(parsedError || `Request failed (${res.status})`);
        }

        const data = await res.json();

        setTranscriptChunk(data.transcript);
        setAssistResult({
          ...data.aiResult,
          _rawSimplified: data.aiResult.simplified,
        });
        usedHardWordsRef.current.clear();
      } catch (err) {
        console.error(err);
        alert(`Audio processing failed: ${err?.message || "Unknown error"}`);
      } finally {
        setLoadingAssist(false);
        setMediaRecorder(null);
        audioChunksRef.current = [];
      }
    };

    mediaRecorder.stop();
  };

  useEffect(() => {
    return () => {
      cleanupCapturedAudio().catch((err) => {
        console.warn("Failed to cleanup audio capture on unmount", err);
      });
    };
  }, []);

  const handleAssistClick = async () => {
    if (!profileId || !transcriptChunk) return;
    try {
      setLoadingAssist(true);
      const data = await requestAssist({
        profileId,
        text: transcriptChunk
      });

      setAssistResult({
        ...data,
        _rawSimplified: data.simplified
      });
      usedHardWordsRef.current.clear();
    } catch (err) {
      console.error(err);
      alert("Failed to get explanation");
    } finally {
      setLoadingAssist(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-indigo-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
            AuraSync
          </h1>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-indigo-50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 text-slate-600 hover:text-indigo-600">
              <HelpCircle size={20} strokeWidth={2} />
            </button>
            <button className="p-2 rounded-xl hover:bg-indigo-50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 text-slate-600 hover:text-indigo-600">
              <Settings size={20} strokeWidth={2} />
            </button>
            <button className="p-2 rounded-xl hover:bg-indigo-50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 text-slate-600 hover:text-indigo-600">
              <User size={20} strokeWidth={2} />
            </button>
            <button
              onClick={resetProfile}
              className="ml-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-medium shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/35 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              New Session
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          <section className="lg:col-span-8 space-y-4">
            {assistResult?.noiseDetected && (
              <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 px-4 py-2.5 text-sm text-amber-800 shadow-sm flex items-start gap-2">
                <span className="text-base">⚠️</span>
                <span>Background noise was detected. Some sounds were ignored for clarity.</span>
              </div>
            )}
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-indigo-100/50 border border-indigo-100/30 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">
                  Live Understanding
                </h2>
                {assistResult && (
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                )}
              </div>

              {assistResult ? (
                <div className="space-y-5">
                  <div className="bg-gradient-to-br from-indigo-50/50 to-violet-50/30 rounded-xl p-3 border border-indigo-100/50">
                    <h4 className="font-bold text-[11px] uppercase tracking-widest text-indigo-700 mb-3 flex items-center gap-2">
                      <div className="h-1 w-8 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"></div>
                      Simplified
                    </h4>
                    <div className="leading-relaxed text-slate-700 text-base space-y-3">
                      {hasSpeakers ? (
                      assistResult.speakerSegments.map((seg, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-indigo-700 text-sm">
                              {seg.speaker}
                            </span>

                            {seg.tone && seg.tone !== "neutral" && (
                              <span
                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${getToneColor(seg.tone)}`}
                              >
                                {seg.tone}
                              </span>
                            )}
                          </div>
                          <p className="border-l-2 border-indigo-200 pl-2 -ml-2">
                            {renderTextWithHighlights(seg.text, simplifiedDone)}
                          </p>
                        </div>
                      ))
                      ) : (
                        <p className="text-slate-700">
                        <span key={`${speed}-${assistResult?._rawSimplified}`}>
                          {renderTextWithHighlights(
                            (paused && !simplifiedDone) || simplifiedDone
                              ? assistResult._rawSimplified
                              : animatedSimplified,
                            true
                          )}
                        </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {assistResult.keyPoints?.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                      <h4 className="font-bold text-[11px] uppercase tracking-widest text-indigo-700 mb-3 flex items-center gap-2">
                        <div className="h-1 w-8 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"></div>
                        Key Points
                      </h4>
                      <div className="grid gap-2">
                        {assistResult.keyPoints.map((p, i) => (
                          <div key={i} className="flex items-start gap-3 bg-gradient-to-r from-indigo-50/80 to-violet-50/60 p-3 rounded-xl border border-indigo-100/40 hover:border-indigo-200/60 transition-colors">
                            <span className="text-indigo-500 font-bold text-lg leading-none mt-0.5">•</span>
                            <span className="text-slate-700 text-sm leading-relaxed flex-1">{renderTextWithHighlights(p, simplifiedDone)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {assistResult.flags?.multi_step && assistResult.steps?.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                      <h4 className="font-bold text-[11px] uppercase tracking-widest text-emerald-700 mb-3 flex items-center gap-2">
                        <div className="h-1 w-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                        Steps
                      </h4>
                      <ol className="space-y-2">
                        {assistResult.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 bg-gradient-to-r from-emerald-50/70 to-teal-50/50 p-3 rounded-xl border border-emerald-100/40">
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-sm">
                              {i + 1}
                            </span>
                            <span className="text-slate-700 text-sm leading-relaxed flex-1">{renderTextWithHighlights(step, simplifiedDone)}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
    
                  {loadingMermaid && (
                    <div className="flex items-center gap-2 text-xs text-indigo-600 italic px-2">
                      <div className="h-1 w-1 rounded-full bg-indigo-400 animate-pulse"></div>
                      Generating visual explanation…
                    </div>
                  )}

                  {mermaidDiagram && (
                    <div className="mt-4">
                      <MermaidDiagram diagram={mermaidDiagram} />
                    </div>
                  )}

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <div className={`mb-4 ${loadingAssist ? "animate-pulse" : "animate-bounce"}`}>
                    <div className="relative">
                      <HelpCircle size={48} className="opacity-20" strokeWidth={1.5} />
                      {loadingAssist && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    {loadingAssist ? "Gemini is processing..." : "Ready to listen"}
                  </p>
                  <p className="text-xs opacity-60 mt-1">
                    {loadingAssist ? "Distilling conversation insights" : "Start recording to begin"}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md shadow-indigo-100/40 border border-indigo-100/30 p-4">
              <h4 className="font-bold text-[11px] uppercase tracking-widest text-indigo-700 mb-3 flex items-center gap-2">
                <div className="h-1 w-6 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"></div>
                Ask AuraSync
              </h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={contextQuery}
                  onChange={(e) => setContextQuery(e.target.value)}
                  placeholder="Ask for clarification, examples, or simplification…"
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-indigo-100 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all bg-white/50 placeholder:text-slate-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleContextQuery();
                  }}
                />

                <button
                  onClick={handleContextQuery}
                  disabled={loadingContextQuery}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {loadingContextQuery ? "Thinking…" : "Ask"}
                </button>
              </div>
            </div>

            {profileId && (
              <div className="text-[10px] text-slate-400 uppercase tracking-widest px-2 font-mono">
                Session: <span className="text-indigo-400">{profileId}</span>
              </div>
            )}
          </section>

          <aside className="lg:col-span-4 space-y-4">

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-indigo-100/50 border border-indigo-100/30 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-base">Reading Pace</h3>
                <span className="text-[10px] font-bold px-3 py-1 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 rounded-full uppercase tracking-wide">
                  {speed < 33 ? "Slow" : speed < 66 ? "Standard" : "Fast"}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
                  style={{
                    background: `linear-gradient(to right, rgb(99 102 241) 0%, rgb(99 102 241) ${speed}%, rgb(224 231 255) ${speed}%, rgb(224 231 255) 100%)`
                  }}
                />
              </div>

              <button
                onClick={() => setPaused(!paused)}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm ${
                  paused 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } hover:scale-105 active:scale-95`}
              >
                {paused ? <Play size={18} strokeWidth={2.5} /> : <Pause size={18} strokeWidth={2.5} />}
                {paused ? "Resume" : "Pause"}
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-indigo-100/50 border border-indigo-100/30 p-5">
              <h3 className="font-bold text-slate-800 mb-4 text-base">Audio Control</h3>
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-md ${
                  recording
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 animate-pulse"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40"
                } hover:scale-105 active:scale-95`}
              >
                <span className="flex items-center justify-center gap-2">
                  {recording && <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>}
                  {recording ? "Stop Listening" : "Start Listening"}
                </span>
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-indigo-100/50 border border-indigo-100/30 p-5">
              <h3 className="font-bold text-slate-800 mb-4 text-base">Preferences</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={allowVisuals}
                    onChange={(e) => setAllowVisuals(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-indigo-300 text-indigo-600 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 transition-all cursor-pointer"
                  />
                  <span className="group-hover:text-indigo-700 transition-colors font-medium">Visual aids</span>
                </label>

                <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={textOnly}
                    onChange={(e) => setTextOnly(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-indigo-300 text-indigo-600 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 transition-all cursor-pointer"
                  />
                  <span className="group-hover:text-indigo-700 transition-colors font-medium">Text-only mode</span>
                </label>
              </div>
            </div>

          </aside>
        </div>
      </main>

      <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-indigo-100/50 p-3 flex gap-2 lg:hidden shadow-lg">
        <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 transition-all">
          Start Processing
        </button>
        <button className="p-3 rounded-xl border-2 border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all">
          <RotateCcw size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

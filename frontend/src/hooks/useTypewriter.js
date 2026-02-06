import { useState, useEffect } from "react";

export function useTypewriter(text, speed = 50, isPaused = false) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      return;
    }

    if (isPaused) return;

    setDisplayedText(""); // Clear text when new result arrives
    let i = 0;
    const words = text.split(" ");
    
    const interval = setInterval(() => {
      if (i < words.length) {
        setDisplayedText((prev) => prev + (prev ? " " : "") + words[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isPaused]);

  return displayedText;
}
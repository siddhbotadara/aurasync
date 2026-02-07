import { useEffect, useRef, useState } from "react";

export function useTypewriter(text, speed = 50, isPaused = false) {
  const [displayedText, setDisplayedText] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!text || isPaused) return;

    // Clear previous interval safely
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setDisplayedText("");
    const words = text.split(" ");
    let i = 0;

    intervalRef.current = setInterval(() => {
      setDisplayedText((prev) => {
        if (i >= words.length) {
          clearInterval(intervalRef.current);
          return prev;
        }

        const nextWord = words[i];
        i++;

        return prev
          ? `${prev} ${nextWord}`
          : nextWord;
      });
    }, speed);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [text, speed, isPaused]);

  return displayedText;
}

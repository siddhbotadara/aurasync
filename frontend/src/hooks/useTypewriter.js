import { useEffect, useRef, useState } from "react";

export function useTypewriter(text, speed = 50, isPaused = false) {
  const [displayedText, setDisplayedText] = useState("");
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!text || isPaused) return;

    clearInterval(intervalRef.current);
    setDisplayedText("");
    setDone(false);

    const words = text.split(/\s+/); // safer split
    let i = 0;

    intervalRef.current = setInterval(() => {
      setDisplayedText(prev => {
        if (i >= words.length) {
          clearInterval(intervalRef.current);
          setDone(true);
          return prev;
        }
        const next = words[i++];
        return prev ? `${prev} ${next}` : next;
      });
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [text, speed, isPaused]);

  return { text: displayedText, done };
}

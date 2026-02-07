export default function ReadableText({ text, hardWords = [] }) {
  if (!text) return null;

  const words = text.split(" ");

  return (
    <p className="leading-relaxed text-gray-700 text-base space-x-1">
      {words.map((word, i) => {
        const clean = word.replace(/[.,!?]/g, "").toLowerCase();

        const isHard =
          hardWords.includes(clean) ||
          clean.length >= 9; // heuristic fallback

        return (
          <span
            key={i}
            className={
              isHard
                ? "bg-indigo-100 text-indigo-800 rounded px-1"
                : ""
            }
          >
            {word}
          </span>
        );
      })}
    </p>
  );
}

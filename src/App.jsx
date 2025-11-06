import React, { useEffect, useState, useRef } from "react";

/**
 * This is my first basic Quote Generator app!
 * 
 * Error Handling
 
 * - Smart timeout handling (no hanging requests!)
 * - Gives it another shot if something goes wrong
 * - Has some cool quotes saved locally just in case the internet acts up
 * - Smooth fade effects to make it look fancy 
 */

const LOCAL_FALLBACK_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Hal Abelson" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Premature optimization is the root of all evil.", author: "Donald Knuth" },
  { text: "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.", author: "Brian Kernighan" },
  { text: "It's not a bug – it's an undocumented feature.", author: "Anonymous" },
  { text: "There are only two hard things in Computer Science: cache invalidation and naming things.", author: "Phil Karlton" },
  { text: "Walking on water and developing software from a specification are easy if both are frozen.", author: "Edward V. Berard" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.", author: "John Woods" },
  { text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch" },
  { text: "If debugging is the process of removing bugs, then programming must be the process of putting them in.", author: "Edsger Dijkstra" },
  { text: "Good code is its own best documentation.", author: "Steve McConnell" },
  { text: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.", author: "Bill Gates" },
  { text: "Java is to JavaScript what car is to carpet.", author: "Chris Heilmann" },
  { text: "Before software can be reusable, it first has to be usable.", author: "Ralph Johnson" },
  { text: "The trouble with programmers is that you can never tell what a programmer is doing until it’s too late.", author: "Seymour Cray" },
  { text: "One of my most productive days was throwing away 1000 lines of code.", author: "Ken Thompson" },
  { text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "It works on my machine.", author: "Every Developer Ever" },
  { text: "Software is a great combination between artistry and engineering.", author: "Bill Gates" },
  { text: "Simplicity, carried to an extreme, becomes elegance.", author: "Jon Franklin" },
  { text: "There are two ways of constructing a software design: One way is to make it so simple that there are obviously no deficiencies, and the other way is to make it so complicated that there are no obvious deficiencies.", author: "C.A.R. Hoare" },
];

export default function App() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fade, setFade] = useState(false);
  const retryCountRef = useRef(0);

  // fetch reqs
  async function fetchWithTimeout(url, ms = 7000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  async function fetchQuote({ retry = true } = {}) {
    setLoading(true);
    setError(null);

    // fade out
    setFade(false);

    try {
      // try remote API
      const res = await fetchWithTimeout("https://api.quotable.io/random", 7000);

      if (!res.ok) {
        // HTTP error status
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      // successful fetch, reset retry counter
      retryCountRef.current = 0;

      // qoute and fade in
      setQuote({ text: data.content, author: data.author || "Unknown" });
      setTimeout(() => setFade(true), 40);
    } catch (err) {
      console.error("Quote fetch error:", err);

      // try again 
      if (retry && retryCountRef.current < 2) {
        retryCountRef.current += 1;
        console.warn(`Retrying fetch... attempt ${retryCountRef.current}`);
        setTimeout(() => fetchQuote({ retry }), 800); // tiny delay before retry
        return;
      }

      // fallback to local qoute
      const fallback = LOCAL_FALLBACK_QUOTES[Math.floor(Math.random() * LOCAL_FALLBACK_QUOTES.length)];
      setQuote(fallback);

      // error 
      setError("Network issue or API blocked — showing a local quote. Try again to fetch live quotes.");
      setTimeout(() => setFade(true), 40);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuote();
  }, []);

  const handleNewQuote = () => fetchQuote();

  const handleCopy = async () => {
    if (!quote) return;
    try {
      await navigator.clipboard.writeText(`${quote.text} — ${quote.author}`);
      alert("Copied to clipboard!");
    } catch {
      alert("Copy failed. Select and copy manually.");
    }
  };

  const handleTweet = () => {
    if (!quote) return;
    const text = `${quote.text} — ${quote.author}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>InspireX 💬</h1>

      <div style={{ ...styles.card, opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(8px)" }}>
        {loading && <p style={styles.muted}>Loading quote…</p>}

        {!loading && (
          <>
            <blockquote style={styles.quote}>“{quote?.text}”</blockquote>
            <p style={styles.author}>— {quote?.author}</p>

            <div style={styles.controls}>
              <button style={styles.primaryBtn} onClick={handleNewQuote}>
                New Quote
              </button>
              <button style={styles.btn} onClick={handleTweet}>
                Tweet
              </button>
              <button style={styles.btn} onClick={handleCopy}>
                Copy
              </button>
            </div>

            {error && <p style={styles.error}>{error}</p>}
          </>
        )}
      </div>

      <footer style={styles.footer}>
        <small style={styles.muted}>Built with ❤️ — Icey067</small>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0b1220, #071228)",
    color: "#eaf2ff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px",
    fontFamily: "Inter, Arial, sans-serif",
    textAlign: "center",
  },
  title: { margin: 0, fontSize: "1.6rem", marginBottom: "14px" },
  card: {
    width: "min(720px, 92%)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 12px 40px rgba(2,6,23,0.6)",
    border: "1px solid rgba(255,255,255,0.03)",
    transition: "opacity 320ms ease, transform 320ms ease",
  },
  quote: { margin: "8px 0 10px", fontSize: "1.2rem", lineHeight: 1.5 },
  author: { margin: "0 0 12px", color: "#9fb0cc", textAlign: "right" },
  controls: { display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" },
  btn: {
    background: "transparent",
    color: "#dbeafe",
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  primaryBtn: {
    background: "linear-gradient(90deg,#6d28d9,#06b6d4)",
    color: "#fff",
    padding: "8px 14px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
  },
  footer: { marginTop: "18px" },
  muted: { color: "#94a3b8" },
  error: { color: "#ffb4b4", marginTop: "10px" },
};

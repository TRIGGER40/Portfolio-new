import { useState, useRef } from "react";
import { useSearchContext } from "../context/SearchContext";
import styles from "./ConversationInput.module.css";

export function ConversationInput() {
  const { sendMessage, isStreaming } = useSearchContext();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isStreaming ? "Generating response..." : "Ask a follow-up question..."}
        className={styles.input}
        aria-label="Ask Midhun's resume"
        disabled={isStreaming}
      />
      <button type="submit" className={styles.submit} aria-label="Send" disabled={isStreaming}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </button>
    </form>
  );
}

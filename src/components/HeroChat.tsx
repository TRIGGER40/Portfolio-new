import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchContext } from "../context/SearchContext";
import styles from "./HeroChat.module.css";

function TypingIndicator() {
  return (
    <span className={styles.typing}>
      <span />
      <span />
      <span />
    </span>
  );
}

function formatMessage(text: string) {
  const parts: React.ReactNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const lineBreak = remaining.indexOf("\n");

    if (boldMatch && (lineBreak === -1 || boldMatch.index! < lineBreak)) {
      if (boldMatch.index! > 0) {
        parts.push(remaining.slice(0, boldMatch.index));
      }
      parts.push(<strong key={parts.length}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index! + boldMatch[0].length);
    } else if (lineBreak !== -1) {
      if (lineBreak > 0) {
        parts.push(remaining.slice(0, lineBreak));
      }
      parts.push(<br key={parts.length} />);
      remaining = remaining.slice(lineBreak + 1);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts;
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: { role: string; content: string };
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";
  const showTyping = !isUser && isStreaming && !message.content;

  return (
    <motion.div
      className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className={styles.avatar} aria-hidden="true">
          <span>MK</span>
        </div>
      )}
      <div className={styles.content}>
        {!isUser && <span className={styles.label}>Midhun's Resume</span>}
        <div className={styles.text}>
          {showTyping ? <TypingIndicator /> : formatMessage(message.content)}
        </div>
      </div>
    </motion.div>
  );
}

export function HeroChat() {
  const { conversationHistory, exitConversationMode, isStreaming } = useSearchContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversationHistory]);

  if (conversationHistory.length === 0) return null;

  return (
    <motion.div
      className={styles.panel}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.header}>
        <span className={styles.badge}>
          <span className={styles.badgeDot} />
          AI chat
        </span>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={exitConversationMode}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      <div ref={scrollRef} className={styles.messages}>
        <AnimatePresence mode="popLayout">
          {conversationHistory.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              isStreaming={isStreaming && i === conversationHistory.length - 1}
            />
          ))}
        </AnimatePresence>
      </div>

      <p className={styles.hint}>Type above and press Enter to continue the conversation</p>
    </motion.div>
  );
}

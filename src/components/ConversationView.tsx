import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchContext } from "../context/SearchContext";
import { ConversationInput } from "./ConversationInput";
import styles from "./ConversationView.module.css";

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {!isUser && (
        <div className={styles.avatar} aria-hidden="true">
          <span>MK</span>
        </div>
      )}
      <div className={styles.content}>
        {!isUser && <span className={styles.label}>Midhun's Resume</span>}
        <div
          className={`${styles.text} ${!isUser ? styles.assistantTextBody : ""}`}
        >
          {showTyping ? <TypingIndicator /> : formatMessage(message.content)}
        </div>
      </div>
    </motion.div>
  );
}

export function ConversationView() {
  const { conversationHistory, exitConversationMode, isStreaming, inputOriginRect } = useSearchContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasOrigin = inputOriginRect && inputOriginRect.width > 0;
  const lastMessageContent = conversationHistory.at(-1)?.content ?? "";

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: isStreaming ? "auto" : "smooth",
    });
  }, [conversationHistory, lastMessageContent, isStreaming]);

  return (
    <motion.div
      className={styles.container}
      initial={
        hasOrigin
          ? {
              top: inputOriginRect!.top,
              left: inputOriginRect!.left,
              width: inputOriginRect!.width,
              height: inputOriginRect!.height,
              borderRadius: 24,
              opacity: 1,
              boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
            }
          : { opacity: 0 }
      }
      animate={{
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: 0,
        opacity: 1,
        boxShadow: "none",
      }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{
        position: "fixed",
        overflow: "hidden",
        zIndex: 60,
      }}
    >
      <motion.div
        className={styles.inner}
        initial={{ opacity: hasOrigin ? 0 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: hasOrigin ? 0.25 : 0, duration: 0.3 }}
        style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}
      >
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            AI Resume
          </div>
          <h1 className={styles.title}>Conversation with Midhun's Resume</h1>
          <p className={styles.subtitle}>
            Ask anything — why hire, Adobe work, AI projects, impact, leadership
          </p>
        </div>
        <button
          type="button"
          className={styles.backBtn}
          onClick={exitConversationMode}
          aria-label="Back to portfolio"
        >
          ← Back to portfolio
        </button>
      </header>

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

      <ConversationInput />
      </motion.div>
    </motion.div>
  );
}

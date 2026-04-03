import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectChat } from "../hooks/useProjectChat";
import { useVisualViewportKeyboardInset } from "../hooks/useVisualViewportKeyboardInset";
import { getProjectContext } from "../data/projectContext";
import styles from "./ProjectChat.module.css";

interface ProjectChatProps {
  projectId: string;
  projectTitle: string;
}

/** Simple bold markdown → <strong> */
function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}

export function ProjectChat({ projectId, projectTitle }: ProjectChatProps) {
  const ctx = getProjectContext(projectId);
  const { messages, followUps, isStreaming, sendMessage } = useProjectChat(projectId);
  const [input, setInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const teaserInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll thread to bottom
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (modalOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [modalOpen]);

  // Activate keyboard inset tracking when modal is open
  useVisualViewportKeyboardInset(modalOpen);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [modalOpen]);

  // Scroll input into view when focused on mobile (safety net for keyboard)
  useEffect(() => {
    const el = inputRef.current;
    if (!el || !modalOpen) return;
    const handleFocus = () => {
      requestAnimationFrame(() => {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    };
    el.addEventListener("focus", handleFocus);
    return () => el.removeEventListener("focus", handleFocus);
  }, [modalOpen]);

  // Scroll teaser input into view when keyboard opens on mobile
  useEffect(() => {
    const el = teaserInputRef.current;
    if (!el) return;
    const handleFocus = () => {
      // Delay to let keyboard animation settle
      setTimeout(() => {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 350);
    };
    el.addEventListener("focus", handleFocus);
    return () => el.removeEventListener("focus", handleFocus);
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;
      if (!modalOpen) setModalOpen(true);
      sendMessage(trimmed);
      setInput("");
    },
    [isStreaming, modalOpen, sendMessage],
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleSeedClick = (text: string) => {
    handleSend(text);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  if (!ctx) return null;

  return (
    <>
      {/* ── Teaser section (below project card) ── */}
      <div className={styles.teaser}>
        <div className={styles.teaserHeader}>
          <span className={styles.teaserIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <h3 className={styles.teaserLabel}>Ask AI about this project</h3>
          {messages.length > 0 && (
            <button className={styles.openChatBtn} onClick={() => setModalOpen(true)}>
              Open Chat
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.seedPills}>
          <div className={styles.seedPillsTrack}>
            {ctx.seedFollowUps.map((q, i) => (
              <button key={i} className={styles.seedPill} onClick={() => handleSeedClick(q)}>
                {q}
              </button>
            ))}
            {/* Duplicate for seamless infinite scroll */}
            {ctx.seedFollowUps.map((q, i) => (
              <button key={`dup-${i}`} className={styles.seedPill} onClick={() => handleSeedClick(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>

        <form className={styles.teaserInput} onSubmit={handleSubmit}>
          <div className={styles.inputGlowMask} aria-hidden="true">
            <div className={styles.inputGlowRing} />
          </div>
          <input
            ref={teaserInputRef}
            className={styles.input}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={ctx.chatPlaceholder}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>

      {/* ── Fullscreen modal takeover ── */}
      {createPortal(
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
            >
              <motion.div
                className={styles.modal}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className={styles.modalHeader}>
                  <div className={styles.modalHeaderLeft}>
                    <span className={styles.teaserIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </span>
                    <span className={styles.modalTitle}>{projectTitle}</span>
                  </div>
                  <button
                    className={styles.closeBtn}
                    onClick={handleClose}
                    aria-label="Close chat"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Message thread */}
                <div className={styles.thread} ref={threadRef}>
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`${styles.msgRow} ${msg.role === "user" ? styles.msgRowUser : styles.msgRowAssistant}`}
                    >
                      {msg.role === "user" ? (
                        <div className={`${styles.msgBubble} ${styles.msgBubbleUser}`}>
                          <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                        </div>
                      ) : (
                        <div className={`${styles.msgBubble} ${styles.msgBubbleAssistant}`}>
                          <div className={styles.replyGlow}>
                            <div className={styles.replyInner}>
                              <div className={styles.answerLabel}>
                                AI Response
                              </div>
                              {msg.content === "" && isStreaming ? (
                                <span className={styles.streamingDots}>
                                  <span />
                                  <span />
                                  <span />
                                </span>
                              ) : (
                                <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Follow-up pills */}
                {followUps.length > 0 && !isStreaming && messages.length > 0 && (
                  <div className={styles.followUps}>
                    <div className={styles.followUpsTrack}>
                      {followUps.map((q, i) => (
                        <button key={i} className={styles.followUpPill} onClick={() => handleSeedClick(q)}>
                          {q}
                        </button>
                      ))}
                      {followUps.map((q, i) => (
                        <button key={`dup-${i}`} className={styles.followUpPill} onClick={() => handleSeedClick(q)}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal input */}
                <form className={styles.modalInput} onSubmit={handleSubmit}>
                  <div className={styles.inputGlowMask} aria-hidden="true">
                    <div className={styles.inputGlowRing} />
                  </div>
                  <input
                    ref={inputRef}
                    className={styles.input}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={ctx.chatPlaceholder}
                    disabled={isStreaming}
                  />
                  <button
                    type="submit"
                    className={styles.sendBtn}
                    disabled={isStreaming || !input.trim()}
                    aria-label="Send message"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </form>
                <p className={styles.disclaimer}>AI generated responses may be inaccurate.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

import { useState, useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useSearchContext } from "../context/SearchContext";
import { SEARCH_PROMPTS } from "../data/portfolioData";
import { SearchBar } from "./SearchBar";
import { InlineConversationCards } from "./InlineConversationCards";
import { ChatSuggestionPills } from "./ChatSuggestionPills";
import { HeroProjectSphere } from "./HeroProjectSphere";
import { FocusedMarquee } from "./FocusedMarquee";
import styles from "./Hero.module.css";

const transition = { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const };

const HERO_CHAT_SUBTEXT_LONG = (
  <>
    Ask AI about Midhun's core strengths, measurable impact,
    <br />
    or how his journey can translate into value for your team.
  </>
);
const HERO_CHAT_SUBTEXT_SHORT = "Ask AI about Midhun's experience and skills.";

function HeroChatSubtext({
  className,
  motion: motionCfg,
}: {
  className: string;
  motion?: {
    initial: boolean;
    animate: object;
    transition: object;
    style: CSSProperties;
  };
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLParagraphElement>(null);
  const [useShort, setUseShort] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const el = measureRef.current;
      if (!el) return;
      const style = getComputedStyle(el);
      const lhRaw = style.lineHeight;
      const fs = parseFloat(style.fontSize);
      const lh = lhRaw === "normal" || Number.isNaN(parseFloat(lhRaw)) ? fs * 1.45 : parseFloat(lhRaw);
      const lines = Math.max(1, Math.round(el.scrollHeight / lh));
      setUseShort(lines > 2);
    };
    const run = () => requestAnimationFrame(measure);
    run();
    const ro = new ResizeObserver(run);
    const node = wrapRef.current;
    if (node) ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const body = useShort ? HERO_CHAT_SUBTEXT_SHORT : HERO_CHAT_SUBTEXT_LONG;

  return (
    <div ref={wrapRef} className={styles.chatSubtextResponsiveWrap}>
      <p ref={measureRef} className={`${className} ${styles.chatSubtextMeasure}`} aria-hidden>
        {HERO_CHAT_SUBTEXT_LONG}
      </p>
      {motionCfg ? (
        <motion.p
          className={className}
          initial={motionCfg.initial}
          animate={motionCfg.animate}
          transition={motionCfg.transition}
          style={motionCfg.style}
        >
          {body}
        </motion.p>
      ) : (
        <p className={className}>{body}</p>
      )}
    </div>
  );
}

export function Hero({
  homeInputFocused,
  onScrollClick,
  onFocusStateChange,
  focusHomeSearchNonce = 0,
}: {
  homeInputFocused: boolean;
  onScrollClick?: () => void;
  onFocusStateChange?: (focused: boolean) => void;
  /** Increment when opening “Ask about Midhun” from ScrollHeader so the main search field can be focused after mount */
  focusHomeSearchNonce?: number;
}) {
  const {
    conversationHistory,
    exitConversationMode,
    canGoOlder,
    canGoNewer,
    goToOlderTurn,
    goToNewerTurn,
    goToLatestTurn,
    isStreaming,
    chatThemeVars,
  } = useSearchContext();
  const [promptIndex, setPromptIndex] = useState(0);
  const homeFocusedSearchInputRef = useRef<HTMLInputElement>(null);
  const lastHomeSearchFocusNonce = useRef(0);
  const isNarrowViewport = useMediaQuery("(max-width: 1279px)");
  /** Matches stacked query/response cards (InlineConversationCards) */
  const isStackedChat = useMediaQuery("(max-width: 1279px)");
  /** Arrows wrap below input — inline "Jump to latest" between them */
  const isArrowsBelowInput = useMediaQuery("(max-width: 768px)");
  const inChat = conversationHistory.length > 0;
  const inputRef = useRef<HTMLDivElement>(null);
  const queryPillRef = useRef<HTMLDivElement>(null);
  const replyPillRef = useRef<HTMLDivElement>(null);
  const pastReplyRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Conversation cards area — wheel targets here get answer-scroll-first behavior (desktop) */
  const pillsSlotRef = useRef<HTMLDivElement>(null);
  const homeFocusedSlotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPromptIndex((i) => (i + 1) % SEARCH_PROMPTS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (inChat) onFocusStateChange?.(false);
  }, [inChat, onFocusStateChange]);

  useEffect(() => {
    const html = document.documentElement;
    if (inChat) {
      html.classList.add("chat-page-scroll-lock");
    }
    return () => {
      html.classList.remove("chat-page-scroll-lock");
    };
  }, [inChat]);

  useEffect(() => {
    if (!homeInputFocused || focusHomeSearchNonce <= lastHomeSearchFocusNonce.current) return;
    lastHomeSearchFocusNonce.current = focusHomeSearchNonce;
    const t = window.setTimeout(() => {
      homeFocusedSearchInputRef.current?.focus({ preventScroll: true });
    }, 400);
    return () => clearTimeout(t);
  }, [homeInputFocused, focusHomeSearchNonce]);

  useEffect(() => {
    if (!homeInputFocused || inChat) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onFocusStateChange?.(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [homeInputFocused, inChat, onFocusStateChange]);

  const canGoOlderRef = useRef(canGoOlder);
  const canGoNewerRef = useRef(canGoNewer);
  const goToOlderRef = useRef(goToOlderTurn);
  const goToNewerRef = useRef(goToNewerTurn);
  canGoOlderRef.current = canGoOlder;
  canGoNewerRef.current = canGoNewer;
  goToOlderRef.current = goToOlderTurn;
  goToNewerRef.current = goToNewerTurn;

  const wheelCooldownRef = useRef(0);

  useEffect(() => {
    if (!inChat) return;
    /** Debounce turn changes only — avoids skipping two turns in one trackpad flick */
    const NAV_COOLDOWN_MS = 165;
    const SCROLL_EPS = 6;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as Node | null;
      if (!target || !pillsSlotRef.current?.contains(target)) return;

      const queryScroll = queryPillRef.current?.querySelector("[data-query-scroll]");
      if (queryScroll?.contains(target)) return;

      const scrollEl = (() => {
        const reply = replyPillRef.current;
        if (!reply) return null;
        return (
          (reply.querySelector("[data-answer-scroll]") as HTMLElement | null) ??
          (reply.closest("[data-answer-scroll]") as HTMLElement | null)
        );
      })();
      if (isStreaming && scrollEl) {
        const maxWhileStreaming = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
        if (maxWhileStreaming <= SCROLL_EPS) return;
      }

      const now = Date.now();

      const navigateOlder = () => {
        if (!canGoOlderRef.current || now < wheelCooldownRef.current) return;
        e.preventDefault();
        wheelCooldownRef.current = now + NAV_COOLDOWN_MS;
        goToOlderRef.current();
        navigator.vibrate?.(15);
      };
      const navigateNewer = () => {
        if (!canGoNewerRef.current || now < wheelCooldownRef.current) return;
        e.preventDefault();
        wheelCooldownRef.current = now + NAV_COOLDOWN_MS;
        goToNewerRef.current();
        navigator.vibrate?.(15);
      };

      if (!scrollEl) {
        /* Scroll up → older turns; scroll down → newer (desktop only — see listener guard below) */
        if (e.deltaY < 0) navigateOlder();
        else if (e.deltaY > 0) navigateNewer();
        return;
      }

      const maxScroll = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
      const overflow = maxScroll > SCROLL_EPS;

      if (!overflow) {
        if (e.deltaY < 0) navigateOlder();
        else if (e.deltaY > 0) navigateNewer();
        return;
      }

      const top = scrollEl.scrollTop;
      if (e.deltaY > 0) {
        /* Scrolling down in the answer; let native scroll until bottom, then → newer turn */
        if (top < maxScroll - SCROLL_EPS) return;
        navigateNewer();
        return;
      }
      if (e.deltaY < 0) {
        /* Scrolling up; at top of answer, → older turn */
        if (top > SCROLL_EPS) return;
        navigateOlder();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      /* ↑ = previous (older) turn, ↓ = next (newer) turn — matches thread nav */
      if (e.key === "ArrowUp" && canGoOlderRef.current) {
        e.preventDefault();
        goToOlderRef.current();
        navigator.vibrate?.(15);
      } else if (e.key === "ArrowDown" && canGoNewerRef.current) {
        e.preventDefault();
        goToNewerRef.current();
        navigator.vibrate?.(15);
      }
    };
    /* Desktop (≥1024px): wheel over Q/A cycles turns — scroll up → past, scroll down → toward latest.
       Mobile / tablet: wheel unchanged; use thread nav / Jump to latest. */
    if (!isNarrowViewport) {
      window.addEventListener("wheel", handleWheel, { passive: false });
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inChat, isNarrowViewport, isStreaming]);

  const chatInputStrip = (
    <motion.div
      ref={inputRef}
      className={styles.searchFixedSlot}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.42, 0, 1, 1], delay: 0.4 }}
    >
      <div className={styles.searchFixedCol}>
        <ChatSuggestionPills />
        <div className={`${styles.searchRow} ${styles.searchFixed}`}>
          <div className={styles.searchWrapper}>
            <SearchBar placeholder="Ask another question..." placeholderRotate fullWidth />
          </div>
          {(canGoOlder || canGoNewer) && (
            <div className={styles.threadNav}>
              <button
                type="button"
                className={styles.threadNavBtn}
                onClick={() => {
                  if (canGoOlder) {
                    navigator.vibrate?.(15);
                    goToOlderTurn();
                  }
                }}
                disabled={!canGoOlder}
                aria-label="Older conversation"
              >
                <span className={styles.threadNavArrowUp} />
              </button>
              {isArrowsBelowInput && canGoNewer && (
                <button
                  type="button"
                  className={styles.jumpToLatestBtn}
                  onClick={() => {
                    navigator.vibrate?.(15);
                    goToLatestTurn();
                  }}
                  aria-label="Jump to latest conversation"
                >
                  Jump to latest
                </button>
              )}
              <button
                type="button"
                className={styles.threadNavBtn}
                onClick={() => {
                  if (canGoNewer) {
                    navigator.vibrate?.(15);
                    goToNewerTurn();
                  }
                }}
                disabled={!canGoNewer}
                aria-label="Newer conversation"
              >
                <span className={styles.threadNavArrowDown} />
              </button>
            </div>
          )}
        </div>
        <p className={styles.inputDisclaimer}>AI generated responses may be inaccurate.</p>
      </div>
      {canGoNewer && (
        <button
          type="button"
          className={styles.jumpToLatestFloating}
          onClick={() => {
            navigator.vibrate?.(15);
            goToLatestTurn();
          }}
          aria-label="Jump to latest conversation"
        >
          Jump to latest
        </button>
      )}
    </motion.div>
  );

  return (
    <section
      className={`${styles.hero} ${homeInputFocused || inChat ? styles.heroUiOverlay : ""} ${inChat ? styles.heroChatMode : ""}`}
      aria-label="Hero introduction"
    >
      <div className={styles.gradientMesh} aria-hidden="true">
        <div className={styles.meshOrb1} />
        <div className={styles.meshOrb2} />
        <div className={styles.meshOrb3} />
        <div className={styles.neuralLines} />
      </div>

      <motion.div
        className={`${styles.heroLayout} ${inChat ? styles.heroLayoutChat : ""}`}
      >
        <AnimatePresence mode="wait">
          {inChat ? (
            <motion.div
              key="chat"
              className={styles.heroChatRouteShell}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <div
                className={`${styles.heroChatInner} ${styles.chatThemeScope} ${isStackedChat ? styles.heroChatInnerStacked : ""}`}
                style={chatThemeVars as CSSProperties}
              >
              <motion.div
                className={styles.headlineFixedSlot}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.42, 0, 1, 1], delay: 0.4 }}
              >
                <div className={styles.heroTitleBlock}>
                  <div className={styles.chatHeadlineRow}>
                    <button
                      type="button"
                      className={styles.chatHeadlineBackArrow}
                      onClick={() => {
                        exitConversationMode();
                        navigator.vibrate?.(10);
                      }}
                      aria-label="Back to main portfolio and end chat"
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <h1 className={styles.headline}>Ask about Midhun</h1>
                  </div>
                  <HeroChatSubtext className={styles.chatSubtext} />
                </div>
              </motion.div>

              {!isStackedChat && chatInputStrip}

              <div
                ref={pillsSlotRef}
                className={`${styles.pillsSlot} ${isStackedChat ? styles.pillsSlotStackedChat : ""}`}
              >
                <div className={styles.pillsSlotInner}>
                  <InlineConversationCards
                    queryPillRef={queryPillRef}
                    replyPillRef={replyPillRef}
                    pastReplyRefs={pastReplyRefs}
                    wrapperClassName={styles.chatCardsMount}
                  />
                </div>
              </div>

              </div>
              {isStackedChat &&
                createPortal(
                  <div
                    className={`${styles.chatInputPortalLayer} ${styles.chatThemeScope}`}
                    style={chatThemeVars as CSSProperties}
                  >
                    {chatInputStrip}
                  </div>,
                  document.body,
                )}
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className={`${styles.heroHomeInner} ${styles.chatThemeScope} ${homeInputFocused ? styles.homeInputFocusedMode : ""}`}
              style={chatThemeVars as CSSProperties}
            >
              <div className={`${styles.homeContent} ${homeInputFocused ? styles.homeContentHidden : ""}`}>
                <div className={styles.content}>
                  <h1 className={styles.headline}>Hello, I'm Midhun Krishnakumar</h1>

                  <p className={styles.subline}>
                    Product Designer at Adobe, leading AI driven product evolution
                  </p>

                  <div className={styles.searchRow}>
                    <div className={styles.searchWrapper}>
                      <SearchBar
                        placeholder={SEARCH_PROMPTS[promptIndex]}
                        placeholderRotate
                        onFocus={() => onFocusStateChange?.(true)}
                      />
                    </div>
                  </div>

                  <p className={styles.hint}>
                    Ask AI about Midhun's skills, experience, journey and more
                  </p>
                </div>

                <div className={styles.sphereSection}>
                  <HeroProjectSphere />
                </div>
              </div>

              <AnimatePresence>
                {homeInputFocused && (
                  <motion.div
                    key="home-focus-backdrop"
                    className={styles.homeFocusedBackdrop}
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
              <div
                ref={homeFocusedSlotRef}
                className={`${styles.homeFocusedSlot} ${styles.chatThemeScope} ${
                  homeInputFocused ? styles.homeFocusedSlotVisible : ""
                }`}
                style={chatThemeVars as CSSProperties}
              >
                <AnimatePresence>
                  {homeInputFocused && (
                    <>
                      <motion.div
                        key="marquee-top"
                        className={styles.marqueeRowTop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                      >
                        <FocusedMarquee direction="left" rowIndex={0} />
                      </motion.div>
                      <motion.div
                        key="marquee-bottom"
                        className={styles.marqueeRowBottom}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                      >
                        <FocusedMarquee direction="right" rowIndex={1} />
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
                <motion.div
                  className={styles.homeFocusedSlotInner}
                  initial={false}
                  animate={homeInputFocused ? { opacity: 1 } : { opacity: 0 }}
                  transition={{
                    opacity: { duration: 0.2, delay: homeInputFocused ? 0.2 : 0 },
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  <div className={styles.heroTitleBlock}>
                    <motion.h1
                      className={styles.headline}
                      initial={false}
                      animate={homeInputFocused ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                      transition={{ duration: 0.2, delay: homeInputFocused ? 0.2 : 0 }}
                    >
                      Ask about Midhun
                    </motion.h1>
                    <HeroChatSubtext
                      className={styles.chatSubtext}
                      motion={{
                        initial: false,
                        animate: homeInputFocused ? { y: 0 } : { y: 6 },
                        transition: { duration: 0.2, delay: homeInputFocused ? 0.2 : 0 },
                        style: { opacity: homeInputFocused ? 0.5 : 0 },
                      }}
                    />
                  </div>
                  <motion.div
                    className={styles.pillsWrapper}
                    initial={false}
                    animate={homeInputFocused ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                    transition={{ duration: 0.2, delay: homeInputFocused ? 0.2 : 0 }}
                  >
                    <ChatSuggestionPills homeFocusAlign />
                  </motion.div>
                  <motion.div
                    className={styles.homeFocusedInputSlot}
                    initial={false}
                    animate={homeInputFocused ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                    transition={{ duration: 0.2, delay: homeInputFocused ? 0.2 : 0 }}
                  >
                    {homeInputFocused && (
                      <SearchBar
                        placeholder={SEARCH_PROMPTS[promptIndex]}
                        placeholderRotate
                        homeFocusAlign
                        inputRef={homeFocusedSearchInputRef}
                        onFocus={() => onFocusStateChange?.(true)}
                        autoFocus
                      />
                    )}
                  </motion.div>
                  <motion.p
                    className={styles.inputDisclaimer}
                    initial={false}
                    animate={homeInputFocused ? { opacity: 0.3 } : { opacity: 0 }}
                    transition={{ duration: 0.2, delay: homeInputFocused ? 0.2 : 0 }}
                  >
                    AI generated responses may be inaccurate.
                  </motion.p>
                  {isNarrowViewport && homeInputFocused && (
                    <button
                      type="button"
                      className={styles.touchFooterClose}
                      onClick={() => {
                        onFocusStateChange?.(false);
                        navigator.vibrate?.(12);
                      }}
                      aria-label="Close and return to home"
                    >
                      <svg
                        className={styles.touchFooterCloseIcon}
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {!inChat && !homeInputFocused && (
          <motion.button
            key="scrollIndicator"
            type="button"
            className={styles.scrollIndicator}
            onClick={onScrollClick}
            aria-label="Scroll to content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={transition}
          >
            <span className={styles.scrollChevron} />
          </motion.button>
        )}
      </AnimatePresence>

    </section>
  );
}

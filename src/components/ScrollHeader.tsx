import { useState, useEffect, type CSSProperties } from "react";
import { SearchBar } from "./SearchBar";
import { useSearchContext } from "../context/SearchContext";
import { SEARCH_PROMPTS } from "../data/portfolioData";
import { useMediaQuery } from "../hooks/useMediaQuery";
import styles from "./ScrollHeader.module.css";

const SCROLL_THRESHOLD = 80;

export function ScrollHeader({ onOpenAskFocused }: { onOpenAskFocused: () => void }) {
  const [visible, setVisible] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const { conversationHistory, chatThemeVars } = useSearchContext();
  const inChat = conversationHistory.length > 0;
  const isMobileHeader = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (inChat) {
      setVisible(false);
      document.body.classList.remove("scroll-header-visible");
      return;
    }
    const handleScroll = () => {
      const show = window.scrollY > SCROLL_THRESHOLD;
      setVisible(show);
      if (show) document.body.classList.add("scroll-header-visible");
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("scroll-header-visible");
    };
  }, [inChat]);

  useEffect(() => {
    if (isMobileHeader) return;
    const id = setInterval(() => {
      setPromptIndex((i) => (i + 1) % SEARCH_PROMPTS.length);
    }, 4000);
    return () => clearInterval(id);
  }, [isMobileHeader]);

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName === "opacity" && !visible) {
      document.body.classList.remove("scroll-header-visible");
    }
  };

  if (inChat) return null;

  /** Opens full-screen "Ask about Midhun" (title, suggestion pills, search) and focuses main field */
  const openAskFocus = () => {
    onOpenAskFocused();
    navigator.vibrate?.(10);
  };

  return (
    <header
      className={`${styles.header} ${isMobileHeader ? styles.headerMobile : ""} ${visible ? styles.visible : ""}`}
      role="banner"
      onTransitionEnd={handleTransitionEnd}
      aria-hidden={!visible}
    >
      {isMobileHeader ? (
        <div className={styles.mobileHeaderRow}>
          <h2 className={styles.name}>Midhun Krishnakumar</h2>
          <button
            type="button"
            className={styles.askAiGlowBtn}
            onClick={openAskFocus}
            tabIndex={visible ? 0 : -1}
            aria-label="Ask AI — open Ask about Midhun"
          >
            Ask AI
          </button>
        </div>
      ) : (
        <>
          <h2 className={styles.name}>Midhun Krishnakumar</h2>
          <div className={styles.searchWrap} style={chatThemeVars as CSSProperties}>
            <SearchBar
              placeholder={SEARCH_PROMPTS[promptIndex]}
              placeholderRotate
              compact
              scrollHeaderCompact
              onFocus={openAskFocus}
            />
          </div>
        </>
      )}
    </header>
  );
}

import { useSearchContext } from "../context/SearchContext";
import { SEARCH_PROMPTS } from "../data/portfolioData";
import { DEFAULT_FOLLOW_UPS } from "../lib/chatApi";
import { trackFollowUpClick } from "../lib/analytics";
import styles from "./ChatSuggestionPills.module.css";

export function ChatSuggestionPills({
  homeFocusAlign = false,
}: {
  /** Match prompt rail width to home overlay search (--home-focus-prompt-width) */
  homeFocusAlign?: boolean;
}) {
  const { conversationHistory, followUps, sendMessage, isStreaming } = useSearchContext();
  const pairCount = Math.floor(conversationHistory.length / 2);

  const pills = pairCount >= 1
    ? (followUps.length > 0 ? followUps : DEFAULT_FOLLOW_UPS)
    : [...SEARCH_PROMPTS];

  const handlePillClick = (text: string) => {
    if (isStreaming) return;
    trackFollowUpClick(text);
    sendMessage(text);
  };

  const trackKey = pairCount >= 1 ? pills.slice(0, 2).join("|") : "initial";

  return (
    <div
      className={`${styles.wrapper} ${homeFocusAlign ? styles.wrapperHomeFocus : ""}`.trim()}
    >
      <div className={styles.scrollViewport}>
        <div key={trackKey} className={styles.scrollTrack}>
          {[...pills, ...pills].map((text, i) => (
            <button
              key={`${text}-${i}`}
              type="button"
              className={styles.pill}
              onClick={() => handlePillClick(text)}
              disabled={isStreaming}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

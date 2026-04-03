import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchContext } from "../context/SearchContext";
import { buildCompanySweepGradient, buildCompanySweepHaloGradient } from "../config/companyGlowMap";
import styles from "./SearchBar.module.css";

/** Matches Hero `isStackedChat` — mobile / stacked chat input strip + keyboard UX */
function isMobileStackedChatViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1279px)").matches;
}

function assignInputRef(
  internal: React.MutableRefObject<HTMLInputElement | null>,
  external: React.Ref<HTMLInputElement> | undefined,
  el: HTMLInputElement | null
) {
  internal.current = el;
  if (typeof external === "function") external(el);
  else if (external) (external as React.MutableRefObject<HTMLInputElement | null>).current = el;
}

interface SearchBarProps {
  placeholder?: string;
  placeholderRotate?: boolean;
  compact?: boolean;
  wide?: boolean;
  /** Fill the parent width (e.g. stacked mobile chat) */
  fullWidth?: boolean;
  /** Home “Ask about Midhun” overlay: match --home-focus-prompt-width */
  homeFocusAlign?: boolean;
  /** Smaller padding/typography for fixed scroll header on narrow viewports (see ScrollHeader) */
  scrollHeaderCompact?: boolean;
  /** Optional ref to the native input (programmatic focus after overlay opens) */
  inputRef?: React.Ref<HTMLInputElement>;
  onFocus?: () => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = "Search portfolio...",
  placeholderRotate: _placeholderRotate,
  compact = false,
  wide = false,
  fullWidth = false,
  homeFocusAlign = false,
  scrollHeaderCompact = false,
  inputRef: inputRefProp,
  onFocus,
  onBlur,
  autoFocus = false,
}: SearchBarProps) {
  const {
    query,
    setQuery,
    enterConversationMode,
    sendMessage,
    conversationHistory,
    companyInputPreview,
    activeThemeCompany,
    appliedCompanyMatch,
    commitCompanyTheme,
    showSearchCustomizationTag,
    dismissSearchCustomizationTag,
  } = useSearchContext();
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inChat = conversationHistory.length > 0;

  const setChatInputComposeActive = useCallback((active: boolean) => {
    if (!inChat || !isMobileStackedChatViewport()) return;
    const root = document.documentElement;
    if (active) root.setAttribute("data-chat-input-compose", "");
    else root.removeAttribute("data-chat-input-compose");
  }, [inChat]);

  useEffect(() => {
    if (!inChat) document.documentElement.removeAttribute("data-chat-input-compose");
  }, [inChat]);

  const effectiveValue = compact ? localValue : query;

  const prevHistoryLengthRef = useRef(conversationHistory.length);
  useEffect(() => {
    const prev = prevHistoryLengthRef.current;
    prevHistoryLengthRef.current = conversationHistory.length;
    if (prev > 0 && conversationHistory.length === 0) {
      setLocalValue("");
    }
  }, [conversationHistory.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" || !effectiveValue.trim()) return;
    e.preventDefault();

    /* Secret passphrase → UX report page */
    if (effectiveValue.trim() === "vishnupriyacp@1234") {
      setQuery("");
      if (compact) setLocalValue("");
      navigate("/ux-report", { state: { authorized: true } });
      return;
    }

    if (inChat) {
      sendMessage(effectiveValue.trim());
      setQuery("");
      if (compact) setLocalValue("");
      /* Dismiss software keyboard on phones/tablet; clears compose blur */
      if (isMobileStackedChatViewport()) {
        requestAnimationFrame(() => inputRef.current?.blur());
      }
    } else {
      const rect = wrapperRef.current?.getBoundingClientRect();
      const originRect = rect
        ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        : undefined;
      enterConversationMode(effectiveValue.trim(), originRect);
      setQuery("");
      if (compact) setLocalValue("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    /* Keep `query` in sync so background glow + portfolio search see typed text (including compact header). */
    setQuery(v);
    if (compact) setLocalValue(v);
  };

  const handleClearInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setQuery("");
    if (compact) setLocalValue("");
    inputRef.current?.focus();
  };

  const [sweepGen, setSweepGen] = useState(0);
  const [sweepVisible, setSweepVisible] = useState(false);
  const inputPreviewRef = useRef(companyInputPreview);

  const inputPreview = companyInputPreview;
  const applied = appliedCompanyMatch;
  inputPreviewRef.current = inputPreview;

  /** Real-time theme comes from context; sweep plays when the input box newly matches a company vs last sweep commit. */
  useEffect(() => {
    const next = inputPreview.matched ? inputPreview.matchedCompany : null;
    if (!next) {
      setSweepVisible(false);
      return;
    }
    if (next === applied) {
      setSweepVisible(false);
      return;
    }
    setSweepGen((g) => g + 1);
    setSweepVisible(true);
  }, [inputPreview.matched, inputPreview.matchedCompany, applied]);

  const handleCompanySweepEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    setSweepVisible(false);
    const intent = (e.currentTarget as HTMLElement).dataset.intent as KnownCompany | undefined;
    if (!intent) return;
    const p = inputPreviewRef.current;
    if (p.matched && p.matchedCompany === intent) {
      commitCompanyTheme(intent);
    }
  };

  const showCompanySweep =
    sweepVisible && inputPreview.matched && inputPreview.matchedCompany != null;

  const showCustomizationChip =
    inChat && showSearchCustomizationTag && !scrollHeaderCompact && activeThemeCompany;

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${isFocused ? styles.focused : ""} ${compact ? styles.compact : ""} ${wide ? styles.wide : ""} ${fullWidth ? styles.fullWidth : ""} ${homeFocusAlign ? styles.wrapperHomeFocus : ""} ${scrollHeaderCompact ? styles.scrollHeaderCompact : ""}`.trim()}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Mask stays on the outer node; inner node only rotates the gradient (original ring pattern). */}
      {isFocused && (
        <div className={styles.glowRingMask} aria-hidden>
          <span className={styles.glowRing} />
        </div>
      )}
      {showCompanySweep && (
        <div className={styles.companySweep} aria-hidden>
          <div
            key={`halo-${sweepGen}`}
            className={styles.companySweepHalo}
            style={{ background: buildCompanySweepHaloGradient(inputPreview.glow) }}
            aria-hidden
          />
          <div
            key={sweepGen}
            className={styles.companySweepBand}
            data-intent={inputPreview.matchedCompany ?? ""}
            style={
              {
                background: buildCompanySweepGradient(inputPreview.glow),
                "--sweep-glow-a": inputPreview.glow.primary,
                "--sweep-glow-b": inputPreview.glow.accent,
              } as React.CSSProperties
            }
            onAnimationEnd={handleCompanySweepEnd}
          />
        </div>
      )}
      <div
        className={styles.searchInner}
      >
        <span className={styles.icon} aria-hidden="true">
          <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </span>
        <div
          className={`${styles.inputTrack} ${showCustomizationChip && effectiveValue.length > 0 ? styles.inputTrackWithClear : ""}`.trim()}
        >
          <input
            ref={(el) => assignInputRef(inputRef, inputRefProp, el)}
            type={showCustomizationChip ? "text" : "search"}
            value={effectiveValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              setChatInputComposeActive(true);
              onFocus?.();
            }}
            onBlur={(e) => {
              setIsFocused(false);
              setChatInputComposeActive(false);
              onBlur?.(e);
            }}
            placeholder={placeholder}
            className={styles.input}
            aria-label="Search portfolio by keyword"
            autoComplete="off"
            autoFocus={autoFocus}
          />
          {showCustomizationChip && effectiveValue.length > 0 && (
            <button
              type="button"
              className={styles.searchClearBtn}
              aria-label="Clear search"
              onClick={handleClearInput}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg className={styles.searchClearIcon} viewBox="0 0 12 12" aria-hidden>
                <path
                  d="M2.5 2.5l7 7M9.5 2.5l-7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
        {showCustomizationChip && (
          <div
            className={styles.customizationChip}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className={styles.customizationChipLabel}>{activeThemeCompany}</span>
            <button
              type="button"
              className={styles.customizationChipDismiss}
              aria-label={`Dismiss ${activeThemeCompany} badge`}
              onClick={(e) => {
                e.stopPropagation();
                dismissSearchCustomizationTag();
              }}
            >
              <svg
                className={styles.customizationChipDismissIcon}
                viewBox="0 0 12 12"
                aria-hidden
              >
                <path
                  d="M2.5 2.5l7 7M9.5 2.5l-7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

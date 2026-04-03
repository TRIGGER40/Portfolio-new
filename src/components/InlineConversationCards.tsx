import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSearchContext } from "../context/SearchContext";
import { getPairAt } from "../context/SearchContext";
import type { ChatReplyKind } from "../lib/chatApi";
import { CASE_STUDIES } from "../data/portfolioData";
import { useMediaQuery } from "../hooks/useMediaQuery";
import styles from "./InlineConversationCards.module.css";

/** Matches CSS breakpoint where query + response stack vertically (mobile) */
const STACKED_CHAT_QUERY = "(max-width: 1279px)";

export interface InlineConversationCardsRefs {
  queryPillRef: React.RefObject<HTMLDivElement | null>;
  replyPillRef: React.RefObject<HTMLDivElement | null>;
  pastReplyRefs?: React.RefObject<(HTMLDivElement | null)[]>;
  /** Merged onto the root wrapper (e.g. flex sizing from Hero chat layout) */
  wrapperClassName?: string;
}

const REPLY_REVEAL_DELAY_MS = 400;
const SCALE_PER_DEPTH = 0.72;
const OPACITY_PER_DEPTH = 0.3;
const SPHERE_RADIUS = 200;

function GeneratingLoader() {
  return (
    <span className={styles.generating}>
      <span className={styles.generatingText}>Generating response</span>
      <span className={styles.generatingDots}>
        <span />
        <span />
        <span />
      </span>
    </span>
  );
}

function isNoInfoResponse(content: string): boolean {
  const lower = content.toLowerCase().trim();
  return (
    lower.includes("i don't have that information") ||
    lower.includes("i don't have that info") ||
    lower.includes("i'm here to talk about midhun's work")
  );
}

/** Welcoming closings like "feel free to ask… I'm here to help" (fallback when API omits replyKind invite). */
function isInvitationStyleResponse(content: string): boolean {
  const lower = content.toLowerCase();
  if (
    lower.includes("if you have any questions") &&
    (lower.includes("midhun") || lower.includes("his work") || lower.includes("experience") || lower.includes("projects")) &&
    (lower.includes("feel free") ||
      lower.includes("here to help") ||
      lower.includes("happy to help") ||
      lower.includes("glad to help") ||
      lower.includes("ask"))
  ) {
    return true;
  }
  if (
    (lower.includes("feel free to ask") || lower.includes("feel free to reach")) &&
    (lower.includes("here to help") || lower.includes("happy to help") || lower.includes("glad to help"))
  ) {
    return true;
  }
  if (
    lower.includes("don't hesitate") &&
    lower.includes("ask") &&
    (lower.includes("midhun") || lower.includes("portfolio") || lower.includes("work"))
  ) {
    return true;
  }
  return false;
}

function shouldShowSuggestedPrompts(assistantContent: string, latestReplyKind: ChatReplyKind | null): boolean {
  if (latestReplyKind === "redirect" || latestReplyKind === "invite") return true;
  if (isNoInfoResponse(assistantContent)) return true;
  return isInvitationStyleResponse(assistantContent);
}

function getSuggestedPromptsHeader(assistantContent: string, latestReplyKind: ChatReplyKind | null): string {
  if (
    latestReplyKind === "redirect" ||
    latestReplyKind === "invite" ||
    isInvitationStyleResponse(assistantContent)
  ) {
    return "Suggested prompts";
  }
  return "You could ask me about,";
}

/** Map of keyword phrases → project ID for linking project mentions in AI responses.
 *  Sorted longest-first so "Adobe Connect homepage" matches before "Adobe Connect". */
const PROJECT_KEYWORDS: { pattern: RegExp; id: string; label: string }[] = (() => {
  // Extra aliases beyond just the title
  const aliases: Record<string, string[]> = {
    "gen-ai": ["Gen AI Explorations", "Gen AI exploration", "GenAI"],
    "quiz-pod": ["Quiz Pod", "quiz pod feature"],
    "event-joining": ["joining experience", "event joining"],
    "connect-homepage": ["Adobe Connect homepage", "Connect homepage", "homepage revamp"],
    "adobe-visual-design": ["visual design works"],
    "bizongo-ums": ["user management system", "managing users"],
    "bizongo-qc": ["quality check", "QC system"],
    "bizongo-artwork-flow": ["approval workflow", "artwork flow"],
    "bizongo-contracts": ["modular contract", "contract creation"],
    "yuj-heuristics": ["heuristics evaluation"],
    "bizongo-ecom": ["PPE kits", "e-commerce platform"],
    "bizongo-design-system": ["design system"],
    "nid-ui-ux-course": ["UI/UX Course", "UX workshops"],
    "npol-ctd-probe": ["CTD Probe", "CTD probe structure"],
  };

  const entries: { phrase: string; id: string; label: string }[] = [];

  for (const cs of CASE_STUDIES) {
    // Add the title itself
    entries.push({ phrase: cs.title, id: cs.id, label: cs.title });
    // Add aliases
    const extra = aliases[cs.id];
    if (extra) {
      for (const a of extra) {
        entries.push({ phrase: a, id: cs.id, label: cs.title });
      }
    }
  }

  // Sort longest first for greedy matching
  entries.sort((a, b) => b.phrase.length - a.phrase.length);

  // Build case-insensitive regex for each (word-boundary aware)
  return entries.map((e) => ({
    pattern: new RegExp(`(${e.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i"),
    id: e.id,
    label: e.label,
  }));
})();

/** Find the first project keyword match in a plain text segment. */
function findProjectMatch(text: string): { index: number; length: number; id: string; matched: string } | null {
  let best: { index: number; length: number; id: string; matched: string } | null = null;
  for (const kw of PROJECT_KEYWORDS) {
    const m = text.match(kw.pattern);
    if (m && m.index != null) {
      if (!best || m.index < best.index || (m.index === best.index && m[0].length > best.length)) {
        best = { index: m.index, length: m[0].length, id: kw.id, matched: m[0] };
      }
    }
  }
  return best;
}

/** Linkify a plain-text segment — turns project mentions into <Link> elements. */
function linkifySegment(text: string, keyOffset: number): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let remaining = text;
  let ki = keyOffset;
  const linked = new Set<string>(); // only link each project once per response

  while (remaining.length > 0) {
    const match = findProjectMatch(remaining);
    if (!match || linked.has(match.id)) {
      // If this project was already linked, skip this match and push text through it
      if (match && linked.has(match.id)) {
        out.push(remaining.slice(0, match.index + match.length));
        remaining = remaining.slice(match.index + match.length);
        continue;
      }
      out.push(remaining);
      break;
    }
    if (match.index > 0) {
      out.push(remaining.slice(0, match.index));
    }
    linked.add(match.id);
    out.push(
      <Link
        key={`plink-${ki++}`}
        to={`/project/${match.id}`}
        className={styles.projectLink}
        onClick={(e) => e.stopPropagation()}
      >
        {match.matched}
      </Link>,
    );
    remaining = remaining.slice(match.index + match.length);
  }
  return out;
}

function formatMessage(text: string) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const lineBreak = remaining.indexOf("\n");

    if (boldMatch && (lineBreak === -1 || boldMatch.index! < lineBreak)) {
      if (boldMatch.index! > 0) {
        parts.push(...linkifySegment(remaining.slice(0, boldMatch.index), keyIdx));
        keyIdx += 10;
      }
      // Bold text can also contain project links
      const boldContent = linkifySegment(boldMatch[1], keyIdx);
      keyIdx += 10;
      parts.push(<strong key={`b-${keyIdx}`}>{boldContent}</strong>);
      remaining = remaining.slice(boldMatch.index! + boldMatch[0].length);
    } else if (lineBreak !== -1) {
      if (lineBreak > 0) {
        parts.push(...linkifySegment(remaining.slice(0, lineBreak), keyIdx));
        keyIdx += 10;
      }
      parts.push(<br key={`br-${keyIdx++}`} />);
      remaining = remaining.slice(lineBreak + 1);
    } else {
      parts.push(...linkifySegment(remaining, keyIdx));
      break;
    }
  }

  return parts;
}

function PairPills({
  userContent,
  assistantContent,
  isStreaming,
  showReply,
  isActive,
  isLatestReply,
  pairIndex,
  stackDepth,
  queryPillRef,
  replyPillRef,
  pastReplyRefs,
  followUps,
  latestReplyKind,
  onPillClick,
}: {
  userContent: string;
  assistantContent: string;
  isStreaming: boolean;
  showReply: boolean;
  isActive: boolean;
  isLatestReply: boolean;
  pairIndex: number;
  stackDepth: number;
  queryPillRef?: React.RefObject<HTMLDivElement | null>;
  replyPillRef?: React.RefObject<HTMLDivElement | null>;
  pastReplyRefs?: React.RefObject<(HTMLDivElement | null)[]>;
  followUps?: string[];
  latestReplyKind: ChatReplyKind | null;
  onPillClick?: (text: string) => void;
}) {
  const showGenerating = isStreaming && !showReply;
  const answerScrollRef = useRef<HTMLDivElement>(null);
  const isStackedChatLayout = useMediaQuery(STACKED_CHAT_QUERY);
  const stackedScrollOnShell = isStackedChatLayout && isActive;
  const scale = Math.pow(SCALE_PER_DEPTH, stackDepth);
  const opacity = Math.pow(OPACITY_PER_DEPTH, stackDepth);
  const backdropBlurPx = 20 + stackDepth * 12;
  const contentBlurPx = 2 + stackDepth * 3;

  const hasContent = showReply && assistantContent.length > 0;
  const pillGroupClass = `${styles.pillGroup} ${!isActive ? styles.pillGroupPast : ""} ${stackedScrollOnShell ? styles.pillGroupStackedShell : ""} ${stackedScrollOnShell && hasContent ? styles.pillGroupHasContent : ""}`.trim();
  const groupBlurStyle = !isActive ? { filter: `blur(${contentBlurPx}px)` } : undefined;
  const suggestedPromptsHeader = getSuggestedPromptsHeader(assistantContent, latestReplyKind);

  useLayoutEffect(() => {
    if (!isActive) return;
    const el = answerScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [isActive, assistantContent, isStreaming, showGenerating, showReply]);

  return (
    <motion.div className={pillGroupClass} style={groupBlurStyle} animate={{ scale, opacity }} transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}>
      <motion.div
        ref={isActive ? queryPillRef : undefined}
        className={`${styles.pill} ${styles.queryPill} ${isActive ? styles.pillActive : ""}`}
        style={!isActive ? { backdropFilter: `blur(${backdropBlurPx}px)`, WebkitBackdropFilter: `blur(${backdropBlurPx}px)` } : undefined}
        animate={{ y: isActive ? [-6, -10, -6] : 0 }}
        transition={{
          y: isActive
            ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
        }}
        whileHover={isActive ? { y: -12, transition: { duration: 0.2 } } : undefined}
      >
        <div className={styles.queryScrollRegion} data-query-scroll>
          <span className={styles.pillText}>{userContent}</span>
        </div>
      </motion.div>

      <motion.div
        className={isActive ? `${styles.replyGlowWrapper} ${styles.replyPillSlot}` : styles.replyPillSlot}
        animate={{ y: isActive ? [-6, -10, -6] : 0 }}
        transition={{
          y: isActive
            ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
        }}
        whileHover={isActive ? { y: -12, transition: { duration: 0.2 } } : undefined}
      >
        <motion.div
          ref={
            isActive
              ? replyPillRef
              : pastReplyRefs
                ? (el) => {
                    if (pastReplyRefs.current) pastReplyRefs.current[pairIndex] = el;
                  }
                : undefined
          }
          className={`${styles.pill} ${styles.answerPill} ${isActive ? styles.pillActive : ""}`}
          style={!isActive ? { backdropFilter: `blur(${backdropBlurPx}px)`, WebkitBackdropFilter: `blur(${backdropBlurPx}px)` } : undefined}
        >
        <div className={styles.answerLabel}>
          AI response
        </div>
        <div ref={answerScrollRef} className={styles.answerScrollRegion} data-answer-scroll>
          <div className={styles.pillText}>
            {showGenerating ? (
              <GeneratingLoader />
            ) : showReply ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                {formatMessage(assistantContent)}
              </motion.span>
            ) : null}
          </div>
        </div>
        {showReply &&
          !isStreaming &&
          isLatestReply &&
          shouldShowSuggestedPrompts(assistantContent, latestReplyKind) &&
          followUps &&
          followUps.length > 0 &&
          onPillClick && (
            <div className={styles.youCouldAsk}>
              <span className={styles.youCouldAskHeader}>{suggestedPromptsHeader}</span>
              <div className={styles.youCouldAskGrid}>
                {followUps.map((text, idx) => (
                  <button
                    key={`${text}-${idx}`}
                    type="button"
                    className={styles.youCouldAskPill}
                    onClick={() => onPillClick(text)}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function InlineConversationCardsInner({
  queryPillRef,
  replyPillRef,
  pastReplyRefs,
  wrapperClassName,
}: {
  queryPillRef: React.RefObject<HTMLDivElement | null>;
  replyPillRef: React.RefObject<HTMLDivElement | null>;
  pastReplyRefs?: React.RefObject<(HTMLDivElement | null)[]>;
  wrapperClassName?: string;
}) {
  const { conversationHistory, isStreaming, currentTurnIndex, followUps, latestReplyKind, sendMessage } =
    useSearchContext();
  /* Ceil so the in-progress pair (odd-length history) still renders one row */
  const pairCount = Math.ceil(conversationHistory.length / 2);
  const maxTurnIndex = Math.max(0, pairCount - 1);
  const safeTurnIndex = Math.min(Math.max(0, currentTurnIndex), maxTurnIndex);
  const activePairIndex = pairCount - 1 - safeTurnIndex;
  const activePair = getPairAt(conversationHistory, activePairIndex);
  const activeAssistantContent = activePair?.assistant ?? "";
  const hasReply = activeAssistantContent.length > 0;

  const [showReply, setShowReply] = useState(false);
  const isStackedStage = useMediaQuery(STACKED_CHAT_QUERY);
  const viewingLatestTurn = activePairIndex === pairCount - 1;

  useEffect(() => {
    if (!hasReply) {
      setShowReply(false);
      return;
    }
    /* Older turns already have a stored assistant message — don’t re-hide behind the reveal delay */
    if (!viewingLatestTurn) {
      setShowReply(true);
      return;
    }
    /* If the stream already finished, don’t wait on the timer (effect wouldn’t re-run otherwise) */
    if (!isStreaming) {
      setShowReply(true);
      return;
    }
    const t = window.setTimeout(() => setShowReply(true), REPLY_REVEAL_DELAY_MS);
    return () => clearTimeout(t);
  }, [hasReply, viewingLatestTurn, isStreaming]);

  if (conversationHistory.length === 0) return null;

  const getSpherePosition = (pairIndex: number) => {
    if (pairIndex === activePairIndex) return { x: 0, y: 0 };
    const angleDeg = (pairIndex * 211 + pairIndex * pairIndex * 37 + 47) % 360;
    const angleRad = (angleDeg * Math.PI) / 180;
    const radiusVariation = 0.75 + ((pairIndex * 17) % 50) / 100;
    const r = SPHERE_RADIUS * radiusVariation;
    const x = r * Math.cos(angleRad);
    const y = r * Math.sin(angleRad);
    return { x, y };
  };

  return (
    <div className={`${styles.wrapper} ${wrapperClassName ?? ""}`.trim()}>
      <div className={styles.sphereStage}>
        {Array.from({ length: pairCount }, (_, idx) => {
          const i = pairCount - 1 - idx;
          const pair = getPairAt(conversationHistory, i);
          if (!pair) return null;
          const isActive = i === activePairIndex;
          const stackDepth = Math.abs(activePairIndex - i);
          const { x, y } = getSpherePosition(i);
          const isActivePairStreaming = isActive && activePairIndex === pairCount - 1 && isStreaming;
          const pairHasReply = (getPairAt(conversationHistory, i)?.assistant.length ?? 0) > 0;
          const pairShowReply = isActive ? showReply : pairHasReply;
          const stackedHidden = isStackedStage && !isActive;
          const stackedActive = isStackedStage && isActive;

          return (
            <div
              key={i}
              className={`${styles.sphereLayer} ${stackedHidden ? styles.sphereLayerStackedHidden : ""} ${stackedActive ? styles.sphereLayerStackedActive : ""}`}
              style={{
                zIndex: isActive ? pairCount : pairCount - stackDepth,
              }}
            >
              <motion.div
                className={styles.spherePosition}
                animate={{
                  x,
                  y,
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className={styles.centerShell}>
                  <PairPills
                    userContent={pair.user}
                    assistantContent={pair.assistant}
                    isStreaming={isActivePairStreaming}
                    showReply={pairShowReply}
                    isActive={isActive}
                    isLatestReply={i === pairCount - 1}
                    pairIndex={i}
                    stackDepth={stackDepth}
                    queryPillRef={queryPillRef}
                    replyPillRef={replyPillRef}
                    pastReplyRefs={pastReplyRefs}
                    followUps={followUps}
                    latestReplyKind={latestReplyKind}
                    onPillClick={sendMessage}
                  />
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InlineConversationCards({
  queryPillRef,
  replyPillRef,
  pastReplyRefs,
  wrapperClassName,
}: InlineConversationCardsRefs) {
  return (
    <InlineConversationCardsInner
      queryPillRef={queryPillRef}
      replyPillRef={replyPillRef}
      pastReplyRefs={pastReplyRefs}
      wrapperClassName={wrapperClassName}
    />
  );
}

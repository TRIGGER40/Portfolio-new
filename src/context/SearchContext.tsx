import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { getWhyHireResponse, getAIResponse } from "../lib/aiResume";
import { trackChatStart, trackChatMessage } from "../lib/analytics";
import { streamChatResponse, DEFAULT_FOLLOW_UPS, type ChatReplyKind } from "../lib/chatApi";
import {
  COMPANY_GLOW_MAP,
  FALLBACK_COMPANY_GLOW,
  resolveCompanyGlowFromUserInput,
  resolveCompanyGlowForChatInput,
  getChatCompanyContext,
  getChatThemeVariables,
  type KnownCompany,
  type ResolvedCompanyGlow,
} from "../config/companyGlowMap";
import { useVisualViewportKeyboardInset } from "../hooks/useVisualViewportKeyboardInset";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface InputOriginRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface SearchContextValue {
  query: string;
  setQuery: (q: string) => void;
  conversationMode: boolean;
  conversationHistory: ConversationMessage[];
  followUps: string[];
  /** Kind of the latest assistant reply (in-card suggested prompts on redirect, invite, or no-info heuristics). */
  latestReplyKind: ChatReplyKind | null;
  currentTurnIndex: number;
  canGoOlder: boolean;
  canGoNewer: boolean;
  goToOlderTurn: () => void;
  goToNewerTurn: () => void;
  goToLatestTurn: () => void;
  isStreaming: boolean;
  inputOriginRect: InputOriginRect | null;
  enterConversationMode: (initialQuery: string, originRect?: InputOriginRect) => void;
  sendMessage: (message: string) => void;
  exitConversationMode: () => void;
  /**
   * Resolved from current input + transcript (in chat). Drives live theme / CSS vars.
   */
  companyGlowPreview: ResolvedCompanyGlow;
  /** Company match from the search input text only — drives the swipe sweep when it changes vs last commit. */
  companyInputPreview: ResolvedCompanyGlow;
  /** Same as {@link activeThemeCompany} — glow style for chrome that follows the live theme. */
  companyGlow: ResolvedCompanyGlow;
  chatThemeVars: Record<string, string>;
  /** Company driving CSS vars: live match from input + transcript when present, otherwise last matched (sticky). */
  activeThemeCompany: KnownCompany | null;
  appliedCompanyMatch: KnownCompany | null;
  /** Called when the input-box sweep animation finishes — keeps applied in sync for sweep gating. */
  commitCompanyTheme: (company: KnownCompany) => void;
  /** Show “Customised for …” chip while company theme + AI framing are active. */
  showSearchCustomizationTag: boolean;
  /** Clears company theme, API framing, and committed sweep state for this chat. */
  dismissSearchCustomizationTag: () => void;
}

export function getPairCount(history: ConversationMessage[]): number {
  return Math.floor(history.length / 2);
}

export function getPairAt(history: ConversationMessage[], index: number): { user: string; assistant: string } | null {
  const base = index * 2;
  if (base >= history.length) return null;
  const user = history[base];
  if (user?.role !== "user") return null;
  /* Assistant slot not committed yet (streaming edge) — still render the user turn */
  if (base + 1 >= history.length) {
    return { user: user.content, assistant: "" };
  }
  const assistant = history[base + 1];
  if (assistant?.role !== "assistant") return null;
  return { user: user.content, assistant: assistant.content };
}

const SearchContext = createContext<SearchContextValue | null>(null);

/** Rotating ring + search hover/focus — must follow the input box, not transcript-only company resolution. */
const SEARCH_CHROME_VAR_KEYS = [
  "--chat-search-conic",
  "--chat-search-hover-border",
  "--chat-search-hover-glow-1",
  "--chat-search-hover-glow-2",
  "--chat-search-hover-icon",
  "--chat-search-focus-shadow",
] as const;

export function SearchProvider({ children }: { children: ReactNode }) {
  useVisualViewportKeyboardInset();
  const [query, setQuery] = useState("");
  const [conversationMode, setConversationMode] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [latestReplyKind, setLatestReplyKind] = useState<ChatReplyKind | null>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputOriginRect, setInputOriginRect] = useState<InputOriginRect | null>(null);
  /** Last company confirmed after a sweep animation (sticky when input+combined no longer match). */
  const [appliedCompanyMatch, setAppliedCompanyMatch] = useState<KnownCompany | null>(null);
  /** When true: no company chrome, no customised API prompt, transcript matches ignored for theming. */
  const [companyCustomizationDismissed, setCompanyCustomizationDismissed] = useState(false);

  const pairCount = getPairCount(conversationHistory);
  const canGoOlder = pairCount > 1 && currentTurnIndex < pairCount - 1;
  const canGoNewer = currentTurnIndex > 0;

  const pairCountRef = useRef(pairCount);
  pairCountRef.current = pairCount;

  const goToOlderTurn = useCallback(() => {
    setCurrentTurnIndex((i) => Math.min(i + 1, Math.max(0, pairCountRef.current - 1)));
  }, []);

  const goToNewerTurn = useCallback(() => {
    setCurrentTurnIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goToLatestTurn = useCallback(() => {
    setCurrentTurnIndex(0);
  }, []);

  const enterConversationMode = useCallback((initialQuery: string, originRect?: InputOriginRect) => {
    trackChatStart(initialQuery);
    setAppliedCompanyMatch(null);
    setCompanyCustomizationDismissed(false);
    setInputOriginRect(originRect ?? null);
    setConversationHistory([
      { role: "user", content: initialQuery },
      { role: "assistant", content: "" },
    ]);
    setConversationMode(true);
    setCurrentTurnIndex(0);
    setQuery("");
    setLatestReplyKind(null);
    setIsStreaming(true);

    const messages: { role: "user" | "assistant"; content: string }[] = [
      { role: "user", content: initialQuery },
    ];

    const chatCompany = getChatCompanyContext(null, [{ content: initialQuery }], false);

    streamChatResponse(
      messages,
      (chunk) => {
        setConversationHistory((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
          }
          return copy;
        });
      },
      (fullText, nextFollowUps, kind) => {
        setConversationHistory((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: fullText };
          return copy;
        });
        setFollowUps(nextFollowUps);
        setLatestReplyKind(kind);
        setIsStreaming(false);
      },
      () => {
        const fallback = getWhyHireResponse();
        setConversationHistory((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: fallback };
          return copy;
        });
        setFollowUps(DEFAULT_FOLLOW_UPS);
        setLatestReplyKind("substantive");
        setIsStreaming(false);
      },
      chatCompany,
    );
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) return;
    trackChatMessage(message.trim(), conversationHistory.length);

    const userMsg = message.trim();
    const messagesForApi: { role: "user" | "assistant"; content: string }[] = [
      ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMsg },
    ];

    setConversationHistory((prev) => [
      ...prev,
      { role: "user", content: userMsg },
      { role: "assistant", content: "" },
    ]);
    setCurrentTurnIndex(0);
    setIsStreaming(true);

    const userOnly = messagesForApi.filter((m) => m.role === "user");
    const chatCompany = getChatCompanyContext(appliedCompanyMatch, userOnly, companyCustomizationDismissed);

    streamChatResponse(
      messagesForApi,
      (chunk) => {
        setConversationHistory((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
          }
          return copy;
        });
      },
      (fullText, nextFollowUps, kind) => {
        setConversationHistory((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: fullText };
          return copy;
        });
        setFollowUps(nextFollowUps);
        setLatestReplyKind(kind);
        setIsStreaming(false);
      },
      () => {
        const fallback = getAIResponse(userMsg);
        setConversationHistory((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: fallback };
          return copy;
        });
        setFollowUps(DEFAULT_FOLLOW_UPS);
        setLatestReplyKind("substantive");
        setIsStreaming(false);
      },
      chatCompany,
    );
  }, [conversationHistory, appliedCompanyMatch, companyCustomizationDismissed]);

  const exitConversationMode = useCallback(() => {
    setConversationMode(false);
    setConversationHistory([]);
    setFollowUps([]);
    setLatestReplyKind(null);
    setCurrentTurnIndex(0);
    setQuery("");
    setIsStreaming(false);
    setInputOriginRect(null);
    setAppliedCompanyMatch(null);
    setCompanyCustomizationDismissed(false);
  }, []);

  const companyGlowPreview = useMemo((): ResolvedCompanyGlow => {
    if (conversationHistory.length === 0) {
      const q = query.trim();
      if (!q) {
        return { glow: FALLBACK_COMPANY_GLOW, matched: false, matchedCompany: null };
      }
      return resolveCompanyGlowFromUserInput(q);
    }
    return resolveCompanyGlowForChatInput(query, conversationHistory);
  }, [query, conversationHistory]);

  /** Query box only — used so the swipe runs when the user types a company, not when history alone matches. */
  const companyInputPreview = useMemo((): ResolvedCompanyGlow => {
    const q = query.trim();
    if (!q) {
      return { glow: FALLBACK_COMPANY_GLOW, matched: false, matchedCompany: null };
    }
    return resolveCompanyGlowFromUserInput(q);
  }, [query]);

  const activeThemeCompany = useMemo((): KnownCompany | null => {
    if (companyCustomizationDismissed) return null;
    if (companyGlowPreview.matched && companyGlowPreview.matchedCompany) {
      return companyGlowPreview.matchedCompany;
    }
    return appliedCompanyMatch;
  }, [
    companyCustomizationDismissed,
    companyGlowPreview.matched,
    companyGlowPreview.matchedCompany,
    appliedCompanyMatch,
  ]);

  const dismissSearchCustomizationTag = useCallback(() => {
    setCompanyCustomizationDismissed(true);
    setAppliedCompanyMatch(null);
  }, []);

  const showSearchCustomizationTag =
    activeThemeCompany != null && conversationHistory.length > 0;

  const companyGlow = useMemo((): ResolvedCompanyGlow => {
    if (!activeThemeCompany) {
      return { glow: FALLBACK_COMPANY_GLOW, matched: false, matchedCompany: null };
    }
    return {
      glow: COMPANY_GLOW_MAP[activeThemeCompany],
      matched: true,
      matchedCompany: activeThemeCompany,
    };
  }, [activeThemeCompany]);

  const chatThemeVars = useMemo(() => {
    const base = getChatThemeVariables(activeThemeCompany);
    const inputCompany =
      companyInputPreview.matched && companyInputPreview.matchedCompany
        ? companyInputPreview.matchedCompany
        : null;
    if (!inputCompany || inputCompany === activeThemeCompany) {
      return base;
    }
    const ring = getChatThemeVariables(inputCompany);
    const out = { ...base };
    for (const k of SEARCH_CHROME_VAR_KEYS) {
      out[k] = ring[k] ?? base[k];
    }
    return out;
  }, [activeThemeCompany, companyInputPreview.matched, companyInputPreview.matchedCompany]);

  const commitCompanyTheme = useCallback((company: KnownCompany) => {
    setAppliedCompanyMatch(company);
    setCompanyCustomizationDismissed(false);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        conversationMode,
        conversationHistory,
        followUps,
        latestReplyKind,
        currentTurnIndex,
        canGoOlder,
        canGoNewer,
        goToOlderTurn,
        goToNewerTurn,
        goToLatestTurn,
        isStreaming,
        inputOriginRect,
        enterConversationMode,
        sendMessage,
        exitConversationMode,
        companyGlowPreview,
        companyInputPreview,
        companyGlow,
        chatThemeVars,
        activeThemeCompany,
        appliedCompanyMatch,
        commitCompanyTheme,
        showSearchCustomizationTag,
        dismissSearchCustomizationTag,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearchContext must be used within SearchProvider");
  return ctx;
}

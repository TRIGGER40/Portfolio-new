import { useState, useCallback, useRef, useEffect } from "react";
import { streamChatResponse, DEFAULT_FOLLOW_UPS, type ChatMessage, type ChatReplyKind } from "../lib/chatApi";
import { getAIResponse } from "../lib/aiResume";
import { CASE_STUDIES } from "../data/portfolioData";
import { getProjectContext } from "../data/projectContext";

/** Build a project-aware fallback when the API is unavailable. */
function getProjectFallback(projectId: string, query: string): { reply: string; followUps: string[] } {
  const study = CASE_STUDIES.find((s) => s.id === projectId);
  const ctx = getProjectContext(projectId);
  if (!study) return { reply: getAIResponse(query), followUps: DEFAULT_FOLLOW_UPS.slice(0, 4) };

  const q = query.toLowerCase();
  const actions = study.actions.join(". ");
  const outcomes = study.outcomes.join(". ");
  const metrics = study.metrics?.join(", ") || "";
  const tags = study.tags.join(", ");

  let reply: string;

  if (q.includes("challenge") || q.includes("problem") || q.includes("opportunity")) {
    reply = `**The core challenge:** ${study.opportunity} Midhun tackled this by ${actions.toLowerCase()}. The result: ${outcomes.toLowerCase()}.`;
  } else if (q.includes("impact") || q.includes("metric") || q.includes("result") || q.includes("measurable")) {
    reply = metrics
      ? `**Measurable impact:** ${metrics}. ${outcomes}`
      : `**Impact:** ${outcomes}`;
  } else if (q.includes("approach") || q.includes("method") || q.includes("how") || q.includes("process") || q.includes("ux")) {
    reply = `**Approach:** ${actions}. This was designed within ${study.timeFrame}, focusing on speed and clarity. Tags: ${tags}.`;
  } else if (q.includes("tool") || q.includes("trade-off") || q.includes("constraint") || q.includes("space") || q.includes("pod")) {
    reply = `**Design within constraints:** ${study.opportunity} Working within ${study.company}'s existing patterns, Midhun ${actions.toLowerCase()}. Delivered in ${study.timeFrame}.`;
  } else if (q.includes("trainer") || q.includes("student") || q.includes("user") || q.includes("who")) {
    reply = `**Users:** This project at ${study.company} addressed real user needs. ${study.opportunity} ${actions}. Outcome: ${outcomes.toLowerCase()}.`;
  } else {
    reply = `**${study.title}** at ${study.company} (${study.timeFrame}): ${study.opportunity} ${actions}. **Impact:** ${outcomes.toLowerCase()}.${metrics ? ` Key metrics: ${metrics}.` : ""}`;
  }

  const followUps = ctx?.seedFollowUps ?? [
    `What was the main design challenge in ${study.title}?`,
    `How did Midhun approach the UX for this project?`,
    `What was the measurable impact?`,
    `What tools and methods were used?`,
  ];

  return { reply, followUps };
}

export interface ProjectChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UseProjectChatReturn {
  messages: ProjectChatMessage[];
  followUps: string[];
  isStreaming: boolean;
  latestReplyKind: ChatReplyKind | null;
  sendMessage: (text: string) => void;
}

export function useProjectChat(projectId: string): UseProjectChatReturn {
  const [messages, setMessages] = useState<ProjectChatMessage[]>([]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [latestReplyKind, setLatestReplyKind] = useState<ChatReplyKind | null>(null);
  const streamingRef = useRef(false);

  // Reset when projectId changes
  useEffect(() => {
    setMessages([]);
    setFollowUps([]);
    setIsStreaming(false);
    setLatestReplyKind(null);
    streamingRef.current = false;
  }, [projectId]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streamingRef.current) return;

      streamingRef.current = true;
      setIsStreaming(true);

      const userMsg: ProjectChatMessage = { role: "user", content: trimmed };
      const assistantMsg: ProjectChatMessage = { role: "assistant", content: "" };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setFollowUps([]);
      setLatestReplyKind(null);

      // Build messages array for API
      const apiMessages: ChatMessage[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: trimmed },
      ];

      streamChatResponse(
        apiMessages,
        // onChunk
        (chunk: string) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = { ...last, content: last.content + chunk };
            }
            return updated;
          });
        },
        // onComplete
        (fullText: string, fups: string[], kind: ChatReplyKind) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = { ...last, content: fullText };
            }
            return updated;
          });
          setFollowUps(fups.length > 0 ? fups.slice(0, 4) : DEFAULT_FOLLOW_UPS.slice(0, 4));
          setLatestReplyKind(kind);
          setIsStreaming(false);
          streamingRef.current = false;
        },
        // onError
        () => {
          const { reply: fallbackReply, followUps: fallbackFups } = getProjectFallback(projectId, trimmed);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = { ...last, content: fallbackReply };
            }
            return updated;
          });
          setFollowUps(fallbackFups.slice(0, 4));
          setIsStreaming(false);
          streamingRef.current = false;
        },
        // customizedForCompany
        undefined,
        // projectId
        projectId,
      );
    },
    [messages, projectId],
  );

  return { messages, followUps, isStreaming, latestReplyKind, sendMessage };
}

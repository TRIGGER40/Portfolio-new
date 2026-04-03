import { sanitizeChatReply } from "./sanitizeChatReply";
import { clipChatReply } from "./clipChatReply";
import type { KnownCompany } from "../config/companyGlowMap";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const DEFAULT_FOLLOW_UPS = [
  "What AI features did he design at Adobe?",
  "How did he build this portfolio with Cursor in under a week?",
  "What was his biggest impact on Adobe Connect?",
  "How does he use vibe coding with Cursor and Claude?",
  "What challenges did he solve in breakout rooms?",
  "How does he collaborate with product managers?",
  "What metrics define success in his projects?",
  "Can you walk through a key project decision?",
];

export type ChatReplyKind = "substantive" | "redirect" | "invite";

export interface ChatReply {
  reply: string;
  followUps: string[];
  replyKind: ChatReplyKind;
  fallback?: boolean;
}

/** Same-origin `/api/chat`, or absolute base when `VITE_CHAT_API_BASE` is set (e.g. GitHub Pages → Vercel API). */
function chatApiUrl(): string {
  const raw = import.meta.env.VITE_CHAT_API_BASE;
  const base = typeof raw === "string" ? raw.trim() : "";
  if (!base) return "/api/chat";
  return `${base.replace(/\/$/, "")}/api/chat`;
}

/**
 * Calls /api/chat with message(s) and returns { reply, followUps, replyKind }.
 */
export async function getChatReply(
  message: string,
  messages?: ChatMessage[],
  customizedForCompany?: KnownCompany | null,
  projectId?: string,
): Promise<ChatReply> {
  const payload: Record<string, unknown> = messages ? { message, messages } : { message };
  if (customizedForCompany) {
    payload.customizedForCompany = customizedForCompany;
  }
  if (projectId) {
    payload.projectId = projectId;
  }
  const res = await fetch(chatApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "API request failed");
  }

  const raw = data.reply ?? "I'm having trouble connecting right now. Please try again.";
  const rawFollowUps = Array.isArray(data.followUps) ? data.followUps : [];
  const followUps = rawFollowUps
    .slice(0, 8)
    .map((s: unknown) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);
  const replyKind: ChatReplyKind =
    data.replyKind === "redirect" ? "redirect" : data.replyKind === "invite" ? "invite" : "substantive";
  return {
    reply: clipChatReply(sanitizeChatReply(raw)),
    followUps: followUps.length >= 8 ? followUps : [...followUps, ...DEFAULT_FOLLOW_UPS].slice(0, 8),
    replyKind,
    fallback: data.fallback === true,
  };
}

/**
 * Streams chat response (simulates typing from /api/chat JSON reply).
 * onComplete receives (fullText, followUps, replyKind).
 */
export async function streamChatResponse(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onComplete: (fullText: string, followUps: string[], replyKind: ChatReplyKind) => void,
  onError: (error: string) => void,
  customizedForCompany?: KnownCompany | null,
  projectId?: string,
): Promise<void> {
  const lastUser = messages.filter((m) => m.role === "user").pop();
  const message = lastUser?.content ?? "";

  if (!message.trim()) {
    onError("No message to send");
    return;
  }

  try {
    const { reply, followUps, replyKind } = await getChatReply(
      message,
      messages,
      customizedForCompany ?? undefined,
      projectId,
    );
    const displayReply = clipChatReply(reply);

    // Simulate typing effect (chunks of ~12 chars at ~40ms)
    const chunkSize = 12;
    const chunkDelayMs = 40;
    for (let i = 0; i < displayReply.length; i += chunkSize) {
      onChunk(displayReply.slice(i, i + chunkSize));
      if (i + chunkSize < displayReply.length) {
        await new Promise((r) => setTimeout(r, chunkDelayMs));
      }
    }

    onComplete(displayReply, followUps, replyKind);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Request failed";
    console.warn("Chat API:", msg);
    onError("API_UNAVAILABLE");
  }
}

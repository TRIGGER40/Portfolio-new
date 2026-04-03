/**
 * Some models still emit generic refusals despite system instructions.
 * Replace with a Midhun-centric bridge so the portfolio never shows empty refusals.
 */
const REPLACEMENT =
  "Hmm—that one's not in my notes. I do know plenty about Midhun's work though—want to hear about his Adobe projects, skills, or how he approaches design?";

export function sanitizeChatReply(reply: string): string {
  const t = reply.toLowerCase().trim();
  if (t.length === 0) return reply;

  const explicit =
    t.includes("don't have that information") ||
    t.includes("don't have that info") ||
    t.includes("do not have that information") ||
    t.includes("don't have access to that information") ||
    t.includes("don't have access to that info") ||
    t.includes("cannot provide that information") ||
    t.includes("unable to provide that information");

  if (explicit) return REPLACEMENT;

  // Short refusals with no pivot to Midhun (avoid nuking long, substantive answers)
  if (t.length < 260 && !t.includes("midhun")) {
    if (/\bi\s+don'?t\s+have\b/.test(t)) return REPLACEMENT;
    if (t.length < 140 && /^\s*i\s+don'?t\s+know[.!?\s]*$/i.test(reply.trim())) return REPLACEMENT;
  }

  return reply;
}

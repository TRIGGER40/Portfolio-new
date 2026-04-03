/** Soft target length; replies may extend slightly to finish a sentence (up to CHAT_REPLY_HARD_MAX). */
export const CHAT_REPLY_SOFT_MAX = 800;
export const CHAT_REPLY_HARD_MAX = 1100;

/**
 * Keeps replies near CHAT_REPLY_SOFT_MAX without cutting mid-sentence.
 * - ≤ soft max: unchanged
 * - between soft and hard max: keep full text (short extension avoids awkward cuts)
 * - > hard max: clip at the last complete sentence within the hard cap, else a word boundary
 */
export function clipChatReply(text: string): string {
  const t = text.replace(/\r\n/g, "\n").trim();
  if (t.length <= CHAT_REPLY_SOFT_MAX) return t;
  if (t.length <= CHAT_REPLY_HARD_MAX) return t;

  const segment = t.slice(0, CHAT_REPLY_HARD_MAX);
  const ends: number[] = [];

  for (let i = 0; i < segment.length; i++) {
    const ch = segment[i];
    if (ch !== "." && ch !== "!" && ch !== "?") continue;
    if (ch === "." && i > 0 && /\d/.test(segment[i - 1]) && i + 1 < segment.length && /\d/.test(segment[i + 1])) {
      continue;
    }
    let j = i + 1;
    while (j < segment.length && /["'")\]]/.test(segment[j])) j++;
    if (j < segment.length && !/\s/.test(segment[j])) continue;
    while (j < segment.length && /\s/.test(segment[j])) j++;
    ends.push(j);
  }

  const longEnough = ends.filter((e) => e >= CHAT_REPLY_SOFT_MAX * 0.55 && e <= CHAT_REPLY_HARD_MAX);
  if (longEnough.length > 0) {
    return t.slice(0, longEnough[longEnough.length - 1]).trimEnd();
  }

  const lastNl = segment.lastIndexOf("\n", CHAT_REPLY_SOFT_MAX);
  if (lastNl >= CHAT_REPLY_SOFT_MAX * 0.45) {
    return t.slice(0, lastNl).trimEnd();
  }

  let sp = segment.lastIndexOf(" ", CHAT_REPLY_SOFT_MAX);
  if (sp < CHAT_REPLY_SOFT_MAX * 0.55) {
    sp = segment.lastIndexOf(" ");
  }
  if (sp > CHAT_REPLY_SOFT_MAX * 0.4) {
    return t.slice(0, sp).trimEnd();
  }

  return t.slice(0, CHAT_REPLY_SOFT_MAX).trimEnd();
}

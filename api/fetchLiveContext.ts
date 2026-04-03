/**
 * Fetches live context from Midhun's portfolio site.
 * LinkedIn cannot be fetched (requires auth, blocks scrapers).
 * Falls back to empty string on error.
 */

const PORTFOLIO_URL = "https://www.midhunkrishnakumar.info/";
const LINKEDIN_URL = "https://www.linkedin.com/in/midhunkrishnakumar/";
const FETCH_TIMEOUT_MS = 8000;
const MAX_TEXT_LENGTH = 6000;

function extractTextFromHtml(html: string): string {
  const noScript = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  const noStyle = noScript.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  const text = noStyle.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) + "..." : text;
}

export async function fetchLiveContext(): Promise<{ portfolio: string; linkedinNote: string }> {
  const linkedinNote = `LinkedIn profile (reference only, cannot fetch live): ${LINKEDIN_URL}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(PORTFOLIO_URL, {
      signal: controller.signal,
      headers: { "User-Agent": "MidhunPortfolioBot/1.0" },
    });
    clearTimeout(timeout);

    if (!res.ok) return { portfolio: "", linkedinNote };
    const html = await res.text();
    const portfolio = extractTextFromHtml(html);
    return { portfolio: portfolio || "", linkedinNote };
  } catch {
    return { portfolio: "", linkedinNote };
  }
}

import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string) || "https://us.i.posthog.com";

let initialized = false;

/** Detect device type from viewport width + touch capability */
function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (w <= 480) return "mobile";
  if (w <= 1024 && hasTouch) return "tablet";
  if (w <= 768) return "tablet";
  return "desktop";
}

/** Get viewport dimensions */
function getViewportInfo() {
  if (typeof window === "undefined") return {};
  return {
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    pixel_ratio: window.devicePixelRatio,
  };
}

/** Call once at app startup */
export function initAnalytics() {
  if (initialized || !POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    loaded: (ph) => {
      initialized = true;
      // Register super properties — attached to every event automatically
      ph.register({
        device_type: getDeviceType(),
        ...getViewportInfo(),
      });
    },
  });

  // Update device_type on resize (orientation change, etc.)
  if (typeof window !== "undefined") {
    let resizeTimer: ReturnType<typeof setTimeout>;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        posthog.register({
          device_type: getDeviceType(),
          ...getViewportInfo(),
        });
      }, 500);
    }, { passive: true });
  }
}

/* ─── Typed event helpers ─── */

/** Page-level views (auto-tracked, but explicit for SPAs) */
export function trackPageView(path: string, extra?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  posthog.capture("$pageview", { $current_url: path, ...extra });
}

/** Case study / project opened */
export function trackCaseStudyOpen(projectId: string, title: string, company: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture("case_study_open", { project_id: projectId, title, company });
}

/** Article opened */
export function trackArticleOpen(slug: string, title: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture("article_open", { slug, title });
}

/** Contact click (email, resume, linkedin) */
export function trackContactClick(type: "email" | "resume" | "linkedin" | "summarize") {
  if (!POSTHOG_KEY) return;
  posthog.capture("contact_click", { type });
}

/** AI chat started */
export function trackChatStart(query: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture("chat_start", { query: query.slice(0, 200) });
}

/** AI chat follow-up sent */
export function trackChatMessage(message: string, turnIndex: number) {
  if (!POSTHOG_KEY) return;
  posthog.capture("chat_message", { message: message.slice(0, 200), turn_index: turnIndex });
}

/** Follow-up pill clicked */
export function trackFollowUpClick(text: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture("followup_click", { text: text.slice(0, 200) });
}

/** Experience segment selected */
export function trackExperienceSelect(companyId: string, company: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture("experience_select", { company_id: companyId, company });
}

/** Works page visited */
export function trackWorksPageView(companyId: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture("works_page_view", { company_id: companyId });
}

/** Scroll depth milestone */
export function trackScrollDepth(depth: number, page: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture("scroll_depth", { depth_percent: depth, page });
}

/** Section became visible */
export function trackSectionView(section: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture("section_view", { section });
}

/** Award card clicked */
export function trackAwardClick(awardTitle: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture("award_click", { title: awardTitle });
}

/** External link clicked */
export function trackExternalLink(url: string, context: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture("external_link_click", { url, context });
}

/** Get the PostHog instance for advanced usage */
export function getPostHog() {
  return POSTHOG_KEY ? posthog : null;
}

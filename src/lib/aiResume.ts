import {
  CASE_STUDIES,
  EXPERIENCE_TIMELINE,
  AI_WORK_ITEMS,
  IMPACT_METRICS,
  MENTORSHIP,
} from "../data/portfolioData";
const WHY_HIRE_TRIGGERS = [
  "why hire",
  "why hire him",
  "why hire this",
  "why should i hire",
  "reasons to hire",
  "hire this designer",
  "why hire this designer",
];

export function shouldEnterConversationMode(query: string): boolean {
  const q = query.toLowerCase().trim();
  return WHY_HIRE_TRIGGERS.some((trigger) => q.includes(trigger));
}

export function getWhyHireResponse(): string {
  return `**Why hire Midhun?** He's a **designer** with **nearly 7 years** of experience—**AI-first**, ships with **Cursor** and **Claude** (**vibe coding**), not only Figma; **this portfolio** was built in Cursor **in under a week**. • **Impact:** 50% onboarding, 80% QC, 50% device screen, 40% design quality. • **AI leadership:** Adobe Connect Gen AI, workflows. • **Ownership:** 6 pods, 8+ projects, design systems. • **Mentorship:** NID faculty, Think Ethical.`;
}

const truncate = (s: string, max: number) => (s.length <= max ? s : s.slice(0, max - 3) + "...");

export function getAIResponse(userMessage: string): string {
  const q = userMessage.toLowerCase().trim();

  // Greeting
  if (/^(hi|hello|hey|hi there)/.test(q) && q.length < 20) {
    return `Hey—good to see you here. Midhun's a **designer** with **nearly 7 years** of experience—what would you like to explore: **Adobe work**, **impact**, **skills**, or **how he designs**?`;
  }

  // Why hire
  if (shouldEnterConversationMode(userMessage) || q.includes("why hire") || q.includes("reasons")) {
    return getWhyHireResponse();
  }

  // What has Midhun built at Adobe?
  if (q.includes("built") && (q.includes("adobe") || q.includes("connect"))) {
    const adobeWork = CASE_STUDIES.filter((c) => c.company === "Adobe").slice(0, 4);
    const text = adobeWork.map((c) => `• **${c.title}** — ${c.outcomes[0]} (${c.timeFrame})`).join(" ");
    return truncate(`**Adobe Connect work:** ${text}`, 800);
  }

  // Show AI projects
  if (q.includes("ai project") || q.includes("show ai")) {
    const aiWork = AI_WORK_ITEMS;
    const text = aiWork.map((a) => `• **${a.title}** — ${a.description.slice(0, 60)}`).join(" ");
    return truncate(`**AI projects:** ${text}`, 800);
  }

  // Tell me about enterprise experience
  if (q.includes("enterprise experience") || q.includes("enterprise ux")) {
    const top = CASE_STUDIES.filter((c) => c.tags.some((t) => t.includes("Enterprise"))).slice(0, 3);
    const text = top.map((c) => `• ${c.title} (${c.company}): ${c.outcomes[0]}`).join(" ");
    return truncate(`**Enterprise UX:** Adobe, Bizongo, YUJ. ${text}`, 800);
  }

  // Show leadership experience
  if (q.includes("leadership experience") || q.includes("show leadership")) {
    const text = MENTORSHIP.map((m) => `• **${m.role}**, ${m.org}: ${m.description.slice(0, 60)}`).join(" ");
    return truncate(`**Leadership:** ${text}`, 800);
  }

  // What are his impact metrics?
  if (q.includes("impact metric") || q.includes("his impact")) {
    const text = IMPACT_METRICS.map((m) => `• **${m.value}** — ${m.label} (${m.context})`).join(" ");
    return truncate(`**Impact:** ${text}`, 800);
  }

  // Tell me about Design Systems work
  if (q.includes("design system") || q.includes("design systems")) {
    return `**Design systems:** Bizongo — ≥50% faster dev, designer onboarding cut. Adobe Connect — DSM, 300+ iterations, core UI. Focus: quality at scale, velocity.`;
  }

  // Tell me more
  if (q.includes("tell me more")) {
    return `**More:** Adobe — Gen AI, Quiz pod, 50% device screen cut, homepage. Bizongo — UMS, QC (80%), Artwork (60%), PPE E-com, design system. YUJ — 40% heuristics. Mentors at NID & Think Ethical.`;
  }

  // What are his key strengths?
  if (q.includes("key strength") || q.includes("strengths")) {
    return `**Strengths:** Impact (80% QC, 60% workflow, 50% screen, 40% quality). AI-first design. End-to-end ownership. Mentorship. Enterprise UX.`;
  }

  // Share another example
  if (q.includes("another example") || q.includes("share another")) {
    const c = CASE_STUDIES[Math.floor(Math.random() * Math.min(5, CASE_STUDIES.length))];
    const text = `**${c.title}** (${c.company}): ${c.opportunity.slice(0, 100)}. ${c.outcomes[0]}`;
    return truncate(text, 800);
  }

  // How does this translate to impact?
  if (q.includes("translate") && q.includes("impact")) {
    const text = IMPACT_METRICS.map((m) => `• ${m.label}: **${m.value}** (${m.context})`).join(" ");
    return truncate(`**Impact:** ${text}`, 800);
  }

  // What's his design approach?
  if (q.includes("design approach") || q.includes("design philosophy")) {
    return `**Design approach:** Research→implementation. Systems thinking. AI augmentation. End-to-end ownership. Collaboration.`;
  }

  // Summary / overview
  if (q.includes("summary") || q.includes("overview") || (q.includes("tell me about") && q.length > 15) || q.includes("who is")) {
    return `**Midhun Krishnakumar** — a **designer** (Product Designer at Adobe) with **nearly 7 years** of experience across B2B, B2C, startups, agencies, and **enterprise**. **AI-first**; heavy **Cursor** + **Claude** and **vibe coding** (not only Figma)—this **portfolio** shipped in Cursor **in under a week**. Adobe Connect, AI initiatives. 50% onboarding, 80% QC, 40% quality. NID → Bizongo → YUJ → Adobe. Mentors at NID & Think Ethical.`;
  }

  // Adobe
  if (q.includes("adobe") || q.includes("connect")) {
    const adobeWork = CASE_STUDIES.filter((c) => c.company === "Adobe").slice(0, 4);
    const text = adobeWork.map((c) => `• **${c.title}** — ${c.outcomes[0]}`).join(" ");
    return truncate(`**Adobe Connect:** ${text}`, 800);
  }

  // AI
  if (q.includes("ai") || q.includes("gen ai") || q.includes("generative")) {
    const text = AI_WORK_ITEMS.map((a) => `• **${a.title}** — ${a.description.slice(0, 50)}`).join(" ");
    return truncate(`**AI work:** ${text}`, 800);
  }

  // Impact / metrics
  if (q.includes("impact") || q.includes("metric") || q.includes("result") || q.includes("outcome")) {
    const text = IMPACT_METRICS.map((m) => `• **${m.value}** — ${m.label} (${m.context})`).join(" ");
    return truncate(`**Impact:** ${text}`, 800);
  }

  // Leadership
  if (q.includes("leadership") || q.includes("mentor") || q.includes("team")) {
    const text = MENTORSHIP.map((m) => `• **${m.role}**, ${m.org}`).join(" ");
    return truncate(`**Mentorship:** ${text}`, 800);
  }

  // Experience / career
  if (q.includes("experience") || q.includes("career") || q.includes("background")) {
    const timeline = EXPERIENCE_TIMELINE.slice(0, 4);
    const text = timeline.map((e) => `• **${e.company}** — ${e.role} (${e.period})`).join(" ");
    return truncate(`**Career:** ${text}`, 800);
  }

  // Contact
  if (q.includes("contact") || q.includes("email") || q.includes("reach") || q.includes("linkedin")) {
    return `**Contact:** midhun2k14@gmail.com • linkedin.com/in/midhunkrishnakumar`;
  }

  // Default
  return `That's a bit outside what I can pin down here—but I'm full of stories about **Midhun's projects**, **tools**, and **design approach**. What sounds interesting?`;
}

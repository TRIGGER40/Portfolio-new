import { useMemo } from "react";
import { CASE_STUDIES, EXPERIENCE_TIMELINE, IMPACT_METRICS } from "../data/portfolioData";
import { ARTICLES, getThoughtListItems } from "../data/articles";

const SEARCH_ALIASES: Record<string, string[]> = {
  adobe: ["adobe", "connect", "adobe connect"],
  ai: ["ai", "gen ai", "generative", "intelligent", "automation"],
  leadership: ["leadership", "mentor", "faculty", "think ethical", "guide"],
  enterprise: ["enterprise", "erp", "bizongo", "yuj"],
  design: ["design", "design system", "ui", "ux"],
  impact: ["impact", "metric", "50%", "80%", "40%", "35%", "60%", "30%", "25%"],
  breakout: ["breakout", "rooms", "breakout rooms"],
  notification: ["notification", "notifications"],
  northstar: ["northstar", "ux northstar"],
};

function matchesQuery(text: string, query: string): boolean {
  const normalizedText = text.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  return terms.some((term) => {
    const aliases = SEARCH_ALIASES[term] || [term];
    return (
      normalizedText.includes(term) ||
      aliases.some((alias) => normalizedText.includes(alias))
    );
  });
}

function itemMatchesQuery(item: { tags: string[] }, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const tagStr = item.tags.join(" ").toLowerCase();
  return terms.some((term) => tagStr.includes(term));
}

export function useSearch(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  const filteredCaseStudies = useMemo(() => {
    if (!normalizedQuery) return CASE_STUDIES;

    return CASE_STUDIES.filter((c) => {
      const text =
        `${c.title} ${c.company} ${c.opportunity} ${c.actions.join(" ")} ${c.outcomes.join(" ")} ${c.tags.join(" ")}`.toLowerCase();
      return matchesQuery(text, normalizedQuery) || itemMatchesQuery(c, normalizedQuery);
    });
  }, [normalizedQuery]);

  const filteredExperience = useMemo(() => {
    if (!normalizedQuery) return EXPERIENCE_TIMELINE;

    return EXPERIENCE_TIMELINE.filter((e) => {
      const text =
        `${e.company} ${e.role} ${e.highlights.join(" ")} ${e.tags.join(" ")}`.toLowerCase();
      return matchesQuery(text, normalizedQuery) || itemMatchesQuery(e, normalizedQuery);
    });
  }, [normalizedQuery]);

  const filteredImpact = useMemo(() => {
    if (!normalizedQuery) return IMPACT_METRICS;

    return IMPACT_METRICS.filter((m) => {
      const text = `${m.label} ${m.value} ${m.context}`.toLowerCase();
      return matchesQuery(text, normalizedQuery);
    });
  }, [normalizedQuery]);

  const filteredThoughts = useMemo(() => {
    const items = getThoughtListItems();
    if (!normalizedQuery) return items;

    return items.filter((t) => {
      const article = ARTICLES.find((a) => a.slug === t.id);
      const text = article
        ? `${article.title} ${article.subtitle} ${article.searchBlob} ${t.tags.join(" ")}`.toLowerCase()
        : `${t.title} ${t.excerpt} ${t.tags.join(" ")}`.toLowerCase();
      return matchesQuery(text, normalizedQuery) || itemMatchesQuery(t, normalizedQuery);
    });
  }, [normalizedQuery]);

  const hasActiveFilter = normalizedQuery.length > 0;
  const totalMatches =
    filteredCaseStudies.length +
    filteredExperience.length +
    filteredImpact.length +
    filteredThoughts.length;

  const summaryInsight = useMemo(() => {
    if (!normalizedQuery) return null;

    const parts: string[] = [];
    if (filteredCaseStudies.length > 0)
      parts.push(`${filteredCaseStudies.length} case studies`);
    if (filteredExperience.length > 0)
      parts.push(`${filteredExperience.length} experience entries`);
    if (filteredImpact.length > 0)
      parts.push(`${filteredImpact.length} impact metrics`);
    if (filteredThoughts.length > 0)
      parts.push(`${filteredThoughts.length} articles`);

    return parts.length
      ? `Found ${parts.join(", ")} matching "${query.trim()}".`
      : `No results for "${query.trim()}". Try: Adobe, AI, Leadership, Enterprise UX, or Design Systems.`;
  }, [
    normalizedQuery,
    query,
    filteredCaseStudies.length,
    filteredExperience.length,
    filteredImpact.length,
    filteredThoughts.length,
  ]);

  return {
    filteredCaseStudies,
    filteredExperience,
    filteredImpact,
    filteredThoughts,
    hasActiveFilter,
    totalMatches,
    summaryInsight,
  };
}

export function getCandidateSummary(): string {
  return `Midhun Krishnakumar is a designer (Product Designer at Adobe) with nearly 7 years of experience across B2B, B2C, startups, agencies, and enterprise (Adobe)—enterprise products, AI-driven features, and high-impact system design. He is AI-first, with deep practice shipping work through Cursor and Claude (vibe coding), not only Figma; this portfolio was built with Cursor in under a week. He leads AI Initiatives for Adobe Connect, has delivered 8+ sub-projects with measurable business impact, and brings quantified outcomes: 50% onboarding reduction (Bizongo), 80% QC time reduction (warehouses), 40% heuristics improvement (YUJ), 50% device preference screen reduction (Adobe). His career evolved from Computer Science (2012–2014) to Industrial Design (NID), then UX design, B2B systems, B2C products at Adobe, and AI-first products (2024–2026). He mentors at NID and Think Ethical. Strong in Design Systems, Enterprise UX, and AI product exploration.`;
}

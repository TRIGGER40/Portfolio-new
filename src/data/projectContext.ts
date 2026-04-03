import { CASE_STUDIES, type CaseStudy } from "./portfolioData";

export interface ProjectContext {
  id: string;
  contextBlurb: string;
  seedFollowUps: string[];
  chatPlaceholder: string;
}

/**
 * Build a context blurb from a CaseStudy's structured data.
 * This is the default — can be overridden per project with richer copy later.
 */
function buildBlurbFromStudy(study: CaseStudy): string {
  const parts: string[] = [];
  parts.push(`Project: ${study.title} at ${study.company} (${study.category}).`);
  parts.push(`Time frame: ${study.timeFrame}.`);
  parts.push(`Opportunity: ${study.opportunity}`);

  if (study.sections && study.sections.length > 0) {
    for (const sec of study.sections) {
      const content = Array.isArray(sec.content) ? sec.content.join("; ") : sec.content;
      parts.push(`${sec.title}: ${content}`);
    }
  } else {
    if (study.actions.length > 0) {
      parts.push(`Actions: ${study.actions.join("; ")}.`);
    }
    if (study.outcomes.length > 0) {
      parts.push(`Outcomes: ${study.outcomes.join("; ")}.`);
    }
  }

  if (study.metrics && study.metrics.length > 0) {
    parts.push(`Key metrics: ${study.metrics.join("; ")}.`);
  }
  if (study.tags.length > 0) {
    parts.push(`Tags: ${study.tags.join(", ")}.`);
  }

  return parts.join("\n");
}

function buildDefaultFollowUps(study: CaseStudy): string[] {
  return [
    `What was the main design challenge in ${study.title}?`,
    `How did Midhun approach the UX for this project?`,
    `What was the measurable impact of this work?`,
    `What tools and methods were used?`,
  ];
}

function buildPlaceholder(study: CaseStudy): string {
  return `Ask about ${study.title}...`;
}

/** IDs of projects with rich AI context — shown as "Featured" in hero sphere. */
export const FEATURED_PROJECT_IDS = new Set([
  "quiz-pod",
  "event-joining",
  "bizongo-ecom",
  "bizongo-qc",
  "bizongo-ums",
  "npol-ctd-probe",
]);

/** Custom overrides for richer context per project. */
const CUSTOM_OVERRIDES: Partial<Record<string, Partial<ProjectContext>>> = {
  "quiz-pod": {
    seedFollowUps: [
      "How does quiz creation work in under 1 minute?",
      "What was the biggest UX challenge with the Quiz Pod?",
      "How does the trainer track live quiz progress?",
      "What design trade-offs were made for limited pod space?",
    ],
    chatPlaceholder: "Ask about the Quiz Pod design...",
  },
  "event-joining": {
    seedFollowUps: [
      "How was device preference time reduced by 50%?",
      "What was wrong with the original joining layout?",
      "How did heatmaps validate the redesign?",
      "What was the centralized modal approach?",
    ],
    chatPlaceholder: "Ask about the joining experience redesign...",
  },
  "bizongo-ecom": {
    seedFollowUps: [
      "How was B2C simplicity merged with B2B complexity?",
      "How did bulk ordering and multi-location delivery work?",
      "What was the direct payment integration shift?",
      "How was the platform built in just 4 weeks?",
    ],
    chatPlaceholder: "Ask about the PPE marketplace design...",
  },
  "bizongo-qc": {
    seedFollowUps: [
      "How was the QC flow aligned with physical inspection?",
      "What was the content prioritization model?",
      "How were interaction costs reduced per action?",
      "What did the warehouse field research reveal?",
    ],
    chatPlaceholder: "Ask about the QC process redesign...",
  },
  "bizongo-ums": {
    seedFollowUps: [
      "How was the complex data hierarchy simplified?",
      "What was the access control model design?",
      "How did super admin vs company admin views differ?",
      "How was UMS designed as a cross-platform plugin?",
    ],
    chatPlaceholder: "Ask about the User Management System...",
  },
  "npol-ctd-probe": {
    seedFollowUps: [
      "How was the probe redesigned for reusability?",
      "What was the bidirectional data collection approach?",
      "How was the tether reinforced for retrieval?",
      "What was the hull-mounted deployment concept?",
    ],
    chatPlaceholder: "Ask about the XCTD probe redesign...",
  },
};

/** Build the full map from CASE_STUDIES, with optional custom overrides. */
function buildProjectContexts(): Record<string, ProjectContext> {
  const map: Record<string, ProjectContext> = {};

  for (const study of CASE_STUDIES) {
    const override = CUSTOM_OVERRIDES[study.id];
    map[study.id] = {
      id: study.id,
      contextBlurb: override?.contextBlurb ?? buildBlurbFromStudy(study),
      seedFollowUps: override?.seedFollowUps ?? buildDefaultFollowUps(study),
      chatPlaceholder: override?.chatPlaceholder ?? buildPlaceholder(study),
    };
  }

  return map;
}

export const PROJECT_CONTEXTS = buildProjectContexts();

export function getProjectContext(id: string): ProjectContext | null {
  if (!FEATURED_PROJECT_IDS.has(id)) return null;
  return PROJECT_CONTEXTS[id] ?? null;
}

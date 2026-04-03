import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";
import { CASE_STUDIES, type CaseStudy } from "../data/portfolioData";
import { FEATURED_PROJECT_IDS } from "../data/projectContext";
import { resolveThumbnail } from "../lib/utils";
import { trackCaseStudyOpen } from "../lib/analytics";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { ProjectChat } from "../components/ProjectChat";
import { ShimmerImg } from "../components/ShimmerImg";
import { MetricsCarousel } from "../components/MetricsCarousel";
import styles from "./ProjectDetail.module.css";

const SECTION_ICONS: Record<string, React.ReactNode> = {
  challenge: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  opportunity: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3a6 6 0 0 1 6 6v1a6 6 0 0 1-3 5.197V19a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3.803A6 6 0 0 1 6 10V9a6 6 0 0 1 6-6z" />
      <path d="M9 21h6" />
      <path d="M10 22h4" />
    </svg>
  ),
  approach: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  actions: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  solution: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  impact: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  outcomes: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  metrics: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
};

function getSectionIcon(title: string): React.ReactNode {
  const key = title.toLowerCase().replace(/\s+/g, "");
  if (key.includes("opportunity") || key.includes("problem")) return SECTION_ICONS.opportunity;
  if (key.includes("challenge")) return SECTION_ICONS.challenge;
  if (key.includes("approach") || key.includes("actions")) return SECTION_ICONS.approach;
  if (key.includes("solution")) return SECTION_ICONS.solution;
  if (key.includes("impact")) return SECTION_ICONS.impact;
  if (key.includes("outcomes")) return SECTION_ICONS.outcomes;
  if (key.includes("metrics")) return SECTION_ICONS.metrics;
  return SECTION_ICONS.approach;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

/** Index of the metrics block in the section list (for alternating card styles). */
function getMetricsSectionIndex(study: CaseStudy): number {
  if (study.sections && study.sections.length > 0) {
    return study.sections.length;
  }
  let n = 1;
  if (study.actions.length > 0) n += 1;
  if (study.outcomes.length > 0) n += 1;
  return n;
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromSection = (location.state as { fromSection?: string } | null)?.fromSection;
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Scroll-to-top on forward nav and scroll restore on back nav
  // are handled centrally by ScrollManager in App.tsx

  const study = id ? CASE_STUDIES.find((c) => c.id === id) : null;

  // Track case study open
  React.useEffect(() => {
    if (study) trackCaseStudyOpen(study.id, study.title, study.company);
  }, [study?.id]);

  if (!study) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h1>Project not found</h1>
          <button onClick={() => fromSection ? navigate(`/#${fromSection}`) : navigate(-1)} className={styles.backLink}>
            ← Back to portfolio
          </button>
        </div>
      </div>
    );
  }

  const metricsSectionIndex = getMetricsSectionIndex(study);

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <button onClick={() => fromSection ? navigate(`/#${fromSection}`) : navigate(-1)} className={styles.backLink}>
          ← Back to portfolio
        </button>
      </div>

      <article className={styles.article}>
        {study.thumbnail && (
          <motion.div
            className={styles.hero}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.heroImageWrap}>
              <ShimmerImg src={resolveThumbnail(study.thumbnail)} alt={study.title} className={styles.heroImage} />
              <div className={styles.heroOverlay} />
            </div>
          </motion.div>
        )}

        <div className={styles.badges}>
          <span className={styles.company}>{study.company}</span>
          <span className={styles.category}>{study.category}</span>
          {FEATURED_PROJECT_IDS.has(study.id) && (
            <span className={styles.featuredBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Featured
            </span>
          )}
        </div>
        <h1 className={styles.title}>{study.title}</h1>
        {study.timeFrame && (
          <p className={styles.timeFrame}>Time Frame: {study.timeFrame}</p>
        )}

        {study.sections && study.sections.length > 0 ? (
          study.sections.map((sec, i) => (
            <motion.section
              key={i}
              className={`${styles.section} ${styles.sectionCard} ${i % 2 === 1 ? styles.sectionAlt : ""}`}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>{getSectionIcon(sec.title)}</span>
                <h2 className={styles.sectionTitle}>{sec.title}</h2>
              </div>
              <div className={styles.sectionContent}>
                {typeof sec.content === "string" ? (
                  <p className={styles.opportunity}>{sec.content}</p>
                ) : (
                  <ul className={styles.list}>
                    {sec.content.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.section>
          ))
        ) : (
          <>
            <motion.section
              className={`${styles.section} ${styles.sectionCard}`}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>{getSectionIcon("Opportunity")}</span>
                <h2 className={styles.sectionTitle}>Opportunity</h2>
              </div>
              <p className={styles.opportunity}>{study.opportunity}</p>
            </motion.section>
            {study.actions.length > 0 && (
              <motion.section
                className={`${styles.section} ${styles.sectionCard} ${styles.sectionAlt}`}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon}>{getSectionIcon("Actions")}</span>
                  <h2 className={styles.sectionTitle}>Actions</h2>
                </div>
                <ul className={styles.list}>
                  {study.actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </motion.section>
            )}
            {study.outcomes.length > 0 && (
              <motion.section
                className={`${styles.section} ${styles.sectionCard}`}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                custom={2}
              >
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon}>{getSectionIcon("Impact")}</span>
                  <h2 className={styles.sectionTitle}>Impact</h2>
                </div>
                <ul className={styles.list}>
                  {study.outcomes.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </motion.section>
            )}
          </>
        )}

        {study.metrics && study.metrics.length > 0 && (
          <motion.section
            className={`${styles.section} ${styles.sectionCard} ${styles.metricsSectionCard}`}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            custom={metricsSectionIndex}
          >
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>{getSectionIcon("Metrics")}</span>
              <h2 className={styles.sectionTitle}>Metrics</h2>
            </div>
            {isMobile ? (
              <MetricsCarousel metrics={study.metrics} />
            ) : (
              <div className={styles.metrics}>
                {study.metrics.map((m, i) => (
                  <motion.span
                    key={i}
                    className={styles.metricBadge}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    {m}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {study.id === "adobe-visual-design" && (
          <motion.div
            className={styles.ctaWrap}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            custom={metricsSectionIndex + 1}
          >
            <a
              href="https://www.figma.com/proto/a4yZ9Jxsyqdu0jAdka0h8m/Visual-design-projects?page-id=0%3A1&node-id=13-31454&viewport=-1868%2C-3809%2C0.32&t=hnTglz0kPoWtwOtl-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=28%3A12185"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaButton}
            >
              View design works
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </motion.div>
        )}

        <div className={styles.footer}>
          <div className={styles.tags}>
            {study.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

        </div>

      </article>

      <ProjectChat projectId={study.id} projectTitle={study.title} />
    </motion.div>
  );
}

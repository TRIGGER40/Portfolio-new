import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "../hooks/useSearch";
import { useSearchContext } from "../context/SearchContext";
import type { CaseStudy } from "../data/portfolioData";
import styles from "./FeaturedWork.module.css";

function CaseStudyCard({ study }: { study: CaseStudy }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article
      layout
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <button
        type="button"
        className={styles.cardHeader}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className={styles.cardMeta}>
          <span className={styles.company}>{study.company}</span>
          <span className={styles.timeFrame}>{study.timeFrame}</span>
        </div>
        <h3 className={styles.cardTitle}>{study.title}</h3>
        <div className={styles.cardTags}>
          {study.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.miniTag}>
              {tag}
            </span>
          ))}
        </div>
        <span className={styles.expandIcon}>{expanded ? "−" : "+"}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.cardBody}
          >
            <div className={styles.cardSection}>
              <h4>Opportunity</h4>
              <p>{study.opportunity}</p>
            </div>
            <div className={styles.cardSection}>
              <h4>Actions</h4>
              <ul>
                {study.actions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
            <div className={styles.cardSection}>
              <h4>Outcomes</h4>
              <ul>
                {study.outcomes.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
            {study.metrics && study.metrics.length > 0 && (
              <div className={styles.metrics}>
                {study.metrics.map((m, i) => (
                  <span key={i} className={styles.metric}>
                    {m}
                  </span>
                ))}
              </div>
            )}
            {study.link && (
              <a
                href={study.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                View case study →
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export function FeaturedWork() {
  const { query } = useSearchContext();
  const { filteredCaseStudies } = useSearch(query);

  return (
    <motion.section
      className={styles.section}
      id="featured-work"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={styles.sectionTitle}>Featured Work</h2>
      <div className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {filteredCaseStudies.length > 0 ? (
            filteredCaseStudies.map((study) => (
              <CaseStudyCard key={study.id} study={study} />
            ))
          ) : (
            <p className={styles.empty}>No case studies match your search.</p>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

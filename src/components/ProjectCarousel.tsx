import { motion } from "framer-motion";
import { CASE_STUDIES, FEATURED_PROJECT_IDS } from "../data/portfolioData";
import type { CaseStudy } from "../data/portfolioData";
import styles from "./ProjectCarousel.module.css";

const featuredStudies = FEATURED_PROJECT_IDS.map(
  (id) => CASE_STUDIES.find((c) => c.id === id)!
).filter(Boolean) as CaseStudy[];

function ProjectCard({ study }: { study: CaseStudy }) {
  const primaryMetric = study.metrics?.[0] ?? study.outcomes[0] ?? study.timeFrame;
  return (
    <motion.a
      href={study.link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <span className={styles.company}>{study.company}</span>
      <h3 className={styles.title}>{study.title}</h3>
      <p className={styles.impact}>{primaryMetric}</p>
      <div className={styles.tags}>
        {study.tags.slice(0, 4).map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
    </motion.a>
  );
}

export function ProjectCarousel() {
  const duplicated = [...featuredStudies, ...featuredStudies];

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={styles.sectionTitle}>Featured Projects</h2>
      <div className={styles.trackWrapper}>
        <div className={styles.track}>
          {duplicated.map((study, i) => (
            <ProjectCard key={`${study.id}-${i}`} study={study} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

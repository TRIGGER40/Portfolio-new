import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CASE_STUDIES, EXPERIENCE_TIMELINE } from "../data/portfolioData";
import type { CaseStudy } from "../data/portfolioData";
import { resolveThumbnail } from "../lib/utils";
import { ShimmerImg } from "../components/ShimmerImg";
import styles from "./WorksPage.module.css";

/** Map experience IDs to the company name used in CASE_STUDIES */
const EXP_TO_COMPANY: Record<string, string> = {
  adobe: "Adobe",
  "adobe-xd-intern": "Adobe",
  yuj: "YUJ",
  bizongo: "Bizongo",
  "nid-faculty": "NID Andhra Pradesh",
  "think-ethical": "Think Ethical",
};

function ProjectCard({ project }: { project: CaseStudy }) {
  const thumb = resolveThumbnail(project.thumbnail);
  return (
    <Link
      to={`/project/${project.id}`}
      state={{ fromSection: "experience" }}
      className={styles.card}
    >
      {thumb && (
        <div className={styles.cardImageWrap}>
          <ShimmerImg src={thumb} alt={project.title} className={styles.cardImage} loading="lazy" />
        </div>
      )}
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        <p className={styles.cardDesc}>{project.opportunity}</p>
        <div className={styles.cardTags}>
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className={styles.cardTag}>{tag}</span>
          ))}
        </div>
        {project.link && (
          <span className={styles.cardLink}>
            View case study →
          </span>
        )}
      </div>
    </Link>
  );
}

export function WorksPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromSection = (location.state as { fromSection?: string } | null)?.fromSection;

  const experience = EXPERIENCE_TIMELINE.find((e) => e.id === companyId);
  const companyFilter = companyId ? EXP_TO_COMPANY[companyId] : undefined;

  const projects = companyFilter
    ? CASE_STUDIES.filter((c) => c.company === companyFilter)
    : [];

  if (!experience || projects.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h1>No works found</h1>
          <button
            onClick={() => (fromSection ? navigate(`/#${fromSection}`) : navigate(-1))}
            className={styles.backBtn}
          >
            ← Back to portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Top bar */}
      <header className={styles.topBar}>
        <button
          onClick={() => (fromSection ? navigate(`/#${fromSection}`) : navigate("/#experience"))}
          className={styles.backBtn}
        >
          ← Back to portfolio
        </button>
      </header>

      <div className={styles.layout}>
        {/* Left sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            <span className={styles.sidebarLabel}>Experience</span>
            <h1 className={styles.companyName}>{experience.company}</h1>
            <p className={styles.role}>{experience.role}</p>
            <p className={styles.period}>{experience.period}</p>
            {experience.summary && (
              <div className={styles.sidebarSection}>
                <span className={styles.sectionLabel}>What I did</span>
                <p className={styles.narrativeText}>{experience.summary}</p>
              </div>
            )}
            {experience.stats && experience.stats.length > 0 && (
              <div className={styles.sidebarSection}>
                <span className={styles.sectionLabel}>Key Metrics</span>
                <ul className={styles.stats}>
                  {experience.stats.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className={styles.sidebarSection}>
              <span className={styles.sectionLabel}>Skills</span>
              <div className={styles.sidebarTags}>
                {experience.tags.slice(0, 5).map((tag) => (
                  <span key={tag} className={styles.sidebarTag}>{tag}</span>
                ))}
              </div>
            </div>
            <p className={styles.projectCount}>
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
        </aside>

        {/* Right grid */}
        <main className={styles.grid}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </main>
      </div>
    </motion.div>
  );
}

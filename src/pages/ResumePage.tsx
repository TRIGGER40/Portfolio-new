import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  EXPERIENCE_TIMELINE,
  CASE_STUDIES,
  AWARDS,
  IMPACT_METRICS,
  CONTACT,
  MENTORSHIP,
} from "../data/portfolioData";
import { trackPageView } from "../lib/analytics";
// Lazy-load PDF generation only when user clicks download
const loadResumePdf = () => import("../lib/resumePdf");
import styles from "./ResumePage.module.css";

/* ── Derived data ── */

const EDUCATION = [
  {
    degree: "Bachelor of Design (B.Des)",
    school: "National Institute of Design (NID - Andhra Pradesh)",
    period: "2015 – 2019",
    focus: "Industrial Design — UI/UX, Product Design, Design Business",
  },
  {
    degree: "Sainik School Kazhakootam",
    school: "Kerala, India",
    period: "2012 – 2014",
    focus: "Programming, Algorithms, Computing Fundamentals",
  },
];

const SKILLS = {
  design: [
    "Product Design",
    "UX Strategy",
    "Interaction Design",
    "Information Architecture",
    "Design Systems",
    "Prototyping",
    "Visual Design",
    "User Research",
  ],
  tools: [
    "Figma",
    "Adobe XD",
    "Framer",
    "Principle",
    "Adobe Creative Suite",
    "Miro",
    "FigJam",
    "Claude Code",
    "Cursor",
    "Google Stitch",
    "NanoBanana",
  ],
  domains: [
    "Enterprise UX",
    "AI / Gen-AI Products",
    "B2B & B2C Platforms",
    "Real-time Collaboration",
    "SaaS",
    "E-Commerce",
  ],
  soft: [
    "Design Leadership",
    "Stakeholder Management",
    "Cross-functional Collaboration",
    "Mentorship",
    "Design Thinking",
  ],
};

const RESUME_EXPERIENCE = EXPERIENCE_TIMELINE.filter((e) =>
  ["adobe", "yuj", "bizongo", "adobe-xd-intern"].includes(e.id)
);

const KEY_PROJECTS = CASE_STUDIES.filter((c) => c.metrics && c.metrics.length > 0).slice(0, 6);
const TOP_AWARDS = AWARDS.slice(0, 6);

/* ── Icons ── */
function SunIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ResumePage() {
  const navigate = useNavigate();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    trackPageView("/resume");
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { downloadResumePdf } = await loadResumePdf();
      await downloadResumePdf();
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const wrapperClass = `${styles.wrapper} ${lightMode ? styles.light : styles.dark}`;

  return (
    <div className={wrapperClass}>
      {/* ── Fixed top bar matching ArticlePage pattern ── */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarSide}>
            <button onClick={() => navigate(-1)} className={styles.backLink}>
              ← Back
            </button>
          </div>
          <p className={styles.topBarTitle}>Resume</p>
          <div className={`${styles.topBarSide} ${styles.topBarSideEnd}`}>
            <button
              className={styles.themeToggle}
              onClick={() => setLightMode((v) => !v)}
              aria-label={lightMode ? "Switch to dark mode" : "Switch to light mode"}
            >
              {lightMode ? <MoonIcon /> : <SunIcon />}
            </button>
            <button className={styles.downloadBtn} onClick={handleDownload} disabled={downloading}>
              <span className={styles.downloadIcon}>{downloading ? "⟳" : "↓"}</span>
              <span className={styles.downloadLabel}>{downloading ? "Generating…" : "Download PDF"}</span>
            </button>
          </div>
        </div>
      </header>

      <div
        className={styles.content}
        ref={(el) => { resumeRef.current = el; contentRef.current = el; }}
      >
          {/* ── HEADER ── */}
          <header className={styles.header}>
            <h1 className={styles.name}>Midhun Krishnakumar</h1>
            <p className={styles.title}>Product Designer · AI-first Design · Enterprise UX</p>
            <div className={styles.contactRow}>
              <a href={`mailto:${CONTACT.email}`} className={styles.contactItem}>
                {CONTACT.email}
              </a>
              <span className={styles.contactDivider}>·</span>
              <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                linkedin.com/in/midhunkrishnakumar
              </a>
              <span className={styles.contactDivider}>·</span>
              <a href="https://www.midhunkrishnakumar.info" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                midhunkrishnakumar.info
              </a>
            </div>
          </header>

          {/* ── SUMMARY ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Summary</h2>
            <p className={styles.summaryText}>
              Product Designer with 6+ years of experience driving AI-first innovation, enterprise UX strategy,
              and design systems at scale. Currently leading design for Adobe Connect — a collaboration platform
              serving millions of users globally. Proven track record of shipping high-impact features that reduce
              friction by 50%, boost engagement by 35%, and cut operational costs by 80%. NID Ahmedabad alumnus
              with deep expertise across B2B, B2C, and AI product domains.
            </p>
          </section>

          {/* ── EXPERIENCE ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Experience</h2>
            {RESUME_EXPERIENCE.map((exp) => (
              <div key={exp.id} className={styles.expEntry}>
                <div className={styles.expHeader}>
                  <div>
                    <h3 className={styles.expRole}>{exp.role}</h3>
                    <p className={styles.expCompany}>{exp.company}</p>
                  </div>
                  <span className={styles.expPeriod}>{exp.period}</span>
                </div>
                {exp.summary && <p className={styles.expSummary}>{exp.summary}</p>}
                <ul className={styles.expHighlights}>
                  {exp.highlights
                    .filter((h) => !(exp.id === "adobe-xd-intern" && h.startsWith("User Testing")))
                    .slice(0, 4)
                    .map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                </ul>
                {exp.link && (
                  <a href={`/works/${exp.id}`} className={styles.expViewLink}>View works →</a>
                )}
              </div>
            ))}
          </section>

          {/* ── KEY IMPACT ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Key Impact Metrics</h2>
            <div className={styles.metricsGrid}>
              {IMPACT_METRICS.slice(0, 8).map((m, i) => {
                const isReduction = /friction|ticket|error|time|setup/i.test(m.label);
                return (
                  <div key={i} className={styles.metricItem}>
                    <span className={styles.metricValue}>
                      <span className={styles.arrow}>{isReduction ? "↓" : "↑"}</span>
                      {" "}{m.value}
                    </span>
                    <span className={styles.metricLabel}>{m.label}</span>
                    <span className={styles.metricContext}>{m.context}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── KEY PROJECTS ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Selected Projects</h2>
            <div className={styles.projectsGrid}>
              {KEY_PROJECTS.map((p) => (
                <div key={p.id} className={styles.projectCard}>
                  <div className={styles.projectHeader}>
                    <h3 className={styles.projectTitle}>{p.title}</h3>
                    <span className={styles.projectCompany}>{p.company}</span>
                  </div>
                  <p className={styles.projectDesc}>{p.opportunity}</p>
                  {p.metrics && (
                    <div className={styles.projectMetrics}>
                      {p.metrics.slice(0, 2).map((m, i) => (
                        <span key={i} className={styles.projectMetric}>{m}</span>
                      ))}
                    </div>
                  )}
                  <a href={`/project/${p.id}`} className={styles.projectViewLink}>View case study →</a>
                </div>
              ))}
            </div>
          </section>

          {/* ── SKILLS ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Skills</h2>
            <div className={styles.skillsGrid}>
              {(Object.entries(SKILLS) as [string, string[]][]).map(([group, tags]) => (
                <div key={group} className={styles.skillGroup}>
                  <h4 className={styles.skillGroupTitle}>
                    {group === "soft" ? "Leadership" : group.charAt(0).toUpperCase() + group.slice(1)}
                  </h4>
                  <div className={styles.skillTags}>
                    {tags.map((s) => (
                      <span key={s} className={styles.skillTag}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── EDUCATION ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Education</h2>
            {EDUCATION.map((edu, i) => (
              <div key={i} className={styles.eduEntry}>
                <div className={styles.eduHeader}>
                  <div>
                    <h3 className={styles.eduDegree}>{edu.degree}</h3>
                    <p className={styles.eduSchool}>{edu.school}</p>
                  </div>
                  <span className={styles.eduPeriod}>{edu.period}</span>
                </div>
                <p className={styles.eduFocus}>{edu.focus}</p>
              </div>
            ))}
          </section>

          {/* ── AWARDS ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Awards & Recognition</h2>
            <div className={styles.awardsGrid}>
              {TOP_AWARDS.map((a) => (
                <div key={a.id} className={styles.awardItem}>
                  <div className={styles.awardHeader}>
                    <span className={styles.awardTitle}>{a.title}</span>
                    <span className={styles.awardDate}>{a.date}</span>
                  </div>
                  <span className={styles.awardIssuer}>{a.issuer}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── MENTORSHIP ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Mentorship & Leadership</h2>
            {MENTORSHIP.map((m) => (
              <div key={m.id} className={styles.mentorEntry}>
                <div className={styles.mentorHeader}>
                  <div>
                    <h3 className={styles.mentorRole}>{m.role}</h3>
                    <p className={styles.mentorOrg}>{m.org}</p>
                  </div>
                  <span className={styles.mentorPeriod}>{m.period}</span>
                </div>
                <p className={styles.mentorDesc}>{m.description}</p>
              </div>
            ))}
          </section>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CONTACT } from "../data/portfolioData";
import { getCandidateSummary } from "../hooks/useSearch";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { RECRUITER_EXPANDED_QUERY } from "../lib/breakpoints";
import { trackContactClick } from "../lib/analytics";
import styles from "./RecruiterPanel.module.css";

function MoreIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="5" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="19" r="2" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function RecruiterPanel() {
  const navigate = useNavigate();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isExpandedLayout = useMediaQuery(RECRUITER_EXPANDED_QUERY);
  const summary = getCandidateSummary();

  useEffect(() => {
    if (isExpandedLayout) setMenuOpen(false);
  }, [isExpandedLayout]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const openSummaryFromMenu = () => {
    setMenuOpen(false);
    setSummaryOpen(true);
  };

  const summaryPanel = (
    <motion.div
      key="summary"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={styles.summaryPanel}
    >
      <p className={styles.summaryText}>{summary}</p>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={() => setSummaryOpen(false)}
        aria-label="Close summary"
      >
        Close
      </button>
    </motion.div>
  );

  return (
    <aside className={styles.panel} aria-label="Recruiter utilities">
      {isExpandedLayout ? (
        <>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btn}
              onClick={() => { trackContactClick("resume"); navigate("/resume"); }}
            >
              <span className={styles.btnIcon}>↓</span>
              Download Resume
            </button>
            <a
              href={CONTACT.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btn}
              onClick={() => trackContactClick("linkedin")}
            >
              <span className={styles.btnIcon}>in</span>
              View LinkedIn
            </a>
            <a href={`mailto:${CONTACT.email}`} className={styles.btn} onClick={() => trackContactClick("email")}>
              <span className={styles.btnIcon}>✉</span>
              Contact
            </a>
            <button
              type="button"
              className={styles.btn}
              onClick={() => { trackContactClick("summarize"); setSummaryOpen(!summaryOpen); }}
            >
              <span className={styles.btnIcon}>◇</span>
              Summarize Candidate
            </button>
          </div>
          <AnimatePresence>{summaryOpen && summaryPanel}</AnimatePresence>
        </>
      ) : (
        <div className={styles.compact}>
          <AnimatePresence>
            {menuOpen && (
              <>
                <motion.button
                  type="button"
                  className={styles.backdrop}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setMenuOpen(false)}
                />
                <motion.nav
                  id="recruiter-quick-menu"
                  role="menu"
                  aria-label="Quick actions"
                  className={styles.flyout}
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.menuItem}
                    onClick={() => { trackContactClick("resume"); setMenuOpen(false); navigate("/resume"); }}
                  >
                    <span className={styles.menuIcon}>↓</span>
                    <span>Download Resume</span>
                  </button>
                  <a
                    role="menuitem"
                    href={CONTACT.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.menuItem}
                    onClick={() => { trackContactClick("linkedin"); setMenuOpen(false); }}
                  >
                    <span className={styles.menuIcon}>in</span>
                    <span>View LinkedIn</span>
                  </a>
                  <a
                    role="menuitem"
                    href={`mailto:${CONTACT.email}`}
                    className={styles.menuItem}
                    onClick={() => { trackContactClick("email"); setMenuOpen(false); }}
                  >
                    <span className={styles.menuIcon}>✉</span>
                    <span>Contact</span>
                  </a>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.menuItem}
                    onClick={openSummaryFromMenu}
                  >
                    <span className={styles.menuIcon}>◇</span>
                    <span>Summarize Candidate</span>
                  </button>
                </motion.nav>
              </>
            )}
          </AnimatePresence>

          <AnimatePresence>{summaryOpen && summaryPanel}</AnimatePresence>

          <button
            type="button"
            className={styles.fab}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-controls={menuOpen ? "recruiter-quick-menu" : undefined}
            aria-label={menuOpen ? "Close recruiter actions menu" : "Open recruiter actions menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <CloseIcon /> : <MoreIcon />}
          </button>
        </div>
      )}
    </aside>
  );
}

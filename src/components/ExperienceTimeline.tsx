import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSearch } from "../hooks/useSearch";
import { useSearchContext } from "../context/SearchContext";
import type { Experience } from "../data/portfolioData";
import { trackExperienceSelect } from "../lib/analytics";
import styles from "./ExperienceTimeline.module.css";

const SCALE_START = 2019;
const SCALE_END = 2026;
const SCALE_YEARS = SCALE_END - SCALE_START;

function parsePeriodToScale(period: string, duration: string): { left: number; width: number } {
  const now = 2026;
  let startYear = SCALE_START;
  let endYear = SCALE_END;

  const rangeMatch = period.match(/(\d{4})\s*[-–]\s*(\d{4}|Present)/i);
  const singleYearMatch = period.match(/^(\d{4})$/);
  const monthRangeMatch = period.match(/([A-Za-z]+)\s*(\d{4})\s*[-–]\s*(Present|[A-Za-z]+\s*\d{4})/i);

  if (monthRangeMatch) {
    const [, startMonth, startY, endPart] = monthRangeMatch;
    const monthNames: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const m = startMonth?.toLowerCase().slice(0, 3) ?? "jan";
    const monthOffset = monthNames[m] ?? 0;
    startYear = parseInt(startY, 10) + monthOffset / 12;
    if (period.toLowerCase().includes("present")) {
      endYear = now;
    } else if (endPart) {
      const endMonthMatch = endPart.match(/([A-Za-z]+)\s*(\d{4})/i);
      if (endMonthMatch) {
        const [, endMonth, endY] = endMonthMatch;
        const em = endMonth?.toLowerCase().slice(0, 3) ?? "jan";
        const endMonthOffset = monthNames[em] ?? 0;
        endYear = parseInt(endY, 10) + endMonthOffset / 12;
      } else {
        endYear = startYear + 2;
      }
    } else {
      endYear = startYear + 2;
    }
  } else if (rangeMatch) {
    startYear = parseInt(rangeMatch[1], 10);
    endYear = rangeMatch[2].toLowerCase() === "present" ? now : parseInt(rangeMatch[2], 10);
  } else if (singleYearMatch) {
    startYear = parseInt(singleYearMatch[1], 10);
    const d = duration.toLowerCase();
    if (d.includes("month")) {
      const m = d.match(/(\d+)\s*month/);
      endYear = startYear + (m ? parseInt(m[1], 10) / 12 : 0.17);
    } else {
      endYear = startYear + 1;
    }
  }

  const left = Math.max(0, (startYear - SCALE_START) / SCALE_YEARS) * 100;
  const width = Math.min(100 - left, ((endYear - startYear) / SCALE_YEARS) * 100);
  return { left, width: Math.max(width, 2) };
}

function extractStats(highlights: string[]): string[] {
  const stats: string[] = [];
  const seen = new Set<string>();
  for (const h of highlights) {
    const match = h.match(/(\d+%|\d+\s*%|>=?\s*\d+%|crores?\s+worth)/i);
    if (match) {
      const s = match[1].trim();
      if (!seen.has(s)) {
        seen.add(s);
        stats.push(s);
      }
    }
  }
  return stats.slice(0, 5);
}

const COMPANY_COLORS: Record<string, string> = {
  "Adobe Inc.": "rgba(56, 189, 248, 0.7)",
  "Adobe Inc. (Adobe XD Team)": "rgba(56, 189, 248, 0.6)",
  "YUJ Designs": "rgba(139, 92, 246, 0.7)",
  "YUJ Designs Pvt Ltd": "rgba(139, 92, 246, 0.7)",
  Bizongo: "rgba(20, 184, 166, 0.7)",
  "National Institute of Design, Andhra Pradesh": "rgba(168, 85, 247, 0.6)",
};

function rgbaToGlow(rgba: string): string {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return "rgba(100, 180, 220, 0.4)";
  const [, r, g, b] = m;
  return `rgba(${r}, ${g}, ${b}, 0.5)`;
}

function rgbaToBorder(rgba: string): string {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return "rgba(100, 180, 220, 0.9)";
  const [, r, g, b] = m;
  return `rgba(${r}, ${g}, ${b}, 0.95)`;
}

function ExperienceBarSegment({
  exp,
  leftPercent,
  widthPercent,
  index: _index,
  isSelected,
  onSelect,
}: {
  exp: Experience;
  leftPercent: number;
  widthPercent: number;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = COMPANY_COLORS[exp.company] ?? "rgba(100, 180, 220, 0.6)";

  const segmentOpacity = isSelected ? 1 : hovered ? 0.7 : 0.4;
  const glowColor = rgbaToGlow(color);
  const borderColor = rgbaToBorder(color);
  const selectedStyle = isSelected
    ? { boxShadow: `0 0 0 2px ${borderColor}, 0 0 16px ${glowColor}` }
    : undefined;

  return (
    <button
      type="button"
      className={`${styles.segmentWrapper} ${isSelected ? styles.segmentSelected : ""}`}
      style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-pressed={isSelected}
      aria-label={`${exp.company} – ${exp.role}`}
    >
      <motion.div
        className={styles.segment}
        style={{ backgroundColor: color, ...selectedStyle }}
        animate={{ opacity: segmentOpacity }}
        transition={{ duration: 0.2 }}
      />
      {!isSelected && hovered && (
        <span className={styles.segmentTooltip} role="tooltip">
          {exp.company} — {exp.role}
        </span>
      )}
    </button>
  );
}

function ExperienceDetailPanel({ exp }: { exp: Experience }) {
  const stats = useMemo(
    () => (exp.stats && exp.stats.length > 0 ? exp.stats : extractStats(exp.highlights)),
    [exp.stats, exp.highlights]
  );

  return (
    <motion.div
      className={styles.detailPanel}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className={styles.detailHeader}>
        <span className={styles.detailCompany}>{exp.company}</span>
        <span className={styles.detailDuration}>{exp.duration}</span>
      </div>
      <p className={styles.detailRole}>{exp.role}</p>
      {exp.summary && (
        <div className={styles.detailSection}>
          <span className={styles.detailLabel}>What I did</span>
          <p className={styles.detailParagraph}>{exp.summary}</p>
        </div>
      )}
      {stats.length > 0 && (
        <div className={styles.detailSection}>
          <span className={styles.detailLabel}>Key metrics</span>
          <div className={styles.detailStats}>
            {stats.map((s, i) => (
              <span key={i} className={styles.statBadge}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className={styles.detailSection}>
        <span className={styles.detailLabel}>Skills</span>
        <div className={styles.detailTags}>
          {exp.tags.map((tag) => (
            <span key={tag} className={styles.detailTag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      {exp.link && !["adobe-xd-intern", "nid-faculty", "yuj"].includes(exp.id) && (
        <Link
          to={`/works/${exp.id}`}
          state={{ fromSection: "experience" }}
          className={styles.detailLink}
        >
          View works →
        </Link>
      )}
    </motion.div>
  );
}

export function ExperienceTimeline() {
  const { query } = useSearchContext();
  const { filteredExperience } = useSearch(query);

  const displayExperience = useMemo(() => {
    const list = filteredExperience.filter(
      (e) => e.company !== "Think Ethical, Bangalore"
    );
    return list.map((exp) => {
      const { left, width } = parsePeriodToScale(exp.period, exp.duration);
      return { exp, leftPercent: left, widthPercent: width };
    });
  }, [filteredExperience]);

  const defaultSelected = useMemo(() => {
    const adobe = displayExperience.find(
      (d) => d.exp.company === "Adobe Inc." || d.exp.id === "adobe"
    );
    return adobe?.exp ?? displayExperience[0]?.exp ?? null;
  }, [displayExperience]);

  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);

  useEffect(() => {
    if (selectedExp === null && defaultSelected) {
      setSelectedExp(defaultSelected);
    } else if (
      selectedExp &&
      !displayExperience.some((d) => d.exp.id === selectedExp.id)
    ) {
      setSelectedExp(defaultSelected);
    }
  }, [defaultSelected, displayExperience, selectedExp]);

  const activeSelected = selectedExp ?? defaultSelected;

  const timelineOrder = useMemo(
    () =>
      [...displayExperience].sort((a, b) => a.leftPercent - b.leftPercent),
    [displayExperience]
  );
  const selectedIndex = timelineOrder.findIndex(
    (d) => d.exp.id === activeSelected?.id
  );
  const canGoPrev = selectedIndex > 0;
  const canGoNext =
    selectedIndex >= 0 && selectedIndex < timelineOrder.length - 1;
  const goPrev = () => {
    if (canGoPrev && timelineOrder[selectedIndex - 1]) {
      setSelectedExp(timelineOrder[selectedIndex - 1].exp);
    }
  };
  const goNext = () => {
    if (canGoNext && timelineOrder[selectedIndex + 1]) {
      setSelectedExp(timelineOrder[selectedIndex + 1].exp);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };

  const years = Array.from(
    { length: SCALE_END - SCALE_START + 1 },
    (_, i) => SCALE_START + i
  );

  return (
    <section
      className={styles.section}
      id="experience"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Experience timeline. Use left and right arrow keys to navigate."
    >
      <div className={styles.headerRow}>
        <h2 className={styles.sectionTitle}>Experience</h2>
        {displayExperience.length > 0 && (
          <div className={styles.navArrows}>
            <button
              type="button"
              className={styles.navArrow}
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label="Previous experience"
            >
              <span className={styles.navArrowLeft} />
            </button>
            <button
              type="button"
              className={styles.navArrow}
              onClick={goNext}
              disabled={!canGoNext}
              aria-label="Next experience"
            >
              <span className={styles.navArrowRight} />
            </button>
          </div>
        )}
      </div>
      <p className={styles.subtitle}>
        From Bizongo → YUJ → Adobe: increasing ownership and system-level thinking
      </p>
      <div
        className={
          displayExperience.length > 0
            ? `${styles.barContainer} ${styles.barContainerBounded}`
            : styles.barContainer
        }
      >
        {displayExperience.length > 0 ? (
          <>
            <div className={styles.bar}>
              {displayExperience.map(({ exp, leftPercent, widthPercent }, i) => (
                <ExperienceBarSegment
                  key={exp.id}
                  exp={exp}
                  leftPercent={leftPercent}
                  widthPercent={widthPercent}
                  index={i}
                  isSelected={activeSelected?.id === exp.id}
                  onSelect={() => { trackExperienceSelect(exp.id, exp.company); setSelectedExp(exp); }}
                />
              ))}
            </div>
            <div className={styles.yearScale}>
              {years.map((year) => (
                <span key={year} className={styles.yearTick}>
                  {year}
                </span>
              ))}
            </div>
            {activeSelected && (
              <div className={styles.detailPanelWrap}>
                <ExperienceDetailPanel exp={activeSelected} />
              </div>
            )}
          </>
        ) : (
          <p className={styles.empty}>No experience entries match your search.</p>
        )}
      </div>
    </section>
  );
}

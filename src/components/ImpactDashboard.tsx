import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../hooks/useSearch";
import { useSearchContext } from "../context/SearchContext";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { CASE_STUDIES, type ImpactMetric } from "../data/portfolioData";
import { resolveThumbnail } from "../lib/utils";
import styles from "./ImpactDashboard.module.css";

/* Labels whose metrics represent reductions — arrow down + green hue */
const REDUCTION_LABELS = new Set([
  "First-time Device Setup Friction",
  "UI Support Tickets",
  "Operational Errors",
  "QC Time",
  "Asset Creation Effort",
  "Workflow Setup Time",
  "Feature Dev Time",
]);

function AnimatedCounter({ value, reduction }: { value: string; reduction?: boolean }) {
  const numericMatch = value.match(/\d+/);
  const suffix = value.replace(/\d+/, "");
  const target = numericMatch ? parseInt(numericMatch[0], 10) : 0;
  const [current, setCurrent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (target === 0) return;
    setIsComplete(false);
    const duration = 450;
    const step = target / (duration / 16);
    let v = 0;
    const id = setInterval(() => {
      v += step;
      if (v >= target) {
        setCurrent(target);
        setIsComplete(true);
        clearInterval(id);
      } else {
        setCurrent(Math.floor(v));
      }
    }, 16);
    return () => clearInterval(id);
  }, [target]);

  return (
    <span className={styles.valueInner}>
      <span data-complete={isComplete || !numericMatch}>
        {numericMatch ? `${current}${suffix}` : value}
      </span>
      {numericMatch && (
        <span className={reduction ? styles.chevronDown : styles.chevronUp} aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={reduction ? "M6 9l6 6 6-6" : "M18 15l-6-6-6 6"} />
          </svg>
        </span>
      )}
    </span>
  );
}

const FEATURED_LABEL = "First-time Device Setup Friction";

/** Resolve the thumbnail URL for a metric's linked project. */
function getMetricThumbnail(projectId?: string): string {
  if (!projectId) return "";
  const study = CASE_STUDIES.find((c) => c.id === projectId);
  return study?.thumbnail ? resolveThumbnail(study.thumbnail) : "";
}

function MetricCard({ metric, featured }: { metric: ImpactMetric; featured?: boolean }) {
  const navigate = useNavigate();
  const isReduction = REDUCTION_LABELS.has(metric.label);
  const hasLink = !!metric.projectId;
  const cardClass = [
    featured ? styles.cardFeatured : styles.card,
    isReduction ? styles.cardReduction : "",
    hasLink ? styles.cardClickable : "",
  ].filter(Boolean).join(" ");
  const valueClass = featured
    ? `${styles.valueFeatured} ${isReduction ? styles.valueReduction : ""}`
    : `${styles.value} ${isReduction ? styles.valueReduction : ""}`;

  const thumb = getMetricThumbnail(metric.projectId);

  return (
    <div
      className={cardClass}
      onClick={hasLink ? () => navigate(`/project/${metric.projectId}`, { state: { fromSection: "impact" } }) : undefined}
      role={hasLink ? "link" : undefined}
      tabIndex={hasLink ? 0 : undefined}
      onKeyDown={hasLink ? (e) => { if (e.key === "Enter") navigate(`/project/${metric.projectId}`, { state: { fromSection: "impact" } }); } : undefined}
    >
      {thumb && (
        <div
          className={styles.cardBg}
          style={{ backgroundImage: `url(${thumb})` }}
        />
      )}
      <div className={valueClass}>
        <AnimatedCounter value={metric.value} reduction={isReduction} />
      </div>
      <div className={styles.label}>{metric.label}</div>
      <div className={styles.context}>{metric.context}</div>
    </div>
  );
}

/* ── Mobile carousel ── */
function ImpactCarousel({ metrics }: { metrics: ImpactMetric[] }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasBeenActive, setHasBeenActive] = useState<Set<number>>(() => new Set([0]));
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const trackRef = useRef<HTMLDivElement>(null);
  const count = metrics.length;

  const goTo = useCallback(
    (idx: number) => {
      const next = ((idx % count) + count) % count;
      setActiveIndex(next);
      setHasBeenActive((prev) => {
        if (prev.has(next)) return prev;
        const copy = new Set(prev);
        copy.add(next);
        return copy;
      });
      const track = trackRef.current;
      if (track) {
        const card = track.children[next] as HTMLElement | undefined;
        if (card) {
          track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
        }
      }
    },
    [count],
  );

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % count;
        setTimeout(() => goTo(next), 0);
        return prev;
      });
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [count, goTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goTo(activeIndex + 1);
    }, 5000);
  }, [activeIndex, goTo]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const scrollLeft = track.scrollLeft;
        const cardWidth = track.children[0]?.clientWidth ?? 1;
        const gap = 16;
        const nearest = Math.round(scrollLeft / (cardWidth + gap));
        if (nearest !== activeIndex && nearest >= 0 && nearest < count) {
          setActiveIndex(nearest);
          setHasBeenActive((prev) => {
            if (prev.has(nearest)) return prev;
            const copy = new Set(prev);
            copy.add(nearest);
            return copy;
          });
          resetTimer();
        }
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [activeIndex, count, resetTimer]);

  return (
    <div className={styles.carouselWrapper}>
      <div ref={trackRef} className={styles.carouselTrack}>
        {metrics.map((metric, i) => {
          const isReduction = REDUCTION_LABELS.has(metric.label);
          const isActive = activeIndex === i;
          const hasAnimated = hasBeenActive.has(i);
          const hasLink = !!metric.projectId;
          const thumb = getMetricThumbnail(metric.projectId);
          return (
            <div
              key={metric.label}
              className={`${styles.carouselCard} ${isReduction ? styles.carouselCardReduction : styles.carouselCardBlue} ${isActive ? `${styles.carouselCardActive} ${styles.carouselCardInView}` : ""}`}
              onClick={hasLink ? () => navigate(`/project/${metric.projectId}`, { state: { fromSection: "impact" } }) : undefined}
              role={hasLink ? "link" : undefined}
              tabIndex={hasLink ? 0 : undefined}
            >
              {thumb && (
                <div
                  className={styles.carouselCardBg}
                  style={{ backgroundImage: `url(${thumb})` }}
                />
              )}
              <div className={styles.carouselCardContent}>
              <div className={`${styles.carouselValue} ${isReduction ? styles.carouselValueReduction : ""}`}>
                {hasAnimated ? (
                  <AnimatedCounter value={metric.value} reduction={isReduction} />
                ) : (
                  <span className={styles.valueInner}>
                    0{metric.value.replace(/\d+/, "")}
                  </span>
                )}
              </div>
              <div className={styles.carouselLabel}>{metric.label}</div>
              <div className={styles.carouselContext}>{metric.context}</div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className={styles.carouselDots}>
          {metrics.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.carouselDot} ${activeIndex === i ? styles.carouselDotActive : ""}`}
              onClick={() => {
                goTo(i);
                resetTimer();
              }}
              aria-label={`Metric ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ImpactDashboard() {
  const { query } = useSearchContext();
  const { filteredImpact } = useSearch(query);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const featured = filteredImpact.find((m) => m.label === FEATURED_LABEL);
  const rest = filteredImpact.filter((m) => m.label !== FEATURED_LABEL);

  return (
    <section className={styles.section} id="impact">
      <h2 className={styles.sectionTitle}>Impact</h2>
      <p className={styles.subtitle}>
        Quantified outcomes across products and teams
      </p>

      {isMobile ? (
        <ImpactCarousel metrics={filteredImpact} />
      ) : (
        <div className={styles.layout}>
          {featured && (
            <motion.div
              key={featured.label}
              className={styles.featuredSlot}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <MetricCard metric={featured} featured />
            </motion.div>
          )}
          <div className={styles.grid}>
            {rest.map((metric, i) => (
              <motion.div
                key={metric.label}
                className={styles.gridItem}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <MetricCard metric={metric} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {filteredImpact.length === 0 && (
        <p className={styles.empty}>No impact metrics match your search.</p>
      )}
    </section>
  );
}

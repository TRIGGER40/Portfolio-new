import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CAREER_EVOLUTION } from "../data/portfolioData";
import type { CareerStage } from "../data/portfolioData";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { ShimmerImg } from "./ShimmerImg";
import styles from "./CareerEvolution.module.css";

const CAREER_IMAGES: Record<string, string> = {
  "computer-science": "/images/career/computer-science.jpg",
  "industrial": "/images/career/industrial.jpg",
  "ux": "/images/career/ux.jpg",
  "b2b": "/images/career/b2b.webp",
  "b2c": "/images/career/b2c.jpg",
  "ai-first": "/images/career/ai-first.png",
};

const AUTO_MS = 5000;

/** Matches common `@media (max-width: 768px)` mobile rules in this project */
const MOBILE_STORIES_QUERY = "(max-width: 768px)";

function StageBody({ stage, index }: { stage: CareerStage; index: number }) {
  const imgSrc = CAREER_IMAGES[stage.id];
  /* Alternate slight rotations for polaroid feel */
  const rotations = [-2.5, 1.8, -1.2, 2.4, -1.8, 1.5];
  const rotation = rotations[index % rotations.length];

  return (
    <>
      {imgSrc && (
        <div
          className={styles.polaroid}
          style={{ "--polaroid-rotate": `${rotation}deg` } as React.CSSProperties}
        >
          <div className={styles.polaroidInner}>
            <img
              src={imgSrc}
              alt={stage.stage}
              className={styles.polaroidImg}
              loading="lazy"
            />
            <div className={styles.polaroidCaption}>
              <span className={styles.polaroidLabel}>{stage.stage}</span>
              <span className={styles.polaroidYear}>{stage.period}</span>
            </div>
          </div>
        </div>
      )}
      <h3 className={styles.detailTitle}>{stage.stage}</h3>
      <p className={styles.detailPeriod}>{stage.period}</p>
      <p className={styles.detailFocus}>{stage.focus}</p>
      <p className={styles.detailBody}>{stage.details}</p>
    </>
  );
}

export function CareerEvolution() {
  const n = CAREER_EVOLUTION.length;
  const isMobileStories = useMediaQuery(MOBILE_STORIES_QUERY);
  const reduceMotion = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [barProgress, setBarProgress] = useState(0);
  const autoCycleStartRef = useRef(Date.now());

  const selected: CareerStage = CAREER_EVOLUTION[selectedIndex];

  /** Restart progress for the current stage from 0 */
  const resetStageTimer = useCallback(() => {
    autoCycleStartRef.current = Date.now();
    setBarProgress(0);
  }, []);

  /** Whenever the active stage changes, zero the bar before paint */
  useLayoutEffect(() => {
    resetStageTimer();
  }, [selectedIndex, resetStageTimer]);

  /* Progress bar animation */
  useEffect(() => {
    let frame: number;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const elapsed = Date.now() - autoCycleStartRef.current;
      setBarProgress(Math.min(1, elapsed / AUTO_MS));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  /* Auto-advance at constant speed */
  useEffect(() => {
    const id = window.setInterval(() => {
      setSelectedIndex((i) => (i + 1) % n);
      autoCycleStartRef.current = Date.now();
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [n]);

  const handleSelectStage = (index: number) => {
    setSelectedIndex(index);
    resetStageTimer();
  };

  /** Left edge → previous; right edge → next. One adjacent stage per click (no wrap). */
  const handleStepCareer = useCallback(
    (delta: -1 | 1) => {
      let didChange = false;
      setSelectedIndex((i) => {
        const next =
          delta === -1 ? (i > 0 ? i - 1 : i) : i < n - 1 ? i + 1 : i;
        didChange = next !== i;
        return next;
      });
      if (didChange) {
        setWaitingIdleAfterClick(true);
      }
    },
    [n]
  );

  const mobileTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const };

  const desktopTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <section className={styles.section} id="career-evolution">
      <h2 className={styles.sectionTitle}>Career Evolution</h2>
      <p className={styles.subtitle}>
        Computer Science → Industrial Design → UX design → B2B systems → B2C products → AI first products
      </p>

      {isMobileStories ? (
        <div
          className={styles.mobileStack}
        >
          {/* Story progress pills */}
          <div className={styles.storiesPills} role="tablist" aria-label="Career stages">
            {CAREER_EVOLUTION.map((stage, i) => {
              const isPast = i < selectedIndex;
              const isActive = i === selectedIndex;
              const fill = isPast ? 1 : isActive ? barProgress : 0;
              return (
                <button
                  key={stage.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.storyPill} ${isActive ? styles.storyPillActive : ""}`}
                  onClick={() => handleSelectStage(i)}
                >
                  <span className={styles.storyPillBar}>
                    <span className={styles.storyPillFill} style={{ transform: `scaleX(${fill})` }} />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stacked polaroid deck */}
          <div className={styles.deckWrap}>
            {/* Tap left / right to navigate */}
            <button
              type="button"
              className={`${styles.cardEdgeHit} ${styles.cardEdgeHitLeft}`}
              aria-label="Previous"
              onClick={() => handleStepCareer(-1)}
            />
            <button
              type="button"
              className={`${styles.cardEdgeHit} ${styles.cardEdgeHitRight}`}
              aria-label="Next"
              onClick={() => handleStepCareer(1)}
            />

            {CAREER_EVOLUTION.map((stage, index) => {
              const offset = index - selectedIndex;
              const isActive = offset === 0;
              const imgSrc = CAREER_IMAGES[stage.id];
              const rotations = [-2.5, 1.8, -1.2, 2.4, -1.8, 1.5];
              const rotation = rotations[index % rotations.length];
              /* Stack behind: slightly shifted + scaled + faded */
              const absOff = Math.abs(offset);
              const stackScale = isActive ? 1 : Math.max(0.82, 1 - absOff * 0.06);
              const stackY = isActive ? 0 : absOff * 6;
              const stackOpacity = isActive ? 1 : Math.max(0.08, 0.35 - absOff * 0.08);
              const stackZ = n - absOff;

              return (
                <motion.div
                  key={stage.id}
                  className={`${styles.deckCard} ${isActive ? styles.deckCardActive : ""}`}
                  animate={{
                    scale: stackScale,
                    y: stackY,
                    opacity: stackOpacity,
                    zIndex: stackZ,
                  }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  style={{ position: "absolute" }}
                >
                  <div
                    className={styles.polaroid}
                    style={{ "--polaroid-rotate": `${isActive ? 0 : rotation}deg` } as React.CSSProperties}
                  >
                    <div className={styles.polaroidInner}>
                      {imgSrc && <ShimmerImg src={imgSrc} alt={stage.stage} className={styles.polaroidImg} loading="lazy" />}
                      <div className={styles.polaroidCaption}>
                        <span className={styles.polaroidLabel}>{stage.stage}</span>
                        <span className={styles.polaroidYear}>{stage.period}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Text below the deck */}
          <div className={styles.deckMetaWrap}>
            <AnimatePresence initial={false}>
              <motion.div
                key={selected.id}
                className={styles.deckMeta}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, position: "absolute" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className={styles.detailTitle}>{selected.stage}</h3>
                <p className={styles.detailPeriod}>{selected.period}</p>
                <p className={styles.detailFocus}>{selected.focus}</p>
                <p className={styles.detailBody}>{selected.details}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className={styles.polaroidGrid}>
          {CAREER_EVOLUTION.map((stage, index) => {
            const isActive = selectedIndex === index;
            const imgSrc = CAREER_IMAGES[stage.id];
            const rotations = [-2.5, 1.8, -1.2, 2.4, -1.8, 1.5];
            const rotation = rotations[index % rotations.length];
            return (
              <button
                key={stage.id}
                type="button"
                className={`${styles.polaroidCard} ${isActive ? styles.polaroidCardActive : ""}`}
                onClick={() => handleSelectStage(index)}
              >
                <div
                  className={styles.polaroid}
                  style={{ "--polaroid-rotate": `${rotation}deg` } as React.CSSProperties}
                >
                  <div className={styles.polaroidInner}>
                    {imgSrc && (
                      <img src={imgSrc} alt={stage.stage} className={styles.polaroidImg} loading="lazy" />
                    )}
                    <div className={styles.polaroidCaption}>
                      <span className={styles.polaroidLabel}>{stage.stage}</span>
                      <span className={styles.polaroidYear}>{stage.period}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.polaroidMeta}>
                  <span className={styles.polaroidMetaName}>{stage.stage}</span>
                  <span className={styles.polaroidMetaPeriod}>{stage.period}</span>
                  <span className={styles.polaroidMetaFocus}>{stage.focus}</span>
                </div>
                {isActive && (
                  <div className={styles.progressWrap}>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{ transform: `scaleX(${barProgress})` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

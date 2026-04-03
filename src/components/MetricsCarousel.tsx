import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./MetricsCarousel.module.css";

/** Extract the leading number (with optional decimal, comma, +) from a metric string.
 *  E.g. "50% reduction…" → { raw: "50%", value: 50, suffix: "%" }
 *       "3x faster…"    → { raw: "3x", value: 3, suffix: "x" }
 *       "1,000+ daily…" → { raw: "1,000+", value: 1000, suffix: "+" }
 *       "Significant…"  → null
 */
function parseMetricNumber(text: string): {
  raw: string;
  value: number;
  suffix: string;
  rest: string;
} | null {
  const m = text.match(/^([\d,]+(?:\.\d+)?)\s*([%x+]?)\s*(.*)/i);
  if (!m) return null;
  const numStr = m[1].replace(/,/g, "");
  const value = parseFloat(numStr);
  if (Number.isNaN(value)) return null;
  return {
    raw: m[1] + m[2],
    value,
    suffix: m[2] || "",
    rest: m[3],
  };
}

/** Format a number for display: add commas for thousands, keep decimals. */
function formatNumber(n: number, hasDecimals: boolean): string {
  if (hasDecimals) return n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return Math.round(n).toLocaleString("en-US");
}

/** Animated count-up from 0 to target. */
function CountUp({ target, suffix, duration = 400 }: { target: number; suffix: string; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const hasDecimals = target !== Math.floor(target);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    startRef.current = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return (
    <span className={styles.metricNumber}>
      {formatNumber(current, hasDecimals)}
      {suffix && <span className={styles.metricSuffix}>{suffix}</span>}
    </span>
  );
}

interface MetricsCarouselProps {
  metrics: string[];
}

export function MetricsCarousel({ metrics }: MetricsCarouselProps) {
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
      // Scroll the track
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

  // Auto-advance every 5 seconds
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % count;
        // trigger goTo side effects
        setTimeout(() => goTo(next), 0);
        return prev; // goTo sets it
      });
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [count, goTo]);

  // Reset timer on manual interaction
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goTo(activeIndex + 1);
    }, 5000);
  }, [activeIndex, goTo]);

  // Handle scroll snap
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

  const parsed = metrics.map(parseMetricNumber);

  return (
    <div className={styles.wrapper}>
      <div ref={trackRef} className={styles.track}>
        {metrics.map((metric, i) => {
          const p = parsed[i];
          const isActive = hasBeenActive.has(i);
          return (
            <div key={i} className={`${styles.card} ${activeIndex === i ? styles.cardActive : ""}`}>
              {p ? (
                <>
                  <div className={styles.numberRow}>
                    {isActive ? (
                      <CountUp target={p.value} suffix={p.suffix} />
                    ) : (
                      <span className={styles.metricNumber}>
                        0<span className={styles.metricSuffix}>{p.suffix}</span>
                      </span>
                    )}
                  </div>
                  <p className={styles.metricDetail}>{p.rest}</p>
                </>
              ) : (
                <p className={styles.metricDetailOnly}>{metric}</p>
              )}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className={styles.dots}>
          {metrics.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${activeIndex === i ? styles.dotActive : ""}`}
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

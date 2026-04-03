import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSearch } from "../hooks/useSearch";
import { useSearchContext } from "../context/SearchContext";
import { getArticleBySlug, thoughtLayerCardId } from "../data/articles";
import { ShimmerImg } from "./ShimmerImg";
import styles from "./ThoughtLayer.module.css";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function ThoughtLayer() {
  const { query } = useSearchContext();
  const { filteredThoughts } = useSearch(query);
  const isMobile = useMediaQuery("(max-width: 480px)");
  const stackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollLockRef = useRef(false);
  const scrollEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Compute scroll target for a given index ── */
  const getScrollLeftForIndex = useCallback((index: number) => {
    const el = stackRef.current;
    if (!el) return 0;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return 0;
    const lastIndex = el.children.length - 1;
    if (index === 0) return 0;
    if (index === lastIndex) return el.scrollWidth - el.clientWidth;
    return child.offsetLeft - (el.offsetWidth - child.offsetWidth) / 2;
  }, []);

  /* ── Schedule next auto-advance ── */
  const scheduleAutoScroll = useCallback((delayMs = 3000) => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => {
      if (isMobile || isHovered) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % filteredThoughts.length;
        const el = stackRef.current;
        if (el) {
          scrollLockRef.current = true;
          el.scrollTo({ left: getScrollLeftForIndex(next), behavior: "smooth" });
          setTimeout(() => { scrollLockRef.current = false; }, 600);
        }
        // Re-schedule
        scheduleAutoScroll(3000);
        return next;
      });
    }, delayMs);
  }, [isMobile, isHovered, filteredThoughts.length, getScrollLeftForIndex]);

  /* ── Programmatic scroll (dots / external) — pauses auto for 5s ── */
  const goToIndex = useCallback((index: number) => {
    const el = stackRef.current;
    if (!el) return;
    scrollLockRef.current = true;
    setActiveIndex(index);
    el.scrollTo({ left: getScrollLeftForIndex(index), behavior: "smooth" });
    setTimeout(() => { scrollLockRef.current = false; }, 600);
    // Pause auto-scroll for 5s then restart
    scheduleAutoScroll(5000);
  }, [getScrollLeftForIndex, scheduleAutoScroll]);

  /* ── Scroll event: only update activeIndex during manual (touch/wheel) scrolling ── */
  const handleScroll = useCallback(() => {
    const el = stackRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);

    // Don't override activeIndex during programmatic scrolls
    if (scrollLockRef.current) return;

    const children = Array.from(el.children) as HTMLElement[];
    const containerCenter = el.scrollLeft + el.offsetWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    children.forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(containerCenter - childCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIndex(closest);

    // After manual scroll settles, snap to nearest card
    if (scrollEndRef.current) clearTimeout(scrollEndRef.current);
    scrollEndRef.current = setTimeout(() => {
      if (scrollLockRef.current) return;
      goToIndex(closest);
    }, 150);
  }, [goToIndex]);

  useEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* ── Start / stop auto-scroll based on conditions ── */
  useEffect(() => {
    if (isMobile || filteredThoughts.length <= 1) {
      if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
      return;
    }
    scheduleAutoScroll(3000);
    return () => { if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; } };
  }, [isMobile, filteredThoughts.length, scheduleAutoScroll]);

  return (
    <section className={styles.section} id="thoughts">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Thought Layer</h2>
        <p className={styles.subtitle}>
          Long-form articles on design, AI, creative practice, and how teams
          stay healthy while shipping.
        </p>
      </div>
      <div
        className={`${styles.stack} ${canScrollLeft ? styles.fadeLeft : ""} ${canScrollRight ? styles.fadeRight : ""}`}
        ref={stackRef}
        onMouseEnter={() => {
          setIsHovered(true);
          if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          scheduleAutoScroll(3000);
        }}
      >
        {filteredThoughts.length > 0 ? (
          filteredThoughts.map((thought, i) => {
            const article = getArticleBySlug(thought.id);
            const cover = article?.coverSrc ?? "";
            const alt = article?.coverAlt ?? thought.title;
            return (
              <motion.div
                key={thought.id}
                id={thoughtLayerCardId(thought.id)}
                className={`${styles.cardScrollTarget} ${i === activeIndex ? styles.cardScrollTargetActive : ""}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <Link
                  to={`/articles/${thought.id}`}
                  state={{ fromSection: "thoughts" }}
                  className={styles.cardLink}
                >
                  <article className={styles.card}>
                    <div className={styles.cardImageWrap}>
                      <ShimmerImg
                        src={cover}
                        alt={alt}
                        className={styles.cardImage}
                        loading="lazy"
                      />
                      <div className={styles.cardImageOverlay} aria-hidden />
                    </div>
                    <div className={styles.cardBody}>
                      {article?.published && (
                        <span className={styles.date}>
                          {article.published.replace(/\s\d{1,2},/, "")}
                        </span>
                      )}
                      <h3 className={styles.title}>{thought.title}</h3>
                      <div className={styles.tags}>
                        {thought.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className={styles.readHint} aria-hidden>
                        Read article →
                      </span>
                    </div>
                  </article>
                </Link>
              </motion.div>
            );
          })
        ) : (
          <p className={styles.empty}>No articles match your search.</p>
        )}
      </div>

      {/* Pagination dots */}
      {filteredThoughts.length > 1 && (
        <div className={styles.dots}>
          {filteredThoughts.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ""}`}
              onClick={() => goToIndex(i)}
              aria-label={`Go to article ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

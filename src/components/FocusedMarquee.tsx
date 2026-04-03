import { useCallback, useMemo, useRef, useState } from "react";
import { CASE_STUDIES } from "../data/portfolioData";
import { ARTICLES } from "../data/articles";
import styles from "./FocusedMarquee.module.css";

interface MarqueeCard {
  id: string;
  title: string;
  imageSrc: string;
}

function buildCards(): MarqueeCard[] {
  const projects: MarqueeCard[] = CASE_STUDIES
    .filter((c) => c.thumbnail)
    .map((c) => ({ id: c.id, title: c.title, imageSrc: `/${c.thumbnail}` }));

  const articles: MarqueeCard[] = ARTICLES.map((a) => ({
    id: a.slug,
    title: a.title,
    imageSrc: a.coverSrc,
  }));

  const mixed: MarqueeCard[] = [];
  let pi = 0;
  let ai = 0;
  while (pi < projects.length || ai < articles.length) {
    if (pi < projects.length) mixed.push(projects[pi++]);
    if (ai < articles.length) mixed.push(articles[ai++]);
  }
  return mixed;
}

const ALL_CARDS = buildCards();

interface Props {
  direction: "left" | "right";
  rowIndex: number;
  onReady?: () => void;
}

export function FocusedMarquee({ direction, rowIndex, onReady }: Props) {
  const cards = useMemo(() => {
    if (rowIndex === 0) return ALL_CARDS;
    const mid = Math.floor(ALL_CARDS.length / 2);
    return [...ALL_CARDS.slice(mid), ...ALL_CARDS.slice(0, mid)];
  }, [rowIndex]);

  // Track unique image loads (only first set, duplicates share same src)
  const totalUnique = cards.length;
  const loadedCount = useRef(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const firedReady = useRef(false);

  const handleImgLoad = useCallback(() => {
    loadedCount.current += 1;
    // Each image appears twice (duplicated track), so count both
    if (loadedCount.current >= totalUnique && !firedReady.current) {
      firedReady.current = true;
      setAllLoaded(true);
      onReady?.();
    }
  }, [totalUnique, onReady]);

  const handleImgError = handleImgLoad; // count errors as "done" too

  return (
    <div
      className={styles.marqueeWrapper}
      style={{ opacity: allLoaded ? 1 : 0, transition: "opacity 0.5s ease" }}
    >
      <div
        className={`${styles.marqueeTrack} ${direction === "right" ? styles.marqueeTrackReverse : ""}`}
      >
        {cards.map((card, i) => (
          <div key={`a-${i}`} className={styles.marqueeCard}>
            <img
              src={card.imageSrc}
              alt=""
              className={styles.marqueeCardImg}
              loading="eager"
              draggable={false}
              onLoad={handleImgLoad}
              onError={handleImgError}
            />
            <span className={styles.marqueeCardTitle}>{card.title}</span>
          </div>
        ))}
        {cards.map((card, i) => (
          <div key={`b-${i}`} className={styles.marqueeCard}>
            <img
              src={card.imageSrc}
              alt=""
              className={styles.marqueeCardImg}
              loading="eager"
              draggable={false}
            />
            <span className={styles.marqueeCardTitle}>{card.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

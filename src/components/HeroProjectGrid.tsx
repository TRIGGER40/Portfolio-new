import { useState } from "react";
import { CASE_STUDIES } from "../data/portfolioData";
import type { CaseStudy } from "../data/portfolioData";
import { resolveThumbnail } from "../lib/utils";
import styles from "./HeroProjectGrid.module.css";

const CARD_ACCENTS: [string, string][] = [
  ["#6366f1", "#8b5cf6"],
  ["#4338ca", "#6366f1"],
  ["#06b6d4", "#3b82f6"],
  ["#A78BFA", "#8B5CF6"],
  ["#0ea5e9", "#06b6d4"],
  ["#f59e0b", "#ef4444"],
  ["#10b981", "#06b6d4"],
];

function ProjectCard({
  study,
  index,
}: {
  study: CaseStudy;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const [from, to] = CARD_ACCENTS[index % CARD_ACCENTS.length];
  const metric = study.metrics?.[0] || study.outcomes[0]?.slice(0, 40) || study.timeFrame;
  const showImg = study.thumbnail && !imgError;

  if (!study.link) return null;

  return (
    <a
      href={study.link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      aria-label={`View case study: ${study.title}`}
    >
      {showImg && (
        <img
          src={resolveThumbnail(study.thumbnail)}
          alt=""
          className={styles.cardImg}
          onError={() => setImgError(true)}
        />
      )}
      <div className={styles.cardInner}>
        <span className={styles.company}>{study.company}</span>
        <span className={styles.title}>{study.title}</span>
        <span className={styles.metric}>{metric}</span>
      </div>
    </a>
  );
}

export function HeroProjectGrid({ side }: { side: "left" | "right" }) {
  const all = CASE_STUDIES.filter((c) => c.link);
  const duplicated = [...all, ...all];

  return (
    <div
      className={styles.carousel}
      data-side={side}
      aria-hidden="true"
    >
      <div className={styles.track}>
        {duplicated.map((study, i) => (
          <ProjectCard
            key={`${study.id}-${i}`}
            study={study}
            index={i % all.length}
          />
        ))}
      </div>
    </div>
  );
}

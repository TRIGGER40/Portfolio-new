import { useMemo } from "react";
import { motion } from "framer-motion";
import { MENTORSHIP } from "../data/portfolioData";
import { useSearchContext } from "../context/SearchContext";
import { ShimmerImg } from "./ShimmerImg";
import styles from "./Mentorship.module.css";

const MENTORSHIP_IMAGES: Record<string, string> = {
  nid: "/images/mentorship/adobe-mentor.jpeg",
  "think-ethical": "/images/mentorship/think-ethical.png",
  "adobe-mentor": "/images/mentorship/nid.png",
};

function itemMatchesQuery(
  item: { description: string; org: string; role: string; tags: string[] },
  query: string
): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const text = `${item.role} ${item.org} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
  return text.includes(q);
}

export function Mentorship() {
  const { query } = useSearchContext();

  const filtered = useMemo(() => {
    return MENTORSHIP.filter((m) => itemMatchesQuery(m, query));
  }, [query]);

  return (
    <section className={styles.section} id="mentorship">
      <h2 className={styles.sectionTitle}>Mentorship & Leadership</h2>
      <p className={styles.subtitle}>
        Teaching, collaboration, and influence beyond individual contribution
      </p>
      <div className={styles.grid}>
        {filtered.length > 0 ? (
          filtered.map((item, i) => (
            <motion.article
              key={item.id}
              className={styles.card}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {MENTORSHIP_IMAGES[item.id] && (
                <div className={styles.imageWrapper}>
                  <ShimmerImg
                    src={MENTORSHIP_IMAGES[item.id]}
                    alt={item.org}
                    className={styles.cardImage}
                    loading="lazy"
                  />
                </div>
              )}
              <div className={styles.cardBody}>
                <div className={styles.meta}>
                  <span className={styles.role}>{item.role}</span>
                  <span className={styles.period}>{item.period}</span>
                </div>
                <h3 className={styles.org}>{item.org}</h3>
                <p className={styles.description}>{item.description}</p>
                <div className={styles.tags}>
                  {item.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))
        ) : (
          <p className={styles.empty}>No mentorship entries match your search.</p>
        )}
      </div>
    </section>
  );
}

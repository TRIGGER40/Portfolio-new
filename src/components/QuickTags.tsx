import { motion } from "framer-motion";
import { useSearchContext } from "../context/SearchContext";
import { QUICK_TAGS } from "../data/portfolioData";
import styles from "./QuickTags.module.css";

export function QuickTags() {
  const { query, setQuery } = useSearchContext();

  return (
    <div className={styles.wrapper} role="group" aria-label="Quick filter tags">
      {QUICK_TAGS.map((tag) => {
        const isActive = query.toLowerCase().includes(tag.toLowerCase());
        return (
          <motion.button
            key={tag}
            type="button"
            className={`${styles.tag} ${isActive ? styles.active : ""}`}
            onClick={() => setQuery(isActive ? "" : tag)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tag}
          </motion.button>
        );
      })}
    </div>
  );
}

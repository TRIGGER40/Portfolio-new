import { motion } from "framer-motion";
import styles from "./InsightCard.module.css";

interface InsightCardProps {
  message: string;
  matchCount?: number;
}

export function InsightCard({ message, matchCount }: InsightCardProps) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <span className={styles.icon} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </span>
      <p className={styles.message}>{message}</p>
      {matchCount !== undefined && matchCount > 0 && (
        <span className={styles.badge}>{matchCount} results</span>
      )}
    </motion.div>
  );
}

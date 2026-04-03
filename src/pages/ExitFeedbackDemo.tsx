import { Link } from "react-router-dom";
import { SessionExitFeedback } from "../components/SessionExitFeedback";
import styles from "./ExitFeedbackDemo.module.css";

/**
 * Demo route for ALMVC session exit / low-rating feedback (Figma: Feedback animation, node 417:5455).
 * Integrate `SessionExitFeedback` into the real app shell when wiring the production flow.
 */
export function ExitFeedbackDemo() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>
          ← Back to portfolio
        </Link>
        <p className={styles.note}>
          Session exit card — low rating states (Poor / Average) include problem chips, notes, and submit;
          higher ratings use a single submit action; success matches the recorded-feedback confirmation.
        </p>
      </header>
      <SessionExitFeedback
        heroImageSrc={`${import.meta.env.BASE_URL}midhun-headshot.png`}
        onRejoin={() => {}}
        onViewCourse={() => {}}
        onSubmitFeedback={() => {}}
      />
    </div>
  );
}

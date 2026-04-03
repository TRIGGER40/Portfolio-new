import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        <span className={styles.shine}>Crafted using Figma, Cursor and Claude Code</span>
      </p>
    </footer>
  );
}

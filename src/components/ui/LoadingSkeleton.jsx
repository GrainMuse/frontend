import styles from "./LoadingSkeleton.module.css";

export default function LoadingSkeleton({
  count = 3,
  variant = "cards",
  dark = false,
  label = "Loading content",
}) {
  return (
    <div
      className={`${styles.grid} ${styles[variant]} ${dark ? styles.dark : ""}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      {Array.from({ length: count }, (_, index) => (
        <div className={styles.card} key={index} aria-hidden="true">
          {variant !== "lines" && <div className={styles.media} />}
          <div className={styles.copy}>
            <span className={`${styles.line} ${styles.short}`} />
            <span className={`${styles.line} ${styles.title}`} />
            <span className={styles.line} />
            <span className={`${styles.line} ${styles.medium}`} />
          </div>
        </div>
      ))}
      <span className={styles.srOnly}>{label}…</span>
    </div>
  );
}

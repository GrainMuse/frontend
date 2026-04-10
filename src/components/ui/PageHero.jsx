import styles from './PageHero.module.css';

/**
 * PageHero — reusable inner-page hero section
 */
export default function PageHero({ eyebrow, title, subtitle, children, size = 'md' }) {
  return (
    <section className={`${styles.hero} ${styles[size]}`}>
      {/* decorative bg shapes */}
      <div className={styles.bgShape1} aria-hidden="true" />
      <div className={styles.bgShape2} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        {title && (
          <h1
            className={`display-lg ${styles.title}`}
            dangerouslySetInnerHTML={{ __html: title }}
          />
        )}
        {subtitle && <p className={`body-lg ${styles.subtitle}`}>{subtitle}</p>}
        {children}
      </div>

      {/* Bottom wave */}
      <div className={styles.wave} aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--gm-cream)" />
        </svg>
      </div>
    </section>
  );
}

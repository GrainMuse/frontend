import styles from './SectionHeader.module.css';

/**
 * SectionHeader
 * @param {string} eyebrow   - Small label above title
 * @param {string} title     - Main heading (supports <em> via dangerouslySetInnerHTML)
 * @param {string} subtitle  - Optional subtext below
 * @param {'left'|'center'} align
 * @param {boolean} light    - White text mode (for dark backgrounds)
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  light = false,
  className = '',
}) {
  return (
    <div className={`${styles.header} ${styles[align]} ${light ? styles.light : ''} ${className}`}>
      {eyebrow && (
        <p className={`section-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
      )}
      {title && (
        <h2
          className={`display-md ${styles.title}`}
          dangerouslySetInnerHTML={{ __html: title }}
        />
      )}
      {subtitle && (
        <p className={`body-lg ${styles.subtitle}`}>{subtitle}</p>
      )}
    </div>
  );
}

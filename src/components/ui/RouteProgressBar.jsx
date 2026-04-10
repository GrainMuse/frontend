import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './RouteProgressBar.module.css';

/**
 * Slim top progress bar that animates on every route change.
 * Inspired by YouTube / GitHub's NProgress pattern.
 */
export default function RouteProgressBar() {
  const { pathname } = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible]   = useState(false);
  const timerRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    // Skip animation on the very first page load
    if (firstRender.current) { firstRender.current = false; return; }

    // Clear any existing timers
    clearTimeout(timerRef.current);

    // Start: snap to 0, show bar, animate to 70%
    setProgress(0);
    setVisible(true);

    // Staggered progress simulation: fast then slow
    const t1 = setTimeout(() => setProgress(30),  60);
    const t2 = setTimeout(() => setProgress(55),  200);
    const t3 = setTimeout(() => setProgress(75),  400);

    // Complete: shoot to 100%, then fade out
    const t4 = setTimeout(() => setProgress(100), 520);
    const t5 = setTimeout(() => setVisible(false), 820);
    const t6 = setTimeout(() => setProgress(0),    900);

    timerRef.current = t6;
    return () => { [t1,t2,t3,t4,t5,t6].forEach(clearTimeout); };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className={styles.bar}
      style={{
        width:   `${progress}%`,
        opacity: visible ? 1 : 0,
      }}
      aria-hidden="true"
    >
      <div className={styles.glow} />
    </div>
  );
}

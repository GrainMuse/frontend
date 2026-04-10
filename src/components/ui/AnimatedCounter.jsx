import { useEffect, useRef, useState } from 'react';
import styles from './AnimatedCounter.module.css';

export default function AnimatedCounter({ to, suffix = '', label, light = false }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const start = performance.now();
          const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.round(ease * to));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);

  return (
    <div ref={ref} className={`${styles.counter} ${light ? styles.light : ''}`}>
      <span className={styles.number}>{count}{suffix}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

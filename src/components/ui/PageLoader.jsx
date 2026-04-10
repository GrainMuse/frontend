import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./PageLoader.module.css";

const PAGE_LABELS = {
  "/": "Home",
  "/products": "Products",
  "/about": "About",
  "/team": "Our Team",
  "/contact": "Contact",
};

export default function PageLoader() {
  const { pathname } = useLocation();

  const [phase, setPhase] = useState("enter");
  const [label, setLabel] = useState(PAGE_LABELS["/"] ?? "Loading");
  const [progress, setProgress] = useState(0);

  const firstRender = useRef(true);
  const timers = useRef([]);
  const rafRef = useRef(null);
  const startTime = useRef(null);

  function animateProgress(duration, from = 0, to = 100, onDone) {
    cancelAnimationFrame(rafRef.current);
    startTime.current = null;
    const tick = (now) => {
      if (!startTime.current) startTime.current = now;
      const elapsed = now - startTime.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onDone?.();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancelAnimationFrame(rafRef.current);
  }

  function runSequence(lbl) {
    clearTimers();
    setLabel(lbl);
    setProgress(0);
    setPhase("enter");

    timers.current.push(
      setTimeout(() => {
        setPhase("hold");
        animateProgress(700, 0, 100, () => {
          timers.current.push(
            setTimeout(() => {
              setPhase("exit");
              timers.current.push(
                setTimeout(() => {
                  setPhase("idle");
                  setProgress(0);
                }, 500),
              );
            }, 120),
          );
        });
      }, 280),
    );
  }

  useEffect(() => {
    runSequence(PAGE_LABELS[pathname] ?? "Welcome");
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    runSequence(PAGE_LABELS[pathname] ?? "···");
    return () => clearTimers();
  }, [pathname]);

  if (phase === "idle") return null;

  return (
    <div
      className={`${styles.overlay} ${styles[phase]}`}
      aria-live="polite"
      aria-label={`Loading ${label}`}
      role="status"
    >
      <div className={styles.card}>
        <div className={styles.glow} />

        <p className={styles.pageLabel}>{label}</p>

        <div className={styles.barTrack} aria-hidden="true">
          <div className={styles.barFill} style={{ width: `${progress}%` }} />
          <div className={styles.barGlow} style={{ left: `${progress}%` }} />
        </div>

        <p className={styles.tagline}>Crafted with intention</p>
      </div>

      <div className={styles.cornerTL} aria-hidden="true" />
      <div className={styles.cornerTR} aria-hidden="true" />
      <div className={styles.cornerBL} aria-hidden="true" />
      <div className={styles.cornerBR} aria-hidden="true" />
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageCurtain.module.css';

const PAGE_LABELS = {
  '/':         'Home',
  '/products': 'Products',
  '/about':    'About',
  '/contact':  'Contact',
};

/**
 * Full-screen curtain wipe that sweeps in and out on route change.
 * Reveals a page label mid-transition for a premium feel.
 */
export default function PageCurtain() {
  const { pathname } = useLocation();
  const [phase, setPhase]     = useState('idle'); // idle | in | hold | out
  const [label, setLabel]     = useState('');
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }

    const pageLabel = PAGE_LABELS[pathname] ?? '···';
    setLabel(pageLabel);

    // in → hold → out
    setPhase('in');
    const t1 = setTimeout(() => setPhase('hold'), 380);
    const t2 = setTimeout(() => setPhase('out'),  700);
    const t3 = setTimeout(() => setPhase('idle'), 1100);

    return () => { [t1, t2, t3].forEach(clearTimeout); };
  }, [pathname]);

  if (phase === 'idle') return null;

  return (
    <div className={`${styles.curtain} ${styles[phase]}`} aria-hidden="true">
      <span className={styles.label}>{label}</span>
    </div>
  );
}

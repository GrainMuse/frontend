import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <section className={styles.page}>
      <div className={`container ${styles.inner}`}>
        <Breadcrumbs
          className={styles.breadcrumbs}
          items={[{ label: 'Home', to: '/' }, { label: 'Page not found' }]}
        />
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.desc}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className={styles.actions}>
          <Link to="/" className="btn btn-primary btn-lg">
            Go to homepage <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn btn-outline btn-lg">View Products</Link>
        </div>
      </div>
    </section>
  );
}

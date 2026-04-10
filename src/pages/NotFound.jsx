import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <section className={styles.page}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.desc}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className={styles.actions}>
          <Link to="/" className="btn btn-primary btn-lg">
            Back to Home <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn btn-outline btn-lg">View Products</Link>
        </div>
      </div>
    </section>
  );
}

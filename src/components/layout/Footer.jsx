import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { COMPANY, NAV_LINKS, PRODUCTS, PRODUCT_CATEGORIES } from "../../data";
import styles from "./Footer.module.css";

const riceProducts = PRODUCTS.filter(
  (p) => p.category === PRODUCT_CATEGORIES.RICE,
);
const teaProducts = PRODUCTS.filter(
  (p) => p.category === PRODUCT_CATEGORIES.TEA,
);

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Top band */}
      <div className={styles.topBand}>
        <div className={`container ${styles.topInner}`}>
          <p className={styles.topTagline}>
            <em>Pure ingredients. Crafted with intention.</em>
          </p>
          <Link to="/contact" className="btn btn-gold">
            Start a Conversation
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className={`container ${styles.main}`}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            Grain<span>.</span>Muse
          </Link>
          <p className={styles.brandDesc}>
            A Sri Lankan craft food company making wholesome instant fried rice
            and restorative herbal teas naturally, with care.
          </p>
          <div className={styles.socials}>
            <a
              href={COMPANY.socials.instagram}
              className={styles.socialLink}
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href={COMPANY.socials.facebook}
              className={styles.socialLink}
              aria-label="Facebook"
            >
              <Facebook size={16} />
            </a>
            <a
              href={COMPANY.socials.linkedin}
              className={styles.socialLink}
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
          </div>
        </div>

        <div className={styles.col}>
          <p className={styles.colTitle}>Navigate</p>
          <ul className={styles.colLinks}>
            {NAV_LINKS.map(({ label, path }) => (
              <li key={path}>
                <Link to={path}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <p className={styles.colTitle}>Products</p>
          <ul className={styles.colLinks}>
            {[...riceProducts, ...teaProducts].map((p) => (
              <li key={p.id}>
                <Link to={`/products#${p.slug}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <p className={styles.colTitle}>Contact</p>
          <ul className={styles.contactList}>
            <li>
              <Mail size={13} />
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </li>
            <li>
              <Phone size={13} />
              <a href={`tel:${COMPANY.phone1}`}>{COMPANY.phone1}</a>
            </li>
            <li>
              <Phone size={13} />
              <a href={`tel:${COMPANY.phone2}`}>{COMPANY.phone2}</a>
            </li>
            <li>
              <MapPin size={13} />
              <span>{COMPANY.location}</span>
            </li>
          </ul>
          <p className={styles.tradeNote}>
            For wholesale & trade enquiries:
            <br />
            <a href={`mailto:${COMPANY.tradeEmail}`}>{COMPANY.tradeEmail}</a>
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`container ${styles.bottom}`}>
        <p className={styles.copy}>
          © {new Date().getFullYear()} Grain Muse. All rights reserved.
        </p>
        <p className={styles.bottomRight}>Proudly crafted in Sri Lanka 🇱🇰</p>
      </div>
    </footer>
  );
}

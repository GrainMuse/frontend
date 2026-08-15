import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useNavScroll } from "../../hooks/useNavScroll";
import { useContent } from "../../context/contentStore";
import { getHeroImage } from "../../images/imageRegistry";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const scrolled = useNavScroll(40);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { company, navLinks } = useContent();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link to="/" className={styles.logo} aria-label="Grain Muse Home">
            <LogoImage
              slug={company.logo}
              alt={company.name || "Grain Muse"}
              className={styles.logoImg}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.desktopNav} aria-label="Main navigation">
            <ul className={styles.navList}>
              {navLinks.map(({ label, path }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={path === "/"}
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.active : ""}`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA + Hamburger */}
          <div className={styles.navActions}>
            <Link
              to="/contact"
              className={`btn btn-primary btn-sm ${styles.navCta}`}
            >
              Get in Touch
            </Link>
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`${styles.mobileOverlay} ${mobileOpen ? styles.overlayOpen : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <nav
        className={`${styles.mobileMenu} ${mobileOpen ? styles.menuOpen : ""}`}
        aria-label="Mobile navigation"
      >
        <div className={styles.mobileMenuInner}>
          <p className={styles.mobileEyebrow}>Navigation</p>
          <ul className={styles.mobileNavList}>
            {navLinks.map(({ label, path }, i) => (
              <li key={path} style={{ animationDelay: `${i * 0.07}s` }}>
                <NavLink
                  to={path}
                  end={path === "/"}
                  className={({ isActive }) =>
                    `${styles.mobileNavLink} ${isActive ? styles.mobileActive : ""}`
                  }
                >
                  <span className={styles.mobileNavNum}>0{i + 1}</span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link to="/contact" className={`btn btn-gold ${styles.mobileCta}`}>
            Get in Touch
          </Link>
          <p className={styles.mobileFootNote}>hello@grainmuse.lk</p>
        </div>
      </nav>
    </>
  );
}

function LogoImage({ slug, alt, className }) {
  const imgUrl = getHeroImage(slug);
  const altText = alt || `${slug.replace(/-/g, " ")} product image`;

  return (
    <img
      src={imgUrl}
      alt={altText}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

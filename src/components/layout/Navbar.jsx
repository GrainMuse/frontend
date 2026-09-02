import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useNavScroll } from "../../hooks/useNavScroll";
import { useContent } from "../../context/contentStore";
import { getHeroImage } from "../../images/imageRegistry";
import { supabase } from "../../lib/supabase";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const scrolled = useNavScroll(40);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
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

  // Keep the account control in sync with the persisted Supabase session.
  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
      setAccountOpen(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!accountOpen) return undefined;
    function closeOnOutsideClick(event) {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setAccountOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAccountOpen(false);
  }

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
            <div className={styles.accountControl} ref={accountRef}>
              {session ? (
                <>
                  <button
                    type="button"
                    className={styles.accountTrigger}
                    onClick={() => setAccountOpen((open) => !open)}
                    aria-label="Open account menu"
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                  >
                    <img src="/avatar-placeholder.svg" alt="" />
                  </button>
                  {accountOpen && <AccountMenu session={session} onSignOut={signOut} />}
                </>
              ) : (
                <Link to="/signin" className={styles.signInLink}>Sign in</Link>
              )}
            </div>
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
          {session ? (
            <div className={styles.mobileAccountSummary}>
              <img src="/avatar-placeholder.svg" alt="" />
              <div><strong>{session.user.user_metadata?.full_name || "Your account"}</strong><span>{session.user.email}</span></div>
            </div>
          ) : (
            <Link to="/signin" className={styles.mobileSignIn}>Sign in to your account <span aria-hidden="true">↗</span></Link>
          )}
          {session && <Link to="/pathfinder-academy/account" className={styles.mobileSignIn}>My applications <span aria-hidden="true">↗</span></Link>}
          {session && <button type="button" className={styles.mobileSignOut} onClick={signOut}>Log out</button>}
          <Link to="/contact" className={`btn btn-gold ${styles.mobileCta}`}>
            Get in Touch
          </Link>
          <p className={styles.mobileFootNote}>hello@grainmuse.lk</p>
        </div>
      </nav>
    </>
  );
}

function AccountMenu({ session, onSignOut }) {
  const fullName = session.user.user_metadata?.full_name || "Your account";
  return (
    <div className={styles.accountMenu} role="menu" aria-label="Account menu">
      <div className={styles.accountDetails}>
        <p>{fullName}</p>
        <span>{session.user.email}</span>
      </div>
      <Link to="/pathfinder-academy/account" role="menuitem">My applications <span aria-hidden="true">↗</span></Link>
      <button type="button" role="menuitem" onClick={onSignOut}>Log out</button>
    </div>
  );
}

function LogoImage({ slug, alt, className }) {
  const imgUrl = getHeroImage(slug);
  const fallbackKey = slug?.split("/").pop()?.replace(/\.[^.]+$/, "");
  const altText = alt || "Grain Muse logo";

  return (
    <img
      src={imgUrl}
      alt={altText}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        const fallback = getHeroImage(fallbackKey);
        if (fallback && event.currentTarget.src !== fallback) {
          event.currentTarget.src = fallback;
        }
      }}
    />
  );
}

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Mail,
  Linkedin,
  Instagram,
  X,
  ArrowRight,
  Users,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";
import PageHero from "../components/ui/PageHero";
import { DEPT_COLORS } from "../data";
import { useContent } from "../context/contentStore";
import { getTeamImage } from "../images/imageRegistry";
import SEOHead from "../components/common/SEOHead";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ProgressiveImage from "../components/ui/ProgressiveImage";
import styles from "./Team.module.css";

export default function Team() {
  useScrollReveal([]);
  const [selected, setSelected] = useState(null);
  const { teamMembers, loading, error, reload } = useContent();

  const member = selected ? teamMembers.find((m) => m.id === selected) : null;

  return (
    <>
      <SEOHead
        title="Our Team – Meet the People Behind Grain Muse"
        description="Meet the passionate team behind Grain Muse's artisan instant fried rice and herbal teas, crafted with care in Sri Lanka."
        path="/team"
      />
      <PageHero
        eyebrow="The People Behind the Craft"
        title="Meet our<br/><em>dedicated team</em>"
        subtitle="Five passionate individuals who share one belief: that food made with intention can genuinely improve everyday lives."
        size="md"
      />

      {/* ── Team Stats ─────────────────────────────────────── */}
      <div className={styles.statsStrip}>
        <div className={`container ${styles.statsInner}`}>
          {[
            {
              icon: <Users size={18} />,
              value: teamMembers.length,
              label: "Team Members",
            },
            {
              icon: <Star size={18} />,
              value: "4+",
              label: "Years Combined Industrial Experience",
            },
            { icon: "🇱🇰", value: "100%", label: "Sri Lankan Team" },
            { icon: "✦", value: "2025", label: "Founded Together" },
          ].map((s, i) => (
            <div key={i} className={`${styles.statItem} sr sr-delay-${i + 1}`}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Team Grid ──────────────────────────────────────── */}
      <section className={`section-pad ${styles.teamSection}`}>
        <div className="container">
          <div className={styles.teamGrid}>
            {loading && (
              <LoadingSkeleton count={3} label="Loading team members" />
            )}
            {error && (
              <div role="alert">
                <p>{error}</p>
                <button type="button" className="btn btn-outline" onClick={reload}>
                  Try Again
                </button>
              </div>
            )}
            {teamMembers.map((m, i) => (
              <MemberCard
                key={m.id}
                member={m}
                index={i}
                onClick={() => setSelected(m.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Culture / Values strip ─────────────────────────── */}
      <section className={styles.cultureStrip}>
        <div className="container">
          <div className={`${styles.cultureInner} sr`}>
            <div className={styles.cultureText}>
              <p className="section-eyebrow">Our Culture</p>
              <h2
                className="display-sm"
                style={{ marginTop: "var(--space-sm)" }}
              >
                A small team with a <em>big purpose</em>
              </h2>
              <p
                className="body-sm"
                style={{ marginTop: "var(--space-md)", maxWidth: 500 }}
              >
                We are a tight-knit team united by a shared love of real food,
                honest craft, and the Sri Lankan heritage that inspired every
                product we make. We work collaboratively, eat together (of
                course), and hold ourselves to the same standards we apply to
                our ingredients.
              </p>
              <Link
                to="/contact"
                className="btn btn-primary"
                style={{ marginTop: "var(--space-xl)" }}
              >
                Join Our Journey <ArrowRight size={15} />
              </Link>
            </div>
            <div className={styles.cultureValues}>
              {[
                "Craft over convenience",
                "Honest over flashy",
                "Nourish over fill",
                "Natural always",
              ].map((v, i) => (
                <div
                  key={v}
                  className={`${styles.cultureValue} sr sr-delay-${i + 1}`}
                >
                  <span className={styles.cultureValueNum}>0{i + 1}</span>
                  <p className={styles.cultureValueText}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Member Detail Modal ────────────────────────────── */}
      {member && (
        <MemberModal member={member} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

/* ── Member Card ─────────────────────────────────────────── */
function MemberCard({ member, index, onClick }) {
  const deptColor = DEPT_COLORS[member.dept] || "var(--gm-gold)";

  return (
    <article
      className={`${styles.card} sr`}
      style={{ "--dept": deptColor, transitionDelay: `${index * 0.1}s` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`View ${member.name}'s profile`}
    >
      {/* Avatar */}
      <div className={styles.cardAvatar}>
        <TeamMemberPhoto
          path={member.imagePath || member.slug}
          fallbackSlug={member.slug}
          name={member.name}
        />
      </div>

      {/* Info */}
      <div className={styles.cardInfo}>
        <span className={styles.cardDept} style={{ color: deptColor }}>
          {member.dept}
        </span>
        <h3 className={styles.cardName}>{member.name}</h3>
        <p className={styles.cardPosition}>{member.position}</p>
        <p className={styles.cardDesc}>{member.desc.slice(0, 110)}…</p>

        {/* Contact icons */}
        <div className={styles.cardContacts}>
          <a
            href={`mailto:${member.email}`}
            className={styles.cardContact}
            onClick={(e) => e.stopPropagation()}
            aria-label="Email"
          >
            <Mail size={14} />
          </a>
          <a
            href={member.linkedin}
            className={styles.cardContact}
            onClick={(e) => e.stopPropagation()}
            aria-label="LinkedIn"
          >
            <Linkedin size={14} />
          </a>
          <a
            href={member.instagram}
            className={styles.cardContact}
            onClick={(e) => e.stopPropagation()}
            aria-label="Instagram"
          >
            <Instagram size={14} />
          </a>
        </div>
      </div>

      {/* Dept accent bar */}
      <div className={styles.cardAccent} />
    </article>
  );
}

/* ── Member Modal ────────────────────────────────────────── */
function MemberModal({ member, onClose }) {
  const deptColor = DEPT_COLORS[member.dept] || "var(--gm-gold)";

  // Close on backdrop or Escape
  const handleKey = (e) => {
    if (e.key === "Escape") onClose();
  };

  return createPortal(
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      onKeyDown={handleKey}
      role="dialog"
      aria-modal="true"
      aria-label={member.name}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className={styles.modalInner}>
          {/* Left: Avatar */}
          <div className={styles.modalLeft}>
            <div className={styles.modalAvatar}>
              {member.slug ? (
                <TeamMemberPhoto
                  path={member.imagePath || member.slug}
                  fallbackSlug={member.slug}
                  name={member.name}
                />
              ) : (
                <div className={styles.cardAvatarFallback}>
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              )}
            </div>
            <div className={styles.modalContacts}>
              <a
                href={`mailto:${member.email}`}
                className={styles.modalContactLink}
              >
                <Mail size={15} /> {member.email}
              </a>
              <a href={member.linkedin} className={styles.modalContactLink}>
                <Linkedin size={15} /> LinkedIn
              </a>
              <a href={member.instagram} className={styles.modalContactLink}>
                <Instagram size={15} /> Instagram
              </a>
            </div>
            <p className={styles.modalJoined}>
              With Grain Muse since <strong>{member.joined}</strong>
            </p>
          </div>

          {/* Right: Details */}
          <div className={styles.modalRight}>
            <span
              className={styles.modalDept}
              style={{ color: deptColor, borderColor: deptColor }}
            >
              {member.dept}
            </span>
            <h2 className={styles.modalName}>{member.name}</h2>
            <p className={styles.modalPosition}>{member.position}</p>

            <p className={styles.modalDesc}>{member.desc}</p>

            {/* Quote */}
            <blockquote className={styles.modalQuote}>
              <span className={styles.modalQuoteMark}>&ldquo;</span>
              {member.quote}
            </blockquote>

            {/* Skills */}
            <div className={styles.modalSkills}>
              <p className={styles.modalSkillsLabel}>Expertise</p>
              <div className={styles.modalSkillsList}>
                {member.skills.map((s) => (
                  <span
                    key={s}
                    className="tag"
                    style={{ borderColor: deptColor, color: deptColor }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root"),
  );
}

function TeamMemberPhoto({ path, fallbackSlug, name }) {
  const imgUrl = getTeamImage(path);
  return (
    <ProgressiveImage
      src={imgUrl}
      fallbackSrc={getTeamImage(fallbackSlug)}
      alt={`${name} — Grain Muse team`}
      style={{
        width: "100%",
        objectFit: "cover",
        objectPosition: "center top",
        display: "block",
        borderRadius: "12px",
      }}
    />
  );
}

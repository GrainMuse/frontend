import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "../components/common/SEOHead";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import PageHero from "../components/ui/PageHero";
import { useAcademyPrograms } from "../hooks/useAcademyData";
import { resolveMediaUrl } from "../services/mediaService";
import styles from "./Academy.module.css";

export default function Academy() {
  const { data: programs, loading, error, reload } = useAcademyPrograms();

  return (
    <>
      <SEOHead
        title="PATHFINDER Academy"
        description="Explore PATHFINDER Academy programs, learn from experienced resource persons, and apply for upcoming learning opportunities."
        path="/pathfinder-academy"
      />
      <PageHero
        eyebrow="Learn · Connect · Progress"
        title="Find your way with<br/><em>PATHFINDER Academy</em>"
        subtitle="Practical learning programs led by experienced professionals, created to turn knowledge into confident action."
        size="md"
      />

      <section className={`section-pad ${styles.intro}`}>
        <div className={`container ${styles.introGrid}`}>
          <div>
            <p className="section-eyebrow">The Academy</p>
            <h2 className="display-sm">Several paths. One place to grow.</h2>
          </div>
          <p className="body-lg">
            PATHFINDER Academy brings focused programs and trusted resource
            persons together in an environment built for practical learning,
            professional discovery, and meaningful progress.
          </p>
        </div>
      </section>

      <section className={`section-pad ${styles.programSection}`}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <div>
              <p className="section-eyebrow">Current opportunities</p>
              <h2 className="display-md">Academy programs</h2>
            </div>
            {programs?.length > 0 && (
              <span>
                {programs.length} program{programs.length === 1 ? "" : "s"}
              </span>
            )}
          </header>

          {loading && (
            <LoadingSkeleton count={3} label="Loading academy programs" />
          )}
          {error && (
            <div className={styles.message} role="alert">
              <p>{error}</p>
              <button className="btn btn-outline" onClick={reload}>
                Try again
              </button>
            </div>
          )}
          {!loading && !error && programs?.length === 0 && (
            <div className={styles.message}>
              <BookOpen />
              <h3>New programs are being prepared</h3>
              <p>
                Check back soon for the first PATHFINDER Academy opportunities.
              </p>
            </div>
          )}
          <div className={styles.programGrid}>
            {programs?.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProgramCard({ program }) {
  const imageUrl = resolveMediaUrl(program.heroImagePath);
  return (
    <article className={styles.programCard}>
      <div className={styles.programImage}>
        {imageUrl ? <img src={imageUrl} alt="" loading="lazy" /> : <BookOpen />}
        <span>{program.deliveryMode || "Academy program"}</span>
      </div>
      <div className={styles.programBody}>
        <p>{program.subtitle}</p>
        <h3>{program.title}</h3>
        <p className={styles.summary}>{program.summary}</p>
        <ul>
          {program.startDate && (
            <li>
              <CalendarDays /> {formatDate(program.startDate)}
            </li>
          )}
          {program.venue && (
            <li>
              <MapPin /> {program.venue}
            </li>
          )}
          <li>
            <Users /> Expert-led learning
          </li>
        </ul>
        <Link
          className={styles.cardLink}
          to={`/pathfinder-academy/programs/${program.slug}`}
        >
          Explore program <ArrowRight />
        </Link>
      </div>
    </article>
  );
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

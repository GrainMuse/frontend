import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  MapPin,
  UserRound,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "../components/common/SEOHead";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import PageHero from "../components/ui/PageHero";
import ProgressiveImage from "../components/ui/ProgressiveImage";
import {
  useAcademyPrograms,
  useAcademyResourcePersons,
} from "../hooks/useAcademyData";
import { resolveMediaUrl } from "../services/mediaService";
import styles from "./Academy.module.css";

export default function Academy() {
  const { data: programs, loading, error, reload } = useAcademyPrograms();
  const {
    data: resourcePersons,
    loading: peopleLoading,
    error: peopleError,
    reload: reloadPeople,
  } = useAcademyResourcePersons();

  return (
    <>
      <SEOHead
        title="PATHFINDER Academy"
        description="Explore PATHFINDER Academy programs, learn from experienced resource persons, and apply for upcoming learning opportunities."
        path="/pathfinder-academy"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "PATHFINDER Academy",
          url: "https://grainmuse.net/pathfinder-academy",
          description: "Practical learning programs led by experienced professionals.",
          parentOrganization: {
            "@type": "Organization",
            name: "Grain Muse",
            url: "https://grainmuse.net",
          },
        }}
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
            <div className={styles.sectionActions}>
              <Link to="/pathfinder-academy/account">My applications</Link>
              {programs?.length > 0 && (
                <span>
                  {programs.length} program{programs.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
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

      <section id="resource-persons" className={`section-pad ${styles.peopleSection}`}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <div>
              <p className="section-eyebrow">Guided by experience</p>
              <h2 className="display-md">Academy resource persons</h2>
            </div>
            {resourcePersons?.length > 0 && (
              <span className={styles.peopleCount}>
                {resourcePersons.length} profile
                {resourcePersons.length === 1 ? "" : "s"}
              </span>
            )}
          </header>

          {peopleLoading && (
            <LoadingSkeleton count={3} label="Loading academy resource persons" />
          )}
          {peopleError && (
            <div className={styles.message} role="alert">
              <p>{peopleError}</p>
              <button className="btn btn-outline" onClick={reloadPeople}>
                Try again
              </button>
            </div>
          )}
          {!peopleLoading && !peopleError && resourcePersons?.length === 0 && (
            <div className={styles.message}>
              <UserRound />
              <h3>Resource-person profiles are being prepared</h3>
              <p>Meet the PATHFINDER Academy team here soon.</p>
            </div>
          )}
          <div className={styles.peopleGrid}>
            {resourcePersons?.map((person) => (
              <ResourcePersonCard key={person.id} person={person} />
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
        {imageUrl ? (
          <ProgressiveImage src={imageUrl} alt="" />
        ) : (
          <BookOpen />
        )}
        <span className={styles.programBadge}>
          {program.deliveryMode || "Academy program"}
        </span>
      </div>
      <div className={styles.programBody}>
        <p>{program.subtitle}</p>
        <h3>{program.title}</h3>
        {/* <p className={styles.summary}>{program.summary}</p> */}
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

function ResourcePersonCard({ person }) {
  const imageUrl = resolveMediaUrl(person.imagePath);
  return (
    <article className={styles.personCard}>
      <div className={styles.personImage}>
        {imageUrl ? (
          <ProgressiveImage
            src={imageUrl}
            alt={`${person.name}, ${person.professionalTitle}`}
          />
        ) : (
          <UserRound aria-hidden="true" />
        )}
      </div>
      <div>
        <span className={styles.personRole}>Academy resource person</span>
        <h3>{person.name}</h3>
        <p>
          {person.professionalTitle}
          {person.organization ? ` · ${person.organization}` : ""}
        </p>
        {/* {person.shortBiography && <small>{person.shortBiography}</small>}
        {person.expertise?.length > 0 && (
          <div className={styles.personExpertise} aria-label="Areas of expertise">
            {person.expertise.slice(0, 3).map((item) => (
              <em key={item}>{item}</em>
            ))}
          </div>
        )} */}
        <div className={styles.personLinks}>
          <Link to={`/pathfinder-academy/resource-persons/${person.slug}`}>
            View profile <ArrowRight />
          </Link>
        </div>
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

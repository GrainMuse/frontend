import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Linkedin,
  MapPin,
  Monitor,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import SEOHead from "../components/common/SEOHead";
import ApplicantAuthForm from "../components/academy/ApplicantAuthForm";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ProgressiveImage from "../components/ui/ProgressiveImage";
import FormFieldLabel from "../components/ui/FormFieldLabel";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { useAcademyProgram } from "../hooks/useAcademyData";
import { supabase } from "../lib/supabase";
import {
  fetchMyAcademyApplication,
  submitAcademyApplication,
} from "../services/academyService";
import { resolveMediaUrl } from "../services/mediaService";
import styles from "./Academy.module.css";

export default function AcademyProgram() {
  const { programSlug } = useParams();
  const {
    data: program,
    loading,
    error,
    reload,
  } = useAcademyProgram(programSlug);

  if (loading)
    return (
      <div className={`container ${styles.pageState}`}>
        <LoadingSkeleton count={3} />
      </div>
    );
  if (error) return <PageError message={error} onRetry={reload} />;
  if (!program)
    return <PageError message="This academy program is not available." />;

  const heroUrl = resolveMediaUrl(program.heroImagePath);
  return (
    <>
      <SEOHead
        title={program.seoTitle || program.title}
        description={program.seoDescription || program.summary}
        path={`/pathfinder-academy/programs/${program.slug}`}
        image={heroUrl || undefined}
        type="article"
        structuredData={programSchema(program, heroUrl)}
      />
      <section className={styles.detailHero}>
        {heroUrl && (
          <ProgressiveImage
            src={heroUrl}
            alt=""
            eager
            frameClassName={styles.detailHeroImage}
          />
        )}
        <div className={styles.heroShade} />
        <div className={`container ${styles.detailHeroContent}`}>
          <Breadcrumbs
            inverse
            className={styles.heroBreadcrumbs}
            items={[
              { label: "Home", to: "/" },
              { label: "PATHFINDER Academy", to: "/pathfinder-academy" },
              { label: program.title },
            ]}
          />
          <p>{program.subtitle || "PATHFINDER Academy"}</p>
          <h1>{program.title}</h1>
          <span>{program.summary}</span>
        </div>
      </section>

      <section className={`section-pad ${styles.detailSection}`}>
        <div className={`container ${styles.detailGrid}`}>
          <div className={styles.story}>
            <p className="section-eyebrow">About the program</p>
            <h2 className="display-sm">A practical path forward</h2>
            {paragraphs(program.description).map((paragraph) => (
              <p className={styles.justifiedText} key={paragraph}>
                {paragraph}
              </p>
            ))}
            <ListSection title="Objectives" values={program.objectives} />
            <ListSection title="What you will gain" values={program.outcomes} />
            <Curriculum values={program.curriculum} />
            <ListSection title="Who can apply" values={program.eligibility} />
          </div>
          <aside className={styles.factCard}>
            <h2>Program information</h2>
            <Fact icon={Clock3} label="Duration" value={program.duration} />
            <Fact
              icon={Monitor}
              label="Delivery"
              value={program.deliveryMode}
            />
            <Fact icon={MapPin} label="Venue" value={program.venue} />
            <Fact
              icon={CalendarDays}
              label="Starts"
              value={formatDate(program.startDate)}
            />
            <Fact
              icon={CalendarDays}
              label="Applications close"
              value={formatDate(program.applicationDeadline)}
            />
            {program.brochureUrl && (
              <a
                className="btn btn-outline"
                href={program.brochureUrl}
                target="_blank"
                rel="noreferrer"
              >
                Download brochure <ExternalLink />
              </a>
            )}
          </aside>
        </div>
      </section>

      <ResourcePeople people={program.resourcePersons} />
      <ApplicationPanel program={program} />
    </>
  );
}

function ListSection({ title, values }) {
  if (!values?.length) return null;
  return (
    <section className={styles.contentBlock}>
      <h2>{title}</h2>
      <ul>
        {values.map((value) => (
          <li key={textValue(value)}>
            <CheckCircle2 /> {textValue(value)}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Curriculum({ values }) {
  if (!values?.length) return null;
  return (
    <section className={styles.contentBlock}>
      <h2>Program structure</h2>
      <div className={styles.curriculum}>
        {values.map((item, index) => (
          <article key={`${index}-${textValue(item)}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{typeof item === "object" ? item.title : item}</h3>
              {typeof item === "object" && item.description && (
                <p>{item.description}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResourcePeople({ people }) {
  if (!people?.length) return null;
  return (
    <section className={`section-pad ${styles.peopleSection}`}>
      <div className="container">
        <p className="section-eyebrow">Learn from experience</p>
        <h2 className="display-md">Resource persons</h2>
        <div className={styles.peopleGrid}>
          {people.map((person) => {
            const image = resolveMediaUrl(person.imagePath);
            return (
              <article key={person.id} className={styles.personCard}>
                <div className={styles.personImage}>
                  {image ? (
                    <ProgressiveImage
                      src={image}
                      alt={`${person.name}, ${person.professionalTitle}`}
                    />
                  ) : (
                    <UserRound />
                  )}
                </div>
                <div>
                  <span>{person.role}</span>
                  <h3>{person.name}</h3>
                  <p>
                    {person.professionalTitle}
                    {person.organization ? ` · ${person.organization}` : ""}
                  </p>
                  {person.sessionTopic && (
                    <strong>{person.sessionTopic}</strong>
                  )}
                  {/* <small>{person.shortBiography}</small> */}
                  <div className={styles.personLinks}>
                    <Link
                      to={`/pathfinder-academy/resource-persons/${person.slug}`}
                    >
                      View profile
                    </Link>
                    {person.linkedinUrl && (
                      <a
                        href={person.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${person.name} on LinkedIn`}
                      >
                        <Linkedin />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ApplicationPanel({ program }) {
  const [session, setSession] = useState(undefined);
  const [existing, setExisting] = useState(undefined);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    organization: "",
    background: "",
    motivation: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const deadlinePassed = program.applicationDeadline
    ? new Date(`${program.applicationDeadline}T23:59:59.999`).getTime() < Date.now()
    : false;
  const internalOpen = program.internalApplicationsEnabled && !deadlinePassed;

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return undefined;
    }
    async function sync(nextSession) {
      setSession(nextSession);
      if (!nextSession) {
        setExisting(null);
        return;
      }
      try {
        setExisting(await fetchMyAcademyApplication(program.id));
      } catch {
        setError("We could not check your existing applications.");
      }
    }
    supabase.auth.getSession().then(({ data }) => sync(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) =>
      setTimeout(() => sync(next), 0),
    );
    return () => subscription.unsubscribe();
  }, [program.id]);

  async function apply(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await submitAcademyApplication(program.id, form);
      setMessage("Your application has been submitted successfully.");
      setExisting(await fetchMyAcademyApplication(program.id));
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="apply" className={`section-pad ${styles.applySection}`}>
      <div className={`container ${styles.applyGrid}`}>
        <div>
          <p className="section-eyebrow">Take the next step</p>
          <h2 className="display-md">Apply for {program.title}</h2>
          <p>
            Signed-in applicants can use the secure internal application.
            Visitors can continue through the external form.
          </p>
          {program.externalApplicationUrl && (
            <a
              className="btn btn-outline"
              href={program.externalApplicationUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open external form <ExternalLink />
            </a>
          )}
        </div>
        <div className={styles.applicationCard} aria-live="polite" aria-busy={busy}>
          {session === undefined || (session && existing === undefined) ? (
            <p>Checking your account…</p>
          ) : session && existing ? (
            <div className={styles.existingApplication}>
              <span className={styles.statusBadge}>{existing.status}</span>
              <h3>Application already submitted</h3>
              {message && (
                <p className={styles.formSuccess} role="status">{message}</p>
              )}
              <p>
                You applied on {new Date(existing.created_at).toLocaleDateString()}.
              </p>
              <Link className="btn btn-primary" to="/pathfinder-academy/account">
                View my applications
              </Link>
            </div>
          ) : session && internalOpen ? (
            <form onSubmit={apply}>
              <h3>Internal application</h3>
              <p>
                Applying as <strong>{session.user.email}</strong>
              </p>
              <label>
                <FormFieldLabel required>Full name</FormFieldLabel>
                <input
                  required
                  minLength="2"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
              </label>
              <div className={styles.formGrid}>
                <label>
                  <FormFieldLabel>Phone</FormFieldLabel>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </label>
                <label>
                  <FormFieldLabel>Organization</FormFieldLabel>
                  <input
                    autoComplete="organization"
                    value={form.organization}
                    onChange={(e) =>
                      setForm({ ...form, organization: e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                <FormFieldLabel>
                  Professional or educational background
                </FormFieldLabel>
                <textarea
                  rows="4"
                  maxLength="2000"
                  value={form.background}
                  onChange={(e) =>
                    setForm({ ...form, background: e.target.value })
                  }
                />
              </label>
              <label>
                <FormFieldLabel required>
                  Why do you want to join?
                </FormFieldLabel>
                <textarea
                  required
                  minLength="20"
                  maxLength="4000"
                  rows="6"
                  value={form.motivation}
                  onChange={(e) =>
                    setForm({ ...form, motivation: e.target.value })
                  }
                />
              </label>
              {error && (
                <p className={styles.formError} role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className={styles.formSuccess} role="status">
                  {message}
                </p>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={busy || Boolean(message)}
              >
                {busy ? "Submitting…" : "Submit application"}
              </button>
            </form>
          ) : session ? (
            <div className={styles.existingApplication}>
              <h3>
                {deadlinePassed
                  ? "Internal applications have closed"
                  : "Internal applications are not enabled"}
              </h3>
              <p>Please use the external form if it is still available.</p>
              <Link to="/pathfinder-academy/account">View my applications</Link>
            </div>
          ) : supabase && internalOpen ? (
            <ApplicantAuthForm
              returnPath={`/pathfinder-academy/programs/${program.slug}#apply`}
            />
          ) : (
            <p>
              Internal applications are unavailable. Please use the external
              form.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Fact({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className={styles.fact}>
      <Icon />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
function PageError({ message, onRetry }) {
  return (
    <div className={`container ${styles.pageState}`}>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "PATHFINDER Academy", to: "/pathfinder-academy" },
          { label: "Program unavailable" },
        ]}
      />
      <h1>{message}</h1>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
function paragraphs(value) {
  return (value || "").split(/\n\s*\n/).filter(Boolean);
}
function textValue(value) {
  return typeof value === "string" ? value : value?.title || value?.text || "";
}
function formatDate(value) {
  if (!value) return "";
  return new Date(
    value.length === 10 ? `${value}T00:00:00` : value,
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function programSchema(program, image) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.title,
    description: program.seoDescription || program.summary,
    url: `https://grainmuse.net/pathfinder-academy/programs/${program.slug}`,
    image: image || undefined,
    provider: {
      "@type": "EducationalOrganization",
      name: "PATHFINDER Academy",
      url: "https://grainmuse.net/pathfinder-academy",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: program.deliveryMode || undefined,
      startDate: program.startDate || undefined,
      endDate: program.endDate || undefined,
      location: program.venue
        ? { "@type": "Place", name: program.venue }
        : undefined,
    },
  };
}

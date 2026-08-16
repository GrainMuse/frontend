import { useEffect, useState } from "react";
import {
  ArrowLeft,
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
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import { useAcademyProgram } from "../hooks/useAcademyData";
import { supabase } from "../lib/supabase";
import { submitAcademyApplication } from "../services/academyService";
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
      />
      <section className={styles.detailHero}>
        {heroUrl && <img src={heroUrl} alt="" />}
        <div className={styles.heroShade} />
        <div className={`container ${styles.detailHeroContent}`}>
          <Link to="/pathfinder-academy">
            <ArrowLeft /> All programs
          </Link>
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
              <p key={paragraph}>{paragraph}</p>
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
                    <img
                      src={image}
                      alt={`${person.name}, ${person.professionalTitle}`}
                      loading="lazy"
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
                  <small>{person.shortBiography}</small>
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
  const [mode, setMode] = useState("signin");
  const [auth, setAuth] = useState({ email: "", password: "", fullName: "" });
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

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => subscription.unsubscribe();
  }, []);

  async function authenticate(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: auth.email,
          password: auth.password,
          options: { data: { full_name: auth.fullName } },
        });
        if (authError) throw authError;
        if (!data.session)
          setMessage(
            "Check your email to confirm your account, then return to apply.",
          );
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: auth.email,
          password: auth.password,
        });
        if (authError) throw authError;
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setBusy(false);
    }
  }

  async function apply(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await submitAcademyApplication(program.id, form);
      setMessage("Your application has been submitted successfully.");
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
        <div className={styles.applicationCard}>
          {session === undefined ? (
            <p>Checking your account…</p>
          ) : session && program.internalApplicationsEnabled ? (
            <form onSubmit={apply}>
              <h3>Internal application</h3>
              <p>
                Applying as <strong>{session.user.email}</strong>
              </p>
              <label>
                Full name
                <input
                  required
                  minLength="2"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
              </label>
              <div className={styles.formGrid}>
                <label>
                  Phone
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </label>
                <label>
                  Organization
                  <input
                    value={form.organization}
                    onChange={(e) =>
                      setForm({ ...form, organization: e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                Professional or educational background
                <textarea
                  rows="4"
                  value={form.background}
                  onChange={(e) =>
                    setForm({ ...form, background: e.target.value })
                  }
                />
              </label>
              <label>
                Why do you want to join?
                <textarea
                  required
                  minLength="20"
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
                className="btn btn-primary"
                disabled={busy || Boolean(message)}
              >
                {busy ? "Submitting…" : "Submit application"}
              </button>
            </form>
          ) : supabase ? (
            <form onSubmit={authenticate}>
              <h3>
                {mode === "signup"
                  ? "Create an applicant account"
                  : "Applicant sign in"}
              </h3>
              {mode === "signup" && (
                <label>
                  Full name
                  <input
                    required
                    value={auth.fullName}
                    onChange={(e) =>
                      setAuth({ ...auth, fullName: e.target.value })
                    }
                  />
                </label>
              )}
              <label>
                Email
                <input
                  type="email"
                  required
                  value={auth.email}
                  onChange={(e) => setAuth({ ...auth, email: e.target.value })}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  required
                  minLength="8"
                  value={auth.password}
                  onChange={(e) =>
                    setAuth({ ...auth, password: e.target.value })
                  }
                />
              </label>
              {error && (
                <p className={styles.formError} role="alert">
                  {error}
                </p>
              )}
              {message && <p className={styles.formSuccess}>{message}</p>}
              <button className="btn btn-primary" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
              </button>
              <button
                type="button"
                className={styles.authSwitch}
                onClick={() => {
                  setMode(mode === "signup" ? "signin" : "signup");
                  setError("");
                  setMessage("");
                }}
              >
                {mode === "signup"
                  ? "Already registered? Sign in"
                  : "New applicant? Create an account"}
              </button>
            </form>
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
      <h1>{message}</h1>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry}>
          Try again
        </button>
      )}
      <Link to="/pathfinder-academy">Return to the academy</Link>
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

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import ApplicantAuthForm from "../components/academy/ApplicantAuthForm";
import SEOHead from "../components/common/SEOHead";
import FormFieldLabel from "../components/ui/FormFieldLabel";
import ProgressiveImage from "../components/ui/ProgressiveImage";
import { supabase } from "../lib/supabase";
import {
  fetchMyAcademyApplications,
  withdrawAcademyApplication,
} from "../services/academyService";
import { resolveMediaUrl } from "../services/mediaService";
import styles from "./Academy.module.css";

export default function AcademyAccount() {
  const [session, setSession] = useState(undefined);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recovery, setRecovery] = useState(false);

  const loadApplications = useCallback(async (nextSession) => {
    if (!nextSession) {
      setApplications([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setApplications(await fetchMyAcademyApplications());
    } catch {
      setError("We could not load your applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadApplications(data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(nextSession);
      setTimeout(() => loadApplications(nextSession), 0);
    });
    return () => subscription.unsubscribe();
  }, [loadApplications]);

  async function withdraw(application) {
    if (
      !confirm(
        `Withdraw your application for ${application.program?.title || "this program"}?`,
      )
    )
      return;
    try {
      await withdrawAcademyApplication(application.id);
      await loadApplications(session);
    } catch (withdrawError) {
      setError(withdrawError.message);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <>
      <SEOHead
        title="My PATHFINDER applications"
        description="Manage your PATHFINDER Academy applications."
        path="/pathfinder-academy/account"
        noIndex
      />
      <section className={`section-pad ${styles.accountSection}`}>
        <div className="container">
          <header className={styles.accountHeader}>
            <div>
              <p className="section-eyebrow">Applicant account</p>
              <h1 className="display-md">My applications</h1>
            </div>
            {session && (
              <button className="btn btn-outline" onClick={signOut}>
                <LogOut /> Sign out
              </button>
            )}
          </header>
          {session === undefined ? (
            <p>Checking your account…</p>
          ) : !session ? (
            <div className={styles.accountAuth}>
              <div>
                <h2>Sign in to manage your applications</h2>
                <p>
                  Your application history and status are private to your
                  account.
                </p>
              </div>
              <div className={styles.applicationCard}>
                {supabase ? (
                  <ApplicantAuthForm />
                ) : (
                  <p>Applicant accounts are currently unavailable.</p>
                )}
              </div>
            </div>
          ) : recovery ? (
            <div className={styles.accountAuth}>
              <div>
                <h2>Choose a new password</h2>
                <p>
                  Use at least eight characters and keep it unique to your
                  account.
                </p>
              </div>
              <div className={styles.applicationCard}>
                <RecoveryForm onComplete={() => setRecovery(false)} />
              </div>
            </div>
          ) : (
            <div>
              <p className={styles.accountIdentity}>
                Signed in as <strong>{session.user.email}</strong>
              </p>
              {error && (
                <p className={styles.formError} role="alert">
                  {error}
                </p>
              )}
              {loading ? (
                <p>Loading applications…</p>
              ) : applications.length === 0 ? (
                <div className={styles.message}>
                  <BookOpen />
                  <h2>No applications yet</h2>
                  <Link className="btn btn-primary" to="/pathfinder-academy">
                    Explore academy programs
                  </Link>
                </div>
              ) : (
                <div className={styles.applicationList}>
                  {applications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onWithdraw={withdraw}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function RecoveryForm({ onComplete }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) setError(updateError.message);
    else onComplete();
  }
  return (
    <form onSubmit={submit}>
      <h3>Reset password</h3>
      <label>
        <FormFieldLabel required>New password</FormFieldLabel>
        <input
          type="password"
          minLength="8"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

function ApplicationCard({ application, onWithdraw }) {
  const program = application.program;
  const image = resolveMediaUrl(program?.heroImagePath);
  const canWithdraw = ["submitted", "reviewing", "shortlisted"].includes(
    application.status,
  );
  return (
    <article className={styles.myApplication}>
      {image && (
        <ProgressiveImage
          src={image}
          alt=""
          frameClassName={styles.applicationImage}
        />
      )}
      <div>
        <span className={styles.statusBadge}>{application.status}</span>
        <h2>{program?.title || "PATHFINDER Academy program"}</h2>
        <p>
          <CalendarDays /> Submitted{" "}
          {new Date(application.created_at).toLocaleDateString()}
        </p>
        <div>
          {program && (
            <Link to={`/pathfinder-academy/programs/${program.slug}`}>
              View program <ArrowRight />
            </Link>
          )}
          {canWithdraw && (
            <button onClick={() => onWithdraw(application)}>
              Withdraw application
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

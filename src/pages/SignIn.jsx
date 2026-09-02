import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SEOHead from "../components/common/SEOHead";
import FormFieldLabel from "../components/ui/FormFieldLabel";
import { supabase } from "../lib/supabase";
import styles from "./SignIn.module.css";

const DEFAULT_RETURN_PATH = "/pathfinder-academy/account";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeSession, setActiveSession] = useState(null);

  const returnPath = location.state?.from || DEFAULT_RETURN_PATH;

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) {
        setActiveSession(data.session);
        setMessage(`You’re already signed in as ${data.session.user.email}.`);
      }
    });
    return () => { active = false; };
  }, [navigate, returnPath]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
  }

  async function submit(event) {
    event.preventDefault();
    if (!supabase) {
      setError("Sign in is temporarily unavailable. Please try again later.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "reset") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/pathfinder-academy/account`,
        });
        if (resetError) throw resetError;
        setMessage("If an account exists for this email, a recovery link has been sent.");
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setActiveSession(sessionData.session);
          setMessage(`You’re already signed in as ${sessionData.session.user.email}.`);
          return;
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate(returnPath, { replace: true });
      }
    } catch (authError) {
      setError(authError.message || "We could not sign you in. Please check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function continueToAccount() {
    navigate(returnPath, { replace: true });
  }

  async function useAnotherAccount() {
    if (!supabase) return;
    setBusy(true);
    setError("");
    setMessage("");
    const { error: signOutError } = await supabase.auth.signOut();
    setBusy(false);
    if (signOutError) {
      setError("We could not switch accounts. Please try again.");
      return;
    }
    setActiveSession(null);
    setEmail("");
    setPassword("");
  }

  return (
    <>
      <SEOHead title="Sign in" description="Sign in to manage your Grain Muse account and PATHFINDER Academy applications." path="/signin" noIndex />
      <section className={styles.page}>
        <div className={styles.ambientShape} aria-hidden="true" />
        <div className={styles.shell}>
          <section className={styles.intro} aria-labelledby="signin-title">
            <p className="section-eyebrow">Welcome back</p>
            <h1 id="signin-title">Make space for what matters.</h1>
            <p className={styles.introCopy}>
              Your Grain Muse account keeps your PATHFINDER Academy journey, applications, and updates together in one place.
            </p>
            <div className={styles.trustList}>
              <p><CheckCircle2 size={18} /> Track your applications</p>
              <p><ShieldCheck size={18} /> Your information stays private</p>
            </div>
          </section>

          <section className={styles.card} aria-label="Sign in form">
            <div className={styles.cardHeader}>
              <div className={styles.icon}><LockKeyhole size={19} /></div>
              <div>
                <p className={styles.cardKicker}>{mode === "reset" ? "Account recovery" : "Account access"}</p>
                <h2>{mode === "reset" ? "Recover your account" : "Sign in to Grain Muse"}</h2>
              </div>
            </div>
            <p className={styles.helper}>
              {mode === "reset" ? "Enter your email and we’ll send a secure recovery link." : "Use the email address and password connected to your account."}
            </p>
            <form onSubmit={submit} className={styles.form}>
              <label>
                <FormFieldLabel required>Email address</FormFieldLabel>
                <span className={styles.inputWrap}><Mail size={17} aria-hidden="true" /><input type="email" inputMode="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></span>
              </label>
              {mode !== "reset" && (
                <label>
                  <FormFieldLabel required>Password</FormFieldLabel>
                  <input type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
                </label>
              )}
              {error && <p className={styles.error} role="alert">{error}</p>}
              {message && <p className={styles.success} role="status"><CheckCircle2 size={17} /> {message}</p>}
              {activeSession && mode === "signin" && (
                <div className={styles.sessionActions}>
                  <button type="button" className="btn btn-primary" onClick={continueToAccount}>Continue to my account</button>
                  <button type="button" className={styles.secondaryAction} onClick={useAnotherAccount} disabled={busy}>Use another account</button>
                </div>
              )}
              <button className={`btn btn-primary ${styles.submit}`} disabled={busy}>
                {busy ? "Please wait…" : mode === "reset" ? "Send recovery link" : "Sign in"} <ArrowRight size={17} />
              </button>
            </form>
            <div className={styles.links}>
              {mode === "signin" ? <button type="button" onClick={() => changeMode("reset")}>Forgot your password?</button> : <button type="button" onClick={() => changeMode("signin")}>Back to sign in</button>}
              <span aria-hidden="true">·</span>
              <Link to="/signup">Create an account</Link>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}

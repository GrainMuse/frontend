import { useEffect, useState } from "react";
import { ChevronRight, Leaf, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import FormFieldLabel from "../../components/ui/FormFieldLabel";
import styles from "../../pages/Admin.module.css";

export function AdminLogin({ onReady }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError)
      setError("Sign-in failed. Check your credentials and try again.");
    else onReady();
    setBusy(false);
  }
  return (
    <main className={styles.login}>
      <section className={styles.loginPanel}>
        <div className={styles.brandMark}>
          <Leaf size={22} />
        </div>
        <p className={styles.eyebrow}>GRAIN MUSE OPERATIONS</p>
        <h1>Welcome back.</h1>
        <p>
          Sign in with your authorised staff account. Multi-factor
          authentication is required.
        </p>
        <form onSubmit={submit}>
          <label>
            <FormFieldLabel required>Email address</FormFieldLabel>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            <FormFieldLabel required>Password</FormFieldLabel>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          <button className={styles.primary} disabled={busy}>
            {busy ? "Signing in…" : "Sign in securely"}
            <ChevronRight size={17} />
          </button>
        </form>
        <small>
          <ShieldCheck size={15} /> Protected by row-level access controls and
          MFA
        </small>
      </section>
      <aside className={styles.loginArt}>
        <span>CONTROL CENTRE</span>
        <blockquote>“Good food begins with careful stewardship.”</blockquote>
        <div className={styles.grainOrb} />
      </aside>
    </main>
  );
}

export function AcceptInvite() {
  const navigate = useNavigate();
  const [state, setState] = useState("checking");
  const [session, setSession] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const hashError = new URLSearchParams(window.location.hash.slice(1)).get(
      "error_description",
    );
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (hashError || !data.session) {
        setError(
          hashError ? decodeURIComponent(hashError.replace(/\+/g, " ")) : "",
        );
        setState("invalid");
        return;
      }
      const { data: invitations, error: invitationError } = await supabase.rpc(
        "get_my_admin_invitation",
      );
      const invitation = Array.isArray(invitations)
        ? invitations[0] ?? null
        : invitations ?? null;
      if (invitation?.status === "accepted") {
        navigate("/admin", { replace: true });
        return;
      }
      if (invitationError || invitation?.status !== "pending") {
        await supabase.auth.signOut();
        setError("This invitation is invalid, expired, or no longer pending.");
        setState("invalid");
        return;
      }
      window.history.replaceState({}, document.title, "/admin/accept-invite");
      setSession(data.session);
      setState("ready");
    });
    return () => {
      active = false;
    };
  }, [navigate]);
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (password.length < 12) return setError("Use at least 12 characters.");
    if (
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password)
    )
      return setError("Include uppercase, lowercase, and numeric characters.");
    if (password !== confirmation)
      return setError("The passwords do not match.");
    setState("saving");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError("Your password could not be saved. Request a new invitation.");
      setState("ready");
      return;
    }
    const { data: acceptedRole, error: acceptanceError } = await supabase.rpc(
      "accept_admin_invitation",
    );
    if (acceptanceError || !acceptedRole) {
      await supabase.auth.signOut();
      setError("This invitation expired before it could be completed. Request a new invitation.");
      setState("invalid");
      return;
    }
    navigate("/admin", { replace: true });
  }
  return (
    <main className={styles.login}>
      <section className={styles.loginPanel}>
        <div className={styles.brandMark}>
          <Leaf size={22} />
        </div>
        <p className={styles.eyebrow}>SECURE STAFF ONBOARDING</p>
        <h1>Create your password.</h1>
        {state === "checking" && <p>Validating your invitation…</p>}
        {state === "invalid" && (
          <>
            <p role="alert" className={styles.error}>
              {error || "This invitation is invalid or has expired."}
            </p>
            <a className={styles.secondary} href="/admin">
              Go to sign in
            </a>
          </>
        )}
        {["ready", "saving"].includes(state) && (
          <form onSubmit={submit}>
            <p className={styles.inviteIdentity}>{session?.user.email}</p>
            <label>
              <FormFieldLabel required>New password</FormFieldLabel>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <label>
              <FormFieldLabel required>Confirm password</FormFieldLabel>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                required
              />
            </label>
            <small>
              At least 12 characters with uppercase, lowercase, and a number.
            </small>
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            <button className={styles.primary} disabled={state === "saving"}>
              {state === "saving"
                ? "Saving…"
                : "Continue to authenticator setup"}
            </button>
          </form>
        )}
      </section>
      <aside className={styles.loginArt}>
        <span>INVITATION ACCEPTED</span>
        <blockquote>One secure step, then your workspace is ready.</blockquote>
        <div className={styles.grainOrb} />
      </aside>
    </main>
  );
}

export function MfaGate({ onVerified, onSignOut }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("checking");
  const [factor, setFactor] = useState(null);
  useEffect(() => {
    let active = true;
    supabase.auth.mfa.listFactors().then(({ data, error: factorError }) => {
      if (!active) return;
      if (factorError) {
        setError("We could not check your authenticator settings.");
        setMode("error");
        return;
      }
      const verified = data?.totp?.find((item) => item.status === "verified");
      setFactor(verified ?? null);
      setMode(verified ? "challenge" : "setup");
    });
    return () => {
      active = false;
    };
  }, []);
  async function beginEnrollment() {
    setBusy(true);
    setError("");
    const { data: factors } = await supabase.auth.mfa.listFactors();
    await Promise.all(
      (factors?.all ?? [])
        .filter(
          (item) => item.factor_type === "totp" && item.status !== "verified",
        )
        .map((item) => supabase.auth.mfa.unenroll({ factorId: item.id })),
    );
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Grain Muse Admin",
    });
    if (enrollError)
      setError(enrollError.message || "Authenticator setup could not start.");
    else {
      setFactor(data);
      setMode("enrolling");
    }
    setBusy(false);
  }
  async function verify(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    if (!factor) {
      setError("Authenticator setup has not started.");
      setBusy(false);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code,
    });
    if (verifyError)
      setError("That verification code was not accepted. Try a fresh code.");
    else onVerified();
    setBusy(false);
  }
  return (
    <main className={styles.denied}>
      <ShieldCheck />
      <h1>
        {mode === "challenge" ? "Verify it’s you" : "Secure your account"}
      </h1>
      {mode === "checking" && <p>Checking authenticator settings…</p>}
      {mode === "setup" && (
        <>
          <p>
            This is your first sign-in. Connect an authenticator app before
            accessing the admin portal.
          </p>
          <button
            className={styles.primary}
            onClick={beginEnrollment}
            disabled={busy}
          >
            {busy ? "Preparing…" : "Set up authenticator"}
          </button>
        </>
      )}
      {mode === "enrolling" && factor?.totp && (
        <div className={styles.enrollment}>
          <p>Scan this QR code with your authenticator app.</p>
          <img
            src={factor.totp.qr_code}
            alt="Grain Muse authenticator QR code"
          />
          <details>
            <summary>Can’t scan the code?</summary>
            <p>Enter this setup key manually:</p>
            <code>{factor.totp.secret}</code>
          </details>
        </div>
      )}
      {["challenge", "enrolling"].includes(mode) && (
        <>
          <p>Enter the current six-digit code from your authenticator app.</p>
          <form onSubmit={verify} className={styles.mfaForm}>
            <label>
              <FormFieldLabel required>Authenticator code</FormFieldLabel>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength="6"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                required
              />
            </label>
            <button className={styles.primary} disabled={busy}>
              {busy ? "Verifying…" : "Verify code"}
            </button>
          </form>
        </>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <button className={styles.secondary} onClick={onSignOut}>
        Sign out
      </button>
    </main>
  );
}

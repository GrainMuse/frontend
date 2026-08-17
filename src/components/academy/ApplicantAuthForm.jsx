import { useState } from "react";
import { supabase } from "../../lib/supabase";
import FormFieldLabel from "../ui/FormFieldLabel";
import styles from "../../pages/Academy.module.css";

export default function ApplicantAuthForm({ returnPath = "/pathfinder-academy/account" }) {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.fullName },
            emailRedirectTo: `${window.location.origin}${returnPath}`,
          },
        });
        if (authError) throw authError;
        if (!data.session)
          setMessage("Check your email to confirm your account, then return to continue.");
      } else if (mode === "reset") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(
          form.email,
          { redirectTo: `${window.location.origin}/pathfinder-academy/account` },
        );
        if (authError) throw authError;
        setMessage("If an account exists for this email, a recovery link has been sent.");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (authError) throw authError;
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h3>
        {mode === "signup"
          ? "Create an applicant account"
          : mode === "reset"
            ? "Recover your account"
            : "Applicant sign in"}
      </h3>
      {mode === "signup" && (
        <label>
          <FormFieldLabel required>Full name</FormFieldLabel>
          <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
        </label>
      )}
      <label>
        <FormFieldLabel required>Email</FormFieldLabel>
        <input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
      </label>
      {mode !== "reset" && (
        <label>
          <FormFieldLabel required>Password</FormFieldLabel>
          <input type="password" required minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
      )}
      {error && <p className={styles.formError} role="alert">{error}</p>}
      {message && <p className={styles.formSuccess} role="status">{message}</p>}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send recovery link" : "Sign in"}
      </button>
      <div className={styles.authActions}>
        <button type="button" className={styles.authSwitch} onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); setMessage(""); }}>
          {mode === "signup" ? "Already registered? Sign in" : "New applicant? Create an account"}
        </button>
        {mode !== "reset" && (
          <button type="button" className={styles.authSwitch} onClick={() => { setMode("reset"); setError(""); setMessage(""); }}>
            Forgot password?
          </button>
        )}
        {mode === "reset" && (
          <button type="button" className={styles.authSwitch} onClick={() => { setMode("signin"); setMessage(""); }}>
            Sign in
          </button>
        )}
      </div>
    </form>
  );
}

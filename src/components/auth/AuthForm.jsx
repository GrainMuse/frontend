import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FormFieldLabel from "../ui/FormFieldLabel";
import { supabase } from "../../lib/supabase";
import styles from "./AuthForm.module.css";

const INITIAL_FORM = { fullName: "", email: "", password: "", confirmPassword: "" };

export default function AuthForm({ returnPath = "/pathfinder-academy/account" }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const passwordChecks = useMemo(() => ({
    length: form.password.length >= 8,
    number: /\d/.test(form.password),
  }), [form.password]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setMessage("");
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!supabase) {
      setError("Account creation is temporarily unavailable. Please try again later.");
      return;
    }
    if (!passwordChecks.length || !passwordChecks.number) {
      setError("Choose a password with at least 8 characters and one number.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { full_name: form.fullName.trim() },
          emailRedirectTo: `${window.location.origin}${returnPath}`,
        },
      });
      if (signUpError) throw signUpError;
      if (data.session) {
        navigate(returnPath, { replace: true });
      } else {
        setMessage("Account created. Check your email to confirm your account before signing in.");
        setForm((current) => ({ ...current, password: "", confirmPassword: "" }));
      }
    } catch (authError) {
      setError(authError.message || "We could not create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={styles.form}>
      <label>
        <FormFieldLabel required>Full name</FormFieldLabel>
        <span className={styles.inputWrap}><UserRound size={17} aria-hidden="true" /><input type="text" autoComplete="name" required maxLength={100} value={form.fullName} onChange={(event) => update("fullName", event.target.value)} /></span>
      </label>
      <label>
        <FormFieldLabel required>Email address</FormFieldLabel>
        <span className={styles.inputWrap}><Mail size={17} aria-hidden="true" /><input type="email" inputMode="email" autoComplete="email" required value={form.email} onChange={(event) => update("email", event.target.value)} /></span>
      </label>
      <label>
        <FormFieldLabel required>Password</FormFieldLabel>
        <span className={styles.inputWrap}><input type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} /><button type="button" className={styles.passwordToggle} onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
        <span className={styles.passwordHint} aria-live="polite"><span className={passwordChecks.length ? styles.valid : ""}>8+ characters</span><span className={passwordChecks.number ? styles.valid : ""}>One number</span></span>
      </label>
      <label>
        <FormFieldLabel required>Confirm password</FormFieldLabel>
        <span className={styles.inputWrap}><input type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} /><button type="button" className={styles.passwordToggle} onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}>{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
      </label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {message && <p className={styles.success} role="status"><CheckCircle2 size={17} /> {message}</p>}
      <button className={`btn btn-primary ${styles.submit}`} disabled={busy}>
        {busy ? "Creating account…" : "Create account"} <ArrowRight size={17} />
      </button>
      <p className={styles.legal}>By creating an account, you agree to receive essential account and application updates.</p>
      <p className={styles.switch}>Already have an account? <Link to="/signin">Sign in</Link></p>
    </form>
  );
}

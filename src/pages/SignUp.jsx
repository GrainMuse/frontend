import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import SEOHead from "../components/common/SEOHead";
import AuthForm from "../components/auth/AuthForm";
import styles from "./SignIn.module.css";

export default function SignUp() {
  return (
    <>
      <SEOHead title="Create an account" description="Create a Grain Muse account to manage your PATHFINDER Academy applications." path="/signup" noIndex />
      <section className={styles.page}>
        <div className={styles.ambientShape} aria-hidden="true" />
        <div className={styles.shell}>
          <section className={styles.intro} aria-labelledby="signup-title">
            <p className="section-eyebrow">Start your journey</p>
            <h1 id="signup-title">A little room to grow.</h1>
            <p className={styles.introCopy}>Create your Grain Muse account to keep your PATHFINDER Academy journey, applications, and updates together in one place.</p>
            <div className={styles.trustList}>
              <p><CheckCircle2 size={18} /> Save your application progress</p>
              <p><ShieldCheck size={18} /> Your information stays private</p>
            </div>
          </section>
          <section className={styles.card} aria-labelledby="signup-card-title">
            <div className={styles.cardHeader}>
              <div className={styles.icon}><LockKeyhole size={19} /></div>
              <div><p className={styles.cardKicker}>New account</p><h2 id="signup-card-title">Create your account</h2></div>
            </div>
            <p className={styles.helper}>Join Grain Muse and take the next step in your learning journey.</p>
            <AuthForm />
          </section>
        </div>
      </section>
    </>
  );
}

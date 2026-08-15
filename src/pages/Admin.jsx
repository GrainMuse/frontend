import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Archive,
  Boxes,
  ChevronRight,
  CircleUserRound,
  FileJson,
  Inbox,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  contentCrud,
  fetchAdminContent,
  fetchAdminMembership,
  updateEnquiryStatus,
} from "../services/contentService";
import styles from "./Admin.module.css";

const sections = [
  ["overview", "Overview", LayoutDashboard],
  ["products", "Products", Boxes],
  ["categories", "Categories", Archive],
  ["team", "Team", Users],
  ["content", "Site content", FileJson],
  ["enquiries", "Enquiries", Inbox],
  ["staff", "Staff access", UserPlus],
];
const empty = {
  products: {
    name: "",
    slug: "",
    subtitle: "",
    categoryId: "",
    desc: "",
    status: "draft",
    displayOrder: 0,
    color: "#BF9A56",
    tags: [],
  },
  categories: { name: "", slug: "", status: "draft", displayOrder: 0 },
  team: {
    name: "",
    slug: "",
    position: "",
    dept: "",
    desc: "",
    status: "draft",
    displayOrder: 0,
    skills: [],
  },
  content: { key: "", value: {}, status: "draft" },
};

function Login({ onReady }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
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
            Email address
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
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

function AcceptInvite() {
  const navigate = useNavigate();
  const [state, setState] = useState("checking");
  const [session, setSession] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const hashError = new URLSearchParams(window.location.hash.slice(1)).get(
      "error_description",
    );
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (hashError) {
        setError(decodeURIComponent(hashError.replace(/\+/g, " ")));
        setState("invalid");
        return;
      }
      if (!data.session) {
        setState("invalid");
        return;
      }
      const member = await fetchAdminMembership(data.session.user.id);
      if (!member?.active) {
        await supabase.auth.signOut();
        setError("This invitation does not grant active staff access.");
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
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (password.length < 12) {
      setError("Use at least 12 characters.");
      return;
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError("Include uppercase, lowercase, and numeric characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setState("saving");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError("Your password could not be saved. Request a new invitation.");
      setState("ready");
      return;
    }
    navigate("/admin", { replace: true });
  }

  return (
    <main className={styles.login}>
      <section className={styles.loginPanel}>
        <div className={styles.brandMark}><Leaf size={22} /></div>
        <p className={styles.eyebrow}>SECURE STAFF ONBOARDING</p>
        <h1>Create your password.</h1>
        {state === "checking" && <p>Validating your invitation…</p>}
        {state === "invalid" && (
          <>
            <p role="alert" className={styles.error}>
              {error || "This invitation is invalid or has expired."}
            </p>
            <a className={styles.secondary} href="/admin">Return to sign in</a>
          </>
        )}
        {(state === "ready" || state === "saving") && (
          <form onSubmit={submit}>
            <p className={styles.inviteIdentity}>{session?.user.email}</p>
            <label>New password<input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
            <label>Confirm password<input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></label>
            <small>At least 12 characters with uppercase, lowercase, and a number.</small>
            {error && <p role="alert" className={styles.error}>{error}</p>}
            <button className={styles.primary} disabled={state === "saving"}>
              {state === "saving" ? "Saving…" : "Continue to authenticator setup"}
            </button>
          </form>
        )}
      </section>
      <aside className={styles.loginArt}><span>INVITATION ACCEPTED</span><blockquote>One secure step, then your workspace is ready.</blockquote><div className={styles.grainOrb} /></aside>
    </main>
  );
}

function StaffInvites({ onSent }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { data: sessionData } = await supabase.auth.getSession();
    const response = await fetch("/api/admin/invitations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ email, role }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) setError(result.error || "The invitation could not be sent.");
    else {
      onSent(`Invitation sent to ${email.trim().toLowerCase()}.`);
      setEmail("");
      setRole("editor");
    }
    setBusy(false);
  }
  return (
    <section className={styles.staffPanel}>
      <div><p className={styles.eyebrow}>CONTROLLED ACCESS</p><h2>Invite a staff member</h2><p>The recipient will establish a password and authenticator before gaining access.</p></div>
      <form onSubmit={submit}>
        <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Role<select value={role} onChange={(e) => setRole(e.target.value)}><option value="editor">Editor — manage content</option><option value="admin">Administrator — content, enquiries and staff</option></select></label>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <button className={styles.primary} disabled={busy}><UserPlus size={17} />{busy ? "Sending…" : "Send secure invitation"}</button>
      </form>
    </section>
  );
}

function MfaGate({ onVerified, onSignOut }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("checking");
  const [factor, setFactor] = useState(null);

  useEffect(() => {
    let active = true;
    supabase.auth.mfa.listFactors().then(({ data, error: factorsError }) => {
      if (!active) return;
      if (factorsError) {
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
    const staleFactors = (factors?.all ?? []).filter(
      (item) => item.factor_type === "totp" && item.status !== "verified",
    );
    await Promise.all(
      staleFactors.map((item) =>
        supabase.auth.mfa.unenroll({ factorId: item.id }),
      ),
    );
    const { data: enrolled, error: enrollError } =
      await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Grain Muse Admin",
      });
    if (enrollError) {
      setError(enrollError.message || "Authenticator setup could not start.");
    } else {
      setFactor(enrolled);
      setMode("enrolling");
    }
    setBusy(false);
  }

  async function verify(e) {
    e.preventDefault();
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
      <h1>{mode === "challenge" ? "Verify it’s you" : "Secure your account"}</h1>
      {mode === "checking" && <p>Checking authenticator settings…</p>}
      {mode === "setup" && (
        <>
          <p>
            This is your first sign-in. Connect an authenticator app before
            accessing the admin portal.
          </p>
          <button className={styles.primary} onClick={beginEnrollment} disabled={busy}>
            {busy ? "Preparing…" : "Set up authenticator"}
          </button>
        </>
      )}
      {mode === "enrolling" && factor?.totp && (
        <div className={styles.enrollment}>
          <p>Scan this QR code with your authenticator app.</p>
          <img src={factor.totp.qr_code} alt="Grain Muse authenticator QR code" />
          <details>
            <summary>Can’t scan the code?</summary>
            <p>Enter this setup key manually:</p>
            <code>{factor.totp.secret}</code>
          </details>
        </div>
      )}
      {(mode === "challenge" || mode === "enrolling") && (
        <>
          <p>Enter the current six-digit code from your authenticator app.</p>
          <form onSubmit={verify} className={styles.mfaForm}>
        <input
          aria-label="Authenticator code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength="6"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          required
        />
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

function RecordForm({ type, initial, categories, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? empty[type]);
  const [error, setError] = useState("");
  const set = (key, value) => setForm((v) => ({ ...v, [key]: value }));
  async function submit(e) {
    e.preventDefault();
    try {
      let payload = { ...form };
      if (type === "content" && typeof payload.value === "string")
        payload.value = JSON.parse(payload.value);
      if (
        ["products", "team"].includes(type) &&
        payload.status === "published" &&
        !payload.publishedAt
      )
        payload.publishedAt = new Date().toISOString();
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? "Content must be valid JSON."
          : err.message,
      );
    }
  }
  return (
    <div
      className={styles.backdrop}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className={styles.drawer} onSubmit={submit}>
        <header>
          <div>
            <p className={styles.eyebrow}>
              {initial ? "EDIT RECORD" : "NEW RECORD"}
            </p>
            <h2>
              {type === "team"
                ? "Team member"
                : type.slice(0, -1) || "Site content"}
            </h2>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </button>
        </header>
        <div className={styles.formBody}>
          {type === "content" ? (
            <>
              <label>
                Content key
                <input
                  value={form.key}
                  onChange={(e) => set("key", e.target.value)}
                  pattern="[a-z0-9]+(?:_[a-z0-9]+)*"
                  required
                />
              </label>
              <label>
                JSON value
                <textarea
                  rows="14"
                  value={
                    typeof form.value === "string"
                      ? form.value
                      : JSON.stringify(form.value, null, 2)
                  }
                  onChange={(e) => set("value", e.target.value)}
                  required
                />
              </label>
            </>
          ) : (
            <>
              <div className={styles.formGrid}>
                <label>
                  Name
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                  />
                </label>
                <label>
                  Slug
                  <input
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    required
                  />
                </label>
              </div>
              {type === "products" && (
                <>
                  <label>
                    Category
                    <select
                      value={form.categoryId}
                      onChange={(e) => set("categoryId", e.target.value)}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Subtitle
                    <input
                      value={form.subtitle || ""}
                      onChange={(e) => set("subtitle", e.target.value)}
                    />
                  </label>
                </>
              )}
              {type === "team" && (
                <div className={styles.formGrid}>
                  <label>
                    Position
                    <input
                      value={form.position}
                      onChange={(e) => set("position", e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Department
                    <input
                      value={form.dept || ""}
                      onChange={(e) => set("dept", e.target.value)}
                    />
                  </label>
                </div>
              )}
              {type !== "categories" && (
                <label>
                  {type === "team" ? "Biography" : "Description"}
                  <textarea
                    rows="6"
                    value={form.desc || ""}
                    onChange={(e) => set("desc", e.target.value)}
                  />
                </label>
              )}
            </>
          )}
          <div className={styles.formGrid}>
            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option>draft</option>
                <option>published</option>
                <option>archived</option>
              </select>
            </label>
            {type !== "content" && (
              <label>
                Display order
                <input
                  type="number"
                  min="0"
                  value={form.displayOrder}
                  onChange={(e) => set("displayOrder", Number(e.target.value))}
                />
              </label>
            )}
          </div>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </div>
        <footer>
          <button type="button" className={styles.secondary} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.primary}>Save record</button>
        </footer>
      </form>
    </div>
  );
}

function AdminPortal() {
  const navigate = useNavigate();
  const [session, setSession] = useState(undefined);
  const [membership, setMembership] = useState(undefined);
  const [data, setData] = useState(null);
  const [section, setSection] = useState("overview");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [menu, setMenu] = useState(false);
  const load = useCallback(async () => {
    const {
      data: { session: s },
    } = await supabase.auth.getSession();
    setSession(s);
    if (!s) return;
    const member = await fetchAdminMembership(s.user.id);
    if (!member?.active) {
      setMembership(null);
      setData(null);
      return;
    }
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel !== "aal2") {
      setMembership({ ...member, mfa: false });
      return;
    }
    setMembership(member);
    setData(await fetchAdminContent());
  }, []);
  useEffect(() => {
    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => setTimeout(load, 0));
    return () => subscription.unsubscribe();
  }, [load]);
  const type =
    section === "categories"
      ? "categories"
      : section === "team"
        ? "team"
        : section === "content"
          ? "content"
          : "products";
  const records = useMemo(() => {
    if (!data) return [];
    const source =
      section === "content"
        ? data.siteContent
        : section === "team"
          ? data.teamMembers
          : data[section] || [];
    return source.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(query.toLowerCase()),
    );
  }, [data, section, query]);
  async function save(payload) {
    const isEdit = Boolean(modal.record);
    const api =
      type === "products"
        ? [contentCrud.createProduct, contentCrud.updateProduct]
        : type === "categories"
          ? [contentCrud.createCategory, contentCrud.updateCategory]
          : type === "team"
            ? [contentCrud.createTeamMember, contentCrud.updateTeamMember]
            : [contentCrud.createSiteContent, contentCrud.updateSiteContent];
    if (isEdit) await api[1](modal.record.id, payload);
    else await api[0](payload);
    setNotice("Record saved successfully.");
    setData(await fetchAdminContent());
  }
  async function remove(record) {
    if (
      !confirm(`Delete “${record.name || record.key}”? This cannot be undone.`)
    )
      return;
    const fn =
      type === "products"
        ? contentCrud.deleteProduct
        : type === "categories"
          ? contentCrud.deleteCategory
          : type === "team"
            ? contentCrud.deleteTeamMember
            : contentCrud.deleteSiteContent;
    await fn(record.id);
    setData(await fetchAdminContent());
    setNotice("Record deleted.");
  }
  if (!supabase) return <Navigate to="/" replace />;
  if (session === undefined)
    return <div className={styles.boot}>Securing your workspace…</div>;
  if (!session) return <Login onReady={load} />;
  if (membership?.mfa === false)
    return (
      <MfaGate
        onVerified={load}
        onSignOut={async () => {
          await supabase.auth.signOut();
          setSession(null);
        }}
      />
    );
  if (membership === undefined)
    return <div className={styles.boot}>Checking staff access…</div>;
  if (membership === null && data === null)
    return (
      <main className={styles.denied}>
        <ShieldCheck />
        <h1>Access restricted</h1>
        <p>This account is not an active Grain Muse staff member.</p>
        <button
          className={styles.secondary}
          onClick={async () => {
            await supabase.auth.signOut();
            setSession(null);
          }}
        >
          Sign out
        </button>
      </main>
    );
  if (!data) return <div className={styles.boot}>Loading control centre…</div>;
  const counts = {
    products: data.products.length,
    published: data.products.filter((x) => x.status === "published").length,
    team: data.teamMembers.length,
    enquiries: data.enquiries.filter((x) => x.status === "new").length,
  };
  return (
    <div className={styles.adminShell}>
      <aside className={`${styles.sidebar} ${menu ? styles.open : ""}`}>
        <div className={styles.brand}>
          <Leaf />
          <div>
            <strong>Grain Muse</strong>
            <span>Admin Portal</span>
          </div>
        </div>
        <nav>
          {sections
            .filter(([id]) => !["enquiries", "staff"].includes(id) || membership.role === "admin")
            .map(([id, label, Icon]) => (
              <button
                className={section === id ? styles.active : ""}
                key={id}
                onClick={() => {
                  setSection(id);
                  setMenu(false);
                }}
              >
                <Icon size={18} />
                {label}
                {id === "enquiries" && counts.enquiries > 0 && (
                  <b>{counts.enquiries}</b>
                )}
              </button>
            ))}
        </nav>
        <div className={styles.account}>
          <CircleUserRound />
          <div>
            <strong>{session.user.email}</strong>
            <span>{membership.role}</span>
          </div>
          <button
            aria-label="Sign out"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/admin");
            }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <main className={styles.workspace}>
        <header className={styles.topbar}>
          <button className={styles.mobileMenu} onClick={() => setMenu(!menu)}>
            <Menu />
          </button>
          <div>
            <p className={styles.eyebrow}>
              OPERATIONS / {section.toUpperCase()}
            </p>
            <h1>{sections.find((x) => x[0] === section)?.[1]}</h1>
          </div>
          <div className={styles.security}>
            <ShieldCheck size={17} />
            <span>MFA secured</span>
          </div>
        </header>
        {notice && (
          <button className={styles.notice} onClick={() => setNotice("")}>
            {notice}
            <X size={15} />
          </button>
        )}
        {section === "overview" ? (
          <div className={styles.dashboard}>
            <section className={styles.welcome}>
              <div>
                <p className={styles.eyebrow}>FRIDAY, 15 AUGUST</p>
                <h2>Your catalogue is looking healthy.</h2>
                <p>
                  Review incoming enquiries and keep published information
                  fresh.
                </p>
              </div>
              <div className={styles.harvest}>
                Harvest
                <br />
                with care.
              </div>
            </section>
            <section className={styles.stats}>
              {[
                ["Total products", counts.products, Boxes],
                ["Published", counts.published, ShieldCheck],
                ["Team members", counts.team, Users],
                ["New enquiries", counts.enquiries, Inbox],
              ].map(([l, v, I]) => (
                <article key={l}>
                  <I />
                  <span>{l}</span>
                  <strong>{v}</strong>
                </article>
              ))}
            </section>
            <section className={styles.recent}>
              <header>
                <h3>Recently updated products</h3>
                <button onClick={() => setSection("products")}>
                  View all <ChevronRight size={16} />
                </button>
              </header>
              {data.products.slice(0, 5).map((p) => (
                <div key={p.id}>
                  <span
                    className={styles.productDot}
                    style={{ background: p.color }}
                  />
                  <strong>{p.name}</strong>
                  <span>{p.categoryName}</span>
                  <i className={styles[p.status]}>{p.status}</i>
                </div>
              ))}
            </section>
          </div>
        ) : section === "staff" ? (
          <StaffInvites onSent={setNotice} />
        ) : (
          <section className={styles.manager}>
            <header>
              <div className={styles.search}>
                <Search size={18} />
                <input
                  aria-label="Search records"
                  placeholder={`Search ${section}…`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {section !== "enquiries" && (
                <button
                  className={styles.primary}
                  onClick={() => setModal({ record: null })}
                >
                  <Plus size={17} /> Add{" "}
                  {section === "team" ? "member" : "record"}
                </button>
              )}
            </header>
            {section === "enquiries" ? (
              <div className={styles.enquiryGrid}>
                {records.map((r) => (
              <article key={r.id} data-testid="enquiry-card">
                    <header>
                      <div>
                        <strong>{r.name}</strong>
                        <a href={`mailto:${r.email}`}>{r.email}</a>
                      </div>
                      <select
                        value={r.status}
                        onChange={async (e) => {
                          await updateEnquiryStatus(r.id, e.target.value);
                          setData(await fetchAdminContent());
                        }}
                      >
                        <option>new</option>
                        <option>in_progress</option>
                        <option>resolved</option>
                        <option>spam</option>
                      </select>
                    </header>
                    <p>{r.message}</p>
                    <footer>
                      <span>{r.enquiry_type || "General enquiry"}</span>
                      <time>{new Date(r.created_at).toLocaleDateString()}</time>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.table}>
                <div className={styles.tableHead}>
                  <span>Name / Key</span>
                  <span>Type</span>
                  <span>Status</span>
                  <span>Order</span>
                  <span>Actions</span>
                </div>
                {records.map((r) => (
              <div className={styles.tableRow} key={r.id} data-testid="record-row">
                    <strong>
                      {r.name || r.key}
                      <small>{r.slug || "Structured JSON content"}</small>
                    </strong>
                    <span>
                      {r.categoryName ||
                        r.dept ||
                        (section === "content"
                          ? Array.isArray(r.value)
                            ? "Collection"
                            : "Object"
                          : "—")}
                    </span>
                    <i className={styles[r.status]}>{r.status}</i>
                    <span>{r.displayOrder ?? "—"}</span>
                    <div>
                      <button
                        aria-label="Edit"
                        onClick={() => setModal({ record: r })}
                      >
                        <Pencil size={16} />
                      </button>
                      <button aria-label="Delete" onClick={() => remove(r)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      {modal && (
        <RecordForm
          type={type}
          initial={
            modal.record ? { ...modal.record, value: modal.record.value } : null
          }
          categories={data.categories}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

export default function Admin() {
  const location = useLocation();
  return location.pathname === "/admin/accept-invite" ? (
    <AcceptInvite />
  ) : (
    <AdminPortal />
  );
}

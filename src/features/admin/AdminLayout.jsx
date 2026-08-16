import {
  Boxes,
  ClipboardCheck,
  ChevronRight,
  CircleUserRound,
  Inbox,
  Leaf,
  GraduationCap,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { ADMIN_SECTIONS, canViewSection } from "./config";
import styles from "../../pages/Admin.module.css";

export function AdminSidebar({
  section,
  onSection,
  membership,
  session,
  counts,
  menuOpen,
  onSignOut,
}) {
  return (
    <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ""}`}>
      <div className={styles.brand}>
        <Leaf />
        <div>
          <strong>Grain Muse</strong>
          <span>Admin Portal</span>
        </div>
      </div>
      <nav>
        {ADMIN_SECTIONS.filter(([id]) =>
          canViewSection(id, membership.role),
        ).map(([id, label, Icon]) => (
          <button
            className={section === id ? styles.active : ""}
            key={id}
            onClick={() => onSection(id)}
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
        <button aria-label="Sign out" onClick={onSignOut}>
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}

export function AdminHeader({
  section,
  menuOpen,
  onMenu,
  notice,
  onDismissNotice,
}) {
  return (
    <>
      <header className={styles.topbar}>
        <button className={styles.mobileMenu} onClick={() => onMenu(!menuOpen)}>
          <Menu />
        </button>
        <div>
          <p className={styles.eyebrow}>OPERATIONS / {section.toUpperCase()}</p>
          <h1>{ADMIN_SECTIONS.find(([id]) => id === section)?.[1]}</h1>
        </div>
        <div className={styles.security}>
          <ShieldCheck size={17} />
          <span>MFA secured</span>
        </div>
      </header>
      {notice && (
        <button className={styles.notice} onClick={onDismissNotice}>
          {notice}
          <X size={15} />
        </button>
      )}
    </>
  );
}

export function AdminOverview({ data, counts, role, onViewProducts }) {
  return (
    <div className={styles.dashboard}>
      <section className={styles.welcome}>
        <div>
          <p className={styles.eyebrow}>GRAIN MUSE OPERATIONS</p>
          <h2>Your catalogue is looking healthy.</h2>
          <p>Review incoming enquiries and keep published information fresh.</p>
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
          ["Academy programs", counts.academyPrograms, GraduationCap],
          ...(role === "admin"
            ? [["Applications to review", counts.pendingApplications, ClipboardCheck]]
            : []),
        ].map(([label, value, Icon]) => (
          <article key={label}>
            <Icon />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
      <section className={styles.recent}>
        <header>
          <h3>Recently updated products</h3>
          <button onClick={onViewProducts}>
            View all <ChevronRight size={16} />
          </button>
        </header>
        {data.products.slice(0, 5).map((product) => (
          <div key={product.id}>
            <span
              className={styles.productDot}
              style={{ background: product.color }}
            />
            <strong>{product.name}</strong>
            <span>{product.categoryName}</span>
            <i className={styles[product.status]}>{product.status}</i>
          </div>
        ))}
      </section>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  contentCrud,
  updateEnquiryStatus,
} from "../../services/contentService";
import { removeSiteImage } from "../../services/mediaService";
import { AdminLogin, MfaGate } from "./AdminAuthViews";
import { RecordForm, RecordManager, StaffInvites } from "./AdminContent";
import { AdminHeader, AdminOverview, AdminSidebar } from "./AdminLayout";
import { sectionRecordType } from "./config";
import { useAdminPortal } from "./useAdminPortal";
import AdminAcademy from "./AdminAcademy";
import styles from "../../pages/Admin.module.css";

function recordsForSection(data, section) {
  if (section === "content") return data.siteContent;
  if (section === "team") return data.teamMembers;
  return data[section] ?? [];
}

export function AdminPortal() {
  const { session, membership, data, load, refreshData, signOut } =
    useAdminPortal();
  const [section, setSection] = useState("overview");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const type = sectionRecordType(section);

  const counts = useMemo(
    () =>
      data
        ? {
            products: data.products.length,
            published: data.products.filter(
              (product) => product.status === "published",
            ).length,
            team: data.teamMembers.length,
            enquiries: data.enquiries.filter(
              (enquiry) => enquiry.status === "new",
            ).length,
          }
        : null,
    [data],
  );

  function selectSection(nextSection) {
    setSection(nextSection);
    setQuery("");
    setMenuOpen(false);
  }

  async function save(payload) {
    const operations =
      type === "products"
        ? [contentCrud.createProduct, contentCrud.updateProduct]
        : type === "categories"
          ? [contentCrud.createCategory, contentCrud.updateCategory]
          : type === "team"
            ? [contentCrud.createTeamMember, contentCrud.updateTeamMember]
            : [contentCrud.createSiteContent, contentCrud.updateSiteContent];
    if (modal.record) await operations[1](modal.record.id, payload);
    else await operations[0](payload);
    await refreshData();
    setNotice("Record saved successfully.");
  }

  async function remove(record) {
    if (
      !confirm(`Delete “${record.name || record.key}”? This cannot be undone.`)
    )
      return;
    const operation =
      type === "products"
        ? contentCrud.deleteProduct
        : type === "categories"
          ? contentCrud.deleteCategory
          : type === "team"
            ? contentCrud.deleteTeamMember
            : contentCrud.deleteSiteContent;
    await operation(record.id);
    await removeSiteImage(record.imagePath).catch(() => undefined);
    await refreshData();
    setNotice("Record deleted.");
  }

  async function changeEnquiryStatus(id, status) {
    await updateEnquiryStatus(id, status);
    await refreshData();
  }

  if (!supabase) return <Navigate to="/" replace />;
  if (session === undefined)
    return <div className={styles.boot}>Securing your workspace…</div>;
  if (!session) return <AdminLogin onReady={load} />;
  if (membership?.mfa === false)
    return <MfaGate onVerified={load} onSignOut={signOut} />;
  if (membership === undefined)
    return <div className={styles.boot}>Checking staff access…</div>;
  if (membership === null)
    return (
      <main className={styles.denied}>
        <ShieldCheck />
        <h1>Access restricted</h1>
        <p>This account is not an active Grain Muse staff member.</p>
        <button className={styles.secondary} onClick={signOut}>
          Sign out
        </button>
      </main>
    );
  if (!data) return <div className={styles.boot}>Loading control centre…</div>;

  return (
    <div className={styles.adminShell}>
      <AdminSidebar
        section={section}
        onSection={selectSection}
        membership={membership}
        session={session}
        counts={counts}
        menuOpen={menuOpen}
        onSignOut={signOut}
      />
      <main className={styles.workspace}>
        <AdminHeader
          section={section}
          menuOpen={menuOpen}
          onMenu={setMenuOpen}
          notice={notice}
          onDismissNotice={() => setNotice("")}
        />
        {section === "overview" && (
          <AdminOverview
            data={data}
            counts={counts}
            onViewProducts={() => selectSection("products")}
          />
        )}
        {section === "staff" && <StaffInvites onSent={setNotice} />}
        {section === "academy" && (
          <AdminAcademy
            academy={data.academy}
            role={membership.role}
            onRefresh={refreshData}
            onNotice={setNotice}
          />
        )}
        {!["overview", "staff", "academy"].includes(section) && (
          <RecordManager
            section={section}
            records={recordsForSection(data, section)}
            query={query}
            onQuery={setQuery}
            onCreate={() => setModal({ record: null })}
            onEdit={(record) => setModal({ record })}
            onDelete={remove}
            onEnquiryStatus={changeEnquiryStatus}
          />
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

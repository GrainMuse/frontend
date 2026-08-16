import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, UserPlus, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { EMPTY_RECORDS } from "./config";
import { removeSiteImage, uploadSiteImage } from "../../services/mediaService";
import styles from "../../pages/Admin.module.css";

export function StaffInvites({ onSent }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { data } = await supabase.auth.getSession();
    const response = await fetch("/api/admin/invitations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ email, role }),
    });
    const result = await response.json().catch(() => ({}));
      if (!response.ok)
        setError(result.error || "The invitation could not be sent.");
      else {
        const recipient = email.trim().toLowerCase();
        onSent(
          result.invitation?.reissued
            ? `A fresh invitation was sent to ${recipient}. The previous link is no longer valid.`
            : `Invitation sent to ${recipient}.`,
        );
      setEmail("");
      setRole("editor");
    }
    setBusy(false);
  }
  return (
    <section className={styles.staffPanel}>
      <div>
        <p className={styles.eyebrow}>CONTROLLED ACCESS</p>
        <h2>Invite a staff member</h2>
        <p>
          The recipient will establish a password and authenticator before
          gaining access.
        </p>
      </div>
      <form onSubmit={submit}>
        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="editor">Editor</option>
            <option value="admin">
              Administrator
            </option>
          </select>
        </label>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <button className={styles.primary} disabled={busy}>
          <UserPlus size={17} />
          {busy ? "Sending…" : "Send secure invitation"}
        </button>
      </form>
    </section>
  );
}

export function RecordForm({ type, initial, categories, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? EMPTY_RECORDS[type]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return undefined;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    let uploadedPath = null;
    try {
      const payload = { ...form };
      if (type === "content" && typeof payload.value === "string")
        payload.value = JSON.parse(payload.value);
      if (
        ["products", "team"].includes(type) &&
        payload.status === "published" &&
        !payload.publishedAt
      )
        payload.publishedAt = new Date().toISOString();

      if (["products", "team"].includes(type)) {
        if (imageFile) {
          uploadedPath = await uploadSiteImage(
            imageFile,
            type === "products" ? "products" : "team",
            payload.slug,
          );
          payload.imagePath = uploadedPath;
        } else if (removeImage) {
          payload.imagePath = null;
        }
      }

      await onSave(payload);

      if (
        initial?.imagePath &&
        initial.imagePath !== payload.imagePath &&
        (uploadedPath || removeImage)
      ) {
        await removeSiteImage(initial.imagePath).catch(() => undefined);
      }
      onClose();
    } catch (submitError) {
      if (uploadedPath) await removeSiteImage(uploadedPath).catch(() => undefined);
      setError(
        submitError instanceof SyntaxError
          ? "Content must be valid JSON."
          : submitError.message,
      );
    } finally {
      setBusy(false);
    }
  }
  const title =
    type === "team"
      ? "Team member"
      : type === "content"
        ? "Site content"
        : type.slice(0, -1);
  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form className={styles.drawer} onSubmit={submit}>
        <header>
          <div>
            <p className={styles.eyebrow}>
              {initial ? "EDIT RECORD" : "NEW RECORD"}
            </p>
            <h2>{title}</h2>
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
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
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
                <>
                  <label>
                    {type === "team" ? "Biography" : "Description"}
                    <textarea
                      rows="6"
                      value={form.desc || ""}
                      onChange={(e) => set("desc", e.target.value)}
                    />
                  </label>
                  <div className={styles.mediaField}>
                    <label>
                      {type === "team" ? "Team photo" : "Product image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={(event) => {
                          setImageFile(event.target.files?.[0] ?? null);
                          setRemoveImage(false);
                        }}
                      />
                    </label>
                    {imagePreview && (
                      <img src={imagePreview} alt="Selected upload preview" />
                    )}
                    {!imagePreview && initial?.imagePath && !removeImage && (
                      <p>Current image: {initial.imagePath}</p>
                    )}
                    {(initial?.imagePath || imageFile) && !removeImage && (
                      <button
                        type="button"
                        className={styles.mediaRemove}
                        onClick={() => {
                          setImageFile(null);
                          setRemoveImage(true);
                        }}
                      >
                        Remove image
                      </button>
                    )}
                    <small>JPEG, PNG, WebP, or AVIF. Maximum 5 MB.</small>
                  </div>
                </>
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
          <button className={styles.primary} disabled={busy}>
            {busy ? "Saving and uploading…" : "Save record"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export function RecordManager({
  section,
  records,
  query,
  onQuery,
  onCreate,
  onEdit,
  onDelete,
  onEnquiryStatus,
}) {
  const filtered = useMemo(
    () =>
      records.filter((record) =>
        JSON.stringify(record).toLowerCase().includes(query.toLowerCase()),
      ),
    [records, query],
  );
  return (
    <section className={styles.manager}>
      <header>
        <div className={styles.search}>
          <Search size={18} />
          <input
            aria-label="Search records"
            placeholder={`Search ${section}…`}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </div>
        {section !== "enquiries" && (
          <button className={styles.primary} onClick={onCreate}>
            <Plus size={17} /> Add {section === "team" ? "member" : "record"}
          </button>
        )}
      </header>
      {section === "enquiries" ? (
        <div className={styles.enquiryGrid}>
          {filtered.map((record) => (
            <article key={record.id} data-testid="enquiry-card">
              <header>
                <div>
                  <strong>{record.name}</strong>
                  <a href={`mailto:${record.email}`}>{record.email}</a>
                </div>
                <select
                  value={record.status}
                  onChange={(e) => onEnquiryStatus(record.id, e.target.value)}
                >
                  <option>new</option>
                  <option>in_progress</option>
                  <option>resolved</option>
                  <option>spam</option>
                </select>
              </header>
              <p>{record.message}</p>
              <footer>
                <span>{record.enquiry_type || "General enquiry"}</span>
                <time>{new Date(record.created_at).toLocaleDateString()}</time>
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
          {filtered.map((record) => (
            <div
              className={styles.tableRow}
              key={record.id}
              data-testid="record-row"
            >
              <strong>
                {record.name || record.key}
                <small>{record.slug || "Structured JSON content"}</small>
              </strong>
              <span>
                {record.categoryName ||
                  record.dept ||
                  (section === "content"
                    ? Array.isArray(record.value)
                      ? "Collection"
                      : "Object"
                    : "—")}
              </span>
              <i className={styles[record.status]}>{record.status}</i>
              <span>{record.displayOrder ?? "—"}</span>
              <div>
                <button aria-label="Edit" onClick={() => onEdit(record)}>
                  <Pencil size={16} />
                </button>
                <button aria-label="Delete" onClick={() => onDelete(record)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

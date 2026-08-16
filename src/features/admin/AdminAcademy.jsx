import { useMemo, useState } from "react";
import { Download, Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import {
  academyCrud,
  replaceProgramAssignments,
  reviewAcademyApplication,
} from "../../services/academyService";
import { removeSiteImage, uploadSiteImage } from "../../services/mediaService";
import styles from "../../pages/Admin.module.css";

const EMPTY_PROGRAM = {
  slug: "",
  title: "",
  subtitle: "",
  summary: "",
  description: "",
  heroImagePath: null,
  objectives: [],
  outcomes: [],
  curriculum: [],
  eligibility: [],
  duration: "",
  deliveryMode: "",
  venue: "",
  startDate: "",
  endDate: "",
  applicationDeadline: "",
  internalApplicationsEnabled: true,
  externalApplicationUrl: "",
  brochureUrl: "",
  seoTitle: "",
  seoDescription: "",
  displayOrder: 0,
  status: "draft",
  publishedAt: null,
};
const EMPTY_PERSON = {
  slug: "",
  name: "",
  professionalTitle: "",
  organization: "",
  shortBiography: "",
  biography: "",
  imagePath: null,
  linkedinUrl: "",
  websiteUrl: "",
  publicEmail: "",
  expertise: [],
  displayOrder: 0,
  status: "draft",
  publishedAt: null,
};
const APPLICATION_STATUSES = [
  "submitted",
  "reviewing",
  "shortlisted",
  "accepted",
  "rejected",
  "withdrawn",
];

export default function AdminAcademy({ academy, role, onRefresh, onNotice }) {
  const [tab, setTab] = useState("programs");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [programFilter, setProgramFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const tabs = [
    ["programs", "Programs"],
    ["people", "Resource persons"],
    ...(role === "admin"
      ? [
          ["applications", "Applications"],
          ["notifications", "Email delivery"],
        ]
      : []),
  ];
  const records =
    tab === "programs"
      ? academy.programs
      : tab === "people"
        ? academy.resourcePersons
        : tab === "applications"
          ? academy.applications
          : academy.notifications;
  const filtered = useMemo(
    () =>
      records.filter((record) => {
        const matchesQuery = JSON.stringify(record)
          .toLowerCase()
          .includes(query.toLowerCase());
        if (tab !== "applications") return matchesQuery;
        return (
          matchesQuery &&
          (programFilter === "all" || record.program_id === programFilter) &&
          (statusFilter === "all" || record.status === statusFilter)
        );
      }),
    [records, query, tab, programFilter, statusFilter],
  );

  async function remove(record) {
    const label = record.title || record.name;
    if (!confirm(`Delete “${label}”? This cannot be undone.`)) return;
    if (tab === "programs") await academyCrud.deleteProgram(record.id);
    else await academyCrud.deleteResourcePerson(record.id);
    await removeSiteImage(record.heroImagePath || record.imagePath).catch(
      () => undefined,
    );
    await onRefresh();
    onNotice(`${label} was deleted.`);
  }

  async function changeApplication(id, status) {
    const review = academy.reviews.find((item) => item.application_id === id);
    await reviewAcademyApplication(id, status, review?.notes || "");
    await onRefresh();
    onNotice("Application status updated.");
  }

  return (
    <>
      <div className={styles.subnav}>
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? styles.subnavActive : ""}
            onClick={() => {
              setTab(id);
              setQuery("");
            }}
          >
            {label}
            <span>
              {id === "programs"
                ? academy.programs.length
                : id === "people"
                  ? academy.resourcePersons.length
                  : id === "applications"
                    ? academy.applications.length
                    : academy.notifications.length}
            </span>
          </button>
        ))}
      </div>
      <section className={styles.manager}>
        <header>
          <div className={styles.search}>
            <Search size={18} />
            <input
              aria-label={`Search academy ${tab}`}
              placeholder={`Search ${tab}…`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          {["programs", "people"].includes(tab) && (
            <button
              className={styles.primary}
              onClick={() =>
                setModal({
                  type: tab === "programs" ? "program" : "person",
                  record: null,
                })
              }
            >
              <Plus size={17} /> Add {tab === "programs" ? "program" : "person"}
            </button>
          )}
        </header>
        {tab === "applications" ? (
          <ApplicationList
            records={filtered}
            programs={academy.programs}
            programFilter={programFilter}
            statusFilter={statusFilter}
            onProgramFilter={setProgramFilter}
            onStatusFilter={setStatusFilter}
            onStatus={changeApplication}
            onReview={setReviewTarget}
          />
        ) : tab === "notifications" ? (
          <NotificationList records={filtered} />
        ) : (
          <AcademyTable
            records={filtered}
            type={tab}
            assignments={academy.assignments}
            onEdit={(record) =>
              setModal({
                type: tab === "programs" ? "program" : "person",
                record,
              })
            }
            onDelete={remove}
          />
        )}
      </section>
      {modal && (
        <AcademyForm
          type={modal.type}
          initial={modal.record}
          academy={academy}
          onClose={() => setModal(null)}
          onSaved={async (notice) => {
            await onRefresh();
            onNotice(notice);
            setModal(null);
          }}
        />
      )}
      {reviewTarget && (
        <ApplicationReviewDrawer
          application={reviewTarget}
          program={academy.programs.find(
            (item) => item.id === reviewTarget.program_id,
          )}
          review={academy.reviews.find(
            (item) => item.application_id === reviewTarget.id,
          )}
          history={academy.applicationHistory.filter(
            (item) => item.application_id === reviewTarget.id,
          )}
          onClose={() => setReviewTarget(null)}
          onSaved={async () => {
            await onRefresh();
            onNotice("Application review saved.");
            setReviewTarget(null);
          }}
        />
      )}
    </>
  );
}

function AcademyTable({ records, type, assignments, onEdit, onDelete }) {
  return (
    <div className={styles.table}>
      <div className={styles.tableHead}>
        <span>Name</span>
        <span>{type === "programs" ? "Delivery" : "Organization"}</span>
        <span>Status</span>
        <span>{type === "programs" ? "People" : "Programs"}</span>
        <span>Actions</span>
      </div>
      {records.map((record) => (
        <div
          className={styles.tableRow}
          data-testid="academy-record-row"
          key={record.id}
        >
          <strong>
            {record.title || record.name}
            <small>{record.slug}</small>
          </strong>
          <span>{record.deliveryMode || record.organization || "—"}</span>
          <i className={styles[record.status]}>{record.status}</i>
          <span>
            {
              assignments.filter((item) =>
                type === "programs"
                  ? item.program_id === record.id
                  : item.resource_person_id === record.id,
              ).length
            }
          </span>
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
  );
}

function ApplicationList({
  records,
  programs,
  programFilter,
  statusFilter,
  onProgramFilter,
  onStatusFilter,
  onStatus,
  onReview,
}) {
  return (
    <>
      <div className={styles.applicationTools}>
        <select
          aria-label="Filter by program"
          value={programFilter}
          onChange={(event) => onProgramFilter(event.target.value)}
        >
          <option value="all">All programs</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.title}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by application status"
          value={statusFilter}
          onChange={(event) => onStatusFilter(event.target.value)}
        >
          <option value="all">All statuses</option>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <button
          className={styles.secondary}
          disabled={!records.length}
          onClick={() => downloadApplications(records, programs)}
        >
          <Download size={16} /> Export CSV
        </button>
        <span>
          {records.length} result{records.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className={styles.enquiryGrid}>
        {records.map((record) => (
          <article key={record.id} data-testid="academy-application-card">
            <header>
              <div>
                <strong>{record.full_name}</strong>
                <a href={`mailto:${record.email}`}>{record.email}</a>
              </div>
              <select
                aria-label={`Status for ${record.full_name}`}
                value={record.status}
                onChange={(event) => onStatus(record.id, event.target.value)}
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </header>
            <p>
              <strong>
                {programs.find((program) => program.id === record.program_id)
                  ?.title || "Academy program"}
              </strong>
            </p>
            <p>{record.motivation}</p>
            <footer>
              <span>
                {record.organization || record.phone || "Direct applicant"}
              </span>
              <button
                className={styles.reviewButton}
                onClick={() => onReview(record)}
              >
                <Eye size={15} /> Review
              </button>
              <time>{new Date(record.created_at).toLocaleDateString()}</time>
            </footer>
          </article>
        ))}
      </div>
    </>
  );
}

function NotificationList({ records }) {
  return (
    <div className={styles.notificationTable}>
      <div className={styles.notificationHead}>
        <span>Event</span>
        <span>Recipient</span>
        <span>Status</span>
        <span>Attempts</span>
        <span>Last activity</span>
      </div>
      {records.map((record) => (
        <div key={record.id} data-testid="academy-notification-row">
          <strong>
            {record.event_type.replaceAll("_", " ")}
            <small>{record.last_error || record.provider_message_id || record.id}</small>
          </strong>
          <span>{record.recipient_email || "Configured academy mailbox"}</span>
          <i className={styles[record.status]}>{record.status}</i>
          <span>{record.attempts} / 5</span>
          <time>{new Date(record.sent_at || record.created_at).toLocaleString()}</time>
        </div>
      ))}
    </div>
  );
}

function ApplicationReviewDrawer({
  application,
  program,
  review,
  history,
  onClose,
  onSaved,
}) {
  const [status, setStatus] = useState(application.status);
  const [notes, setNotes] = useState(review?.notes || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await reviewAcademyApplication(application.id, status, notes);
      await onSaved();
    } catch (reviewError) {
      setError(reviewError.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        className={`${styles.drawer} ${styles.wideDrawer}`}
        onSubmit={submit}
      >
        <header>
          <div>
            <p className={styles.eyebrow}>APPLICATION REVIEW</p>
            <h2>{application.full_name}</h2>
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
          <div className={styles.reviewSummary}>
            <span>{program?.title || "Academy program"}</span>
            <a href={`mailto:${application.email}`}>{application.email}</a>
            {application.phone && (
              <a href={`tel:${application.phone}`}>{application.phone}</a>
            )}
            <time>
              Submitted {new Date(application.created_at).toLocaleString()}
            </time>
          </div>
          {application.organization && (
            <ReviewField
              label="Organization"
              value={application.organization}
            />
          )}
          <ReviewField label="Motivation" value={application.motivation} />
          {application.background && (
            <ReviewField label="Background" value={application.background} />
          )}
          <label>
            Decision status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {APPLICATION_STATUSES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Private review notes
            <textarea
              rows="8"
              maxLength="10000"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <small>Visible only to administrators.</small>
          </label>
          <section className={styles.reviewHistory}>
            <h3>Status history</h3>
            {history.length ? (
              history.map((item) => (
                <div key={item.id}>
                  <span>
                    {item.from_status || "created"} → {item.to_status}
                  </span>
                  <time>{new Date(item.created_at).toLocaleString()}</time>
                </div>
              ))
            ) : (
              <p>No status changes recorded yet.</p>
            )}
          </section>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>
        <footer>
          <button type="button" className={styles.secondary} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.primary} disabled={busy}>
            {busy ? "Saving…" : "Save review"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function ReviewField({ label, value }) {
  return (
    <section className={styles.reviewField}>
      <strong>{label}</strong>
      <p>{value}</p>
    </section>
  );
}

function downloadApplications(records, programs) {
  const headings = [
    "Applicant",
    "Email",
    "Phone",
    "Organization",
    "Program",
    "Status",
    "Submitted",
    "Background",
    "Motivation",
  ];
  const rows = records.map((record) => [
    record.full_name,
    record.email,
    record.phone,
    record.organization,
    programs.find((program) => program.id === record.program_id)?.title || "",
    record.status,
    record.created_at,
    record.background,
    record.motivation,
  ]);
  const csv = [headings, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `pathfinder-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function AcademyForm({ type, initial, academy, onClose, onSaved }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial }
      : type === "program"
        ? EMPTY_PROGRAM
        : EMPTY_PERSON,
  );
  const [selectedPeople, setSelectedPeople] = useState(() =>
    type === "program" && initial
      ? academy.assignments
          .filter((item) => item.program_id === initial.id)
          .map((item) => ({
            resourcePersonId: item.resource_person_id,
            role: item.role ?? "",
            sessionTopic: item.session_topic ?? "",
            displayOrder: item.display_order,
          }))
      : [],
  );
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const imagePath = type === "program" ? form.heroImagePath : form.imagePath;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    let uploadedPath;
    try {
      const payload = { ...form };
      if (payload.status === "published" && !payload.publishedAt)
        payload.publishedAt = new Date().toISOString();
      if (imageFile) {
        uploadedPath = await uploadSiteImage(
          imageFile,
          type === "program" ? "academy/programs" : "academy/resource-persons",
          payload.slug,
        );
        if (type === "program") payload.heroImagePath = uploadedPath;
        else payload.imagePath = uploadedPath;
      } else if (removeImage) {
        if (type === "program") payload.heroImagePath = null;
        else payload.imagePath = null;
      }
      let saved;
      if (type === "program")
        saved = initial
          ? await academyCrud.updateProgram(initial.id, payload)
          : await academyCrud.createProgram(payload);
      else
        saved = initial
          ? await academyCrud.updateResourcePerson(initial.id, payload)
          : await academyCrud.createResourcePerson(payload);
      if (type === "program")
        await replaceProgramAssignments(
          saved.id,
          selectedPeople.map((assignment, index) => ({
            ...assignment,
            displayOrder: index,
          })),
        );
      if (
        imagePath &&
        imagePath !== (payload.heroImagePath || payload.imagePath) &&
        (uploadedPath || removeImage)
      )
        await removeSiteImage(imagePath).catch(() => undefined);
      await onSaved(`${saved.title || saved.name} was saved.`);
    } catch (submitError) {
      if (uploadedPath)
        await removeSiteImage(uploadedPath).catch(() => undefined);
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        className={`${styles.drawer} ${styles.wideDrawer}`}
        onSubmit={submit}
      >
        <header>
          <div>
            <p className={styles.eyebrow}>
              {initial ? "EDIT" : "NEW"} {type}
            </p>
            <h2>
              {type === "program" ? "Academy program" : "Resource person"}
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
          {type === "program" ? (
            <ProgramFields
              form={form}
              set={set}
              people={academy.resourcePersons}
              selected={selectedPeople}
              onSelected={setSelectedPeople}
            />
          ) : (
            <PersonFields form={form} set={set} />
          )}
          <div className={styles.mediaField}>
            <label>
              {type === "program" ? "Program image" : "Profile image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(event) => {
                  setImageFile(event.target.files?.[0] ?? null);
                  setRemoveImage(false);
                }}
              />
            </label>
            {imageFile && <p>Selected: {imageFile.name}</p>}
            {imagePath && !removeImage && !imageFile && (
              <p>Current image: {imagePath}</p>
            )}
            {(imagePath || imageFile) && !removeImage && (
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
          <div className={styles.formGrid}>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) => set("status", event.target.value)}
              >
                <option>draft</option>
                <option>published</option>
                <option>archived</option>
              </select>
            </label>
            <label>
              Display order
              <input
                type="number"
                min="0"
                value={form.displayOrder}
                onChange={(event) =>
                  set("displayOrder", Number(event.target.value))
                }
              />
            </label>
          </div>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>
        <footer>
          <button type="button" className={styles.secondary} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.primary} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function ProgramFields({ form, set, people, selected, onSelected }) {
  return (
    <>
      <div className={styles.formGrid}>
        <Field
          label="Title"
          value={form.title}
          onChange={(v) => set("title", v)}
          required
        />
        <Field
          label="Slug"
          value={form.slug}
          onChange={(v) => set("slug", v)}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          required
        />
      </div>
      <Field
        label="Subtitle"
        value={form.subtitle}
        onChange={(v) => set("subtitle", v)}
      />
      <label>
        Summary
        <textarea
          rows="3"
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
        />
      </label>
      <label>
        Description
        <textarea
          rows="7"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>
      <LineList
        label="Objectives (one per line)"
        value={form.objectives}
        onChange={(v) => set("objectives", v)}
      />
      <LineList
        label="Outcomes (one per line)"
        value={form.outcomes}
        onChange={(v) => set("outcomes", v)}
      />
      <LineList
        label="Curriculum items (one per line)"
        value={form.curriculum}
        onChange={(v) => set("curriculum", v)}
      />
      <LineList
        label="Eligibility (one per line)"
        value={form.eligibility}
        onChange={(v) => set("eligibility", v)}
      />
      <div className={styles.formGrid}>
        <Field
          label="Duration"
          value={form.duration}
          onChange={(v) => set("duration", v)}
        />
        <Field
          label="Delivery mode"
          value={form.deliveryMode}
          onChange={(v) => set("deliveryMode", v)}
        />
      </div>
      <Field
        label="Venue"
        value={form.venue}
        onChange={(v) => set("venue", v)}
      />
      <div className={styles.formGrid}>
        <Field
          label="Start date"
          type="date"
          value={form.startDate}
          onChange={(v) => set("startDate", v)}
        />
        <Field
          label="End date"
          type="date"
          value={form.endDate}
          onChange={(v) => set("endDate", v)}
        />
      </div>
      <Field
        label="Application deadline"
        type="datetime-local"
        value={toLocalDateTime(form.applicationDeadline)}
        onChange={(v) =>
          set("applicationDeadline", v ? new Date(v).toISOString() : "")
        }
      />
      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          checked={form.internalApplicationsEnabled}
          onChange={(e) => set("internalApplicationsEnabled", e.target.checked)}
        />{" "}
        Enable signed-in internal applications
      </label>
      <Field
        label="External application URL"
        type="url"
        value={form.externalApplicationUrl}
        onChange={(v) => set("externalApplicationUrl", v)}
      />
      <Field
        label="Brochure URL"
        type="url"
        value={form.brochureUrl}
        onChange={(v) => set("brochureUrl", v)}
      />
      <div className={styles.formGrid}>
        <Field
          label="SEO title"
          value={form.seoTitle}
          onChange={(v) => set("seoTitle", v)}
        />
        <Field
          label="SEO description"
          value={form.seoDescription}
          onChange={(v) => set("seoDescription", v)}
        />
      </div>
      <fieldset className={styles.assignmentField}>
        <legend>Resource persons</legend>
        {people.length ? (
          people.map((person) => {
            const assignment = selected.find(
              (item) => item.resourcePersonId === person.id,
            );
            return (
              <div className={styles.assignmentItem} key={person.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(assignment)}
                    onChange={(event) =>
                      onSelected(
                        event.target.checked
                          ? [
                              ...selected,
                              {
                                resourcePersonId: person.id,
                                role: "",
                                sessionTopic: "",
                              },
                            ]
                          : selected.filter(
                              (item) => item.resourcePersonId !== person.id,
                            ),
                      )
                    }
                  />
                  <span>
                    <strong>{person.name}</strong>
                    <small>{person.professionalTitle}</small>
                  </span>
                </label>
                {assignment && (
                  <div className={styles.assignmentDetails}>
                    <Field
                      label="Program role"
                      value={assignment.role}
                      onChange={(value) =>
                        onSelected(
                          selected.map((item) =>
                            item.resourcePersonId === person.id
                              ? { ...item, role: value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Field
                      label="Session topic"
                      value={assignment.sessionTopic}
                      onChange={(value) =>
                        onSelected(
                          selected.map((item) =>
                            item.resourcePersonId === person.id
                              ? { ...item, sessionTopic: value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>Create resource-person profiles before assigning them.</p>
        )}
      </fieldset>
    </>
  );
}

function PersonFields({ form, set }) {
  return (
    <>
      <div className={styles.formGrid}>
        <Field
          label="Name"
          value={form.name}
          onChange={(v) => set("name", v)}
          required
        />
        <Field
          label="Slug"
          value={form.slug}
          onChange={(v) => set("slug", v)}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          required
        />
      </div>
      <Field
        label="Professional title"
        value={form.professionalTitle}
        onChange={(v) => set("professionalTitle", v)}
        required
      />
      <Field
        label="Organization"
        value={form.organization}
        onChange={(v) => set("organization", v)}
      />
      <label>
        Short biography
        <textarea
          rows="4"
          value={form.shortBiography}
          onChange={(e) => set("shortBiography", e.target.value)}
        />
      </label>
      <label>
        Full biography
        <textarea
          rows="8"
          value={form.biography}
          onChange={(e) => set("biography", e.target.value)}
        />
      </label>
      <LineList
        label="Expertise (one per line)"
        value={form.expertise}
        onChange={(v) => set("expertise", v)}
      />
      <div className={styles.formGrid}>
        <Field
          label="LinkedIn URL"
          type="url"
          value={form.linkedinUrl}
          onChange={(v) => set("linkedinUrl", v)}
        />
        <Field
          label="Website URL"
          type="url"
          value={form.websiteUrl}
          onChange={(v) => set("websiteUrl", v)}
        />
      </div>
      <Field
        label="Public email (only with consent)"
        type="email"
        value={form.publicEmail}
        onChange={(v) => set("publicEmail", v)}
      />
    </>
  );
}
function Field({ label, value, onChange, ...props }) {
  return (
    <label>
      {label}
      <input
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  );
}
function LineList({ label, value, onChange }) {
  return (
    <label>
      {label}
      <textarea
        rows="5"
        value={(value || []).join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
          )
        }
      />
    </label>
  );
}
function toLocalDateTime(value) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

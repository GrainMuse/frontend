import { requireSupabase } from "../lib/supabase";

const PROGRAM_FIELDS = [
  "id", "slug", "title", "subtitle", "summary", "description",
  "hero_image_path", "objectives", "outcomes", "curriculum", "eligibility",
  "duration_text", "delivery_mode", "venue", "start_date", "end_date",
  "application_deadline", "internal_applications_enabled",
  "external_application_url", "brochure_url", "seo_title", "seo_description",
  "display_order", "status", "published_at",
].join(", ");

const PERSON_FIELDS = [
  "id", "slug", "name", "professional_title", "organization",
  "short_biography", "biography", "image_path", "linkedin_url",
  "website_url", "public_email", "expertise", "display_order", "status",
  "published_at",
].join(", ");

const ASSIGNMENT_FIELDS =
  "program_id, resource_person_id, role, session_topic, display_order";
const APPLICATION_FIELDS = [
  "id", "program_id", "user_id", "full_name", "email", "phone",
  "organization", "background", "motivation", "status", "created_at",
  "updated_at",
].join(", ");

function compact(record) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  );
}

function throwQueryError(error, operation) {
  if (error) throw new Error(`Supabase ${operation} failed: ${error.message}`);
}

function mapProgram(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? "",
    summary: row.summary ?? "",
    description: row.description ?? "",
    heroImagePath: row.hero_image_path,
    objectives: row.objectives ?? [],
    outcomes: row.outcomes ?? [],
    curriculum: row.curriculum ?? [],
    eligibility: row.eligibility ?? [],
    duration: row.duration_text ?? "",
    deliveryMode: row.delivery_mode ?? "",
    venue: row.venue ?? "",
    startDate: row.start_date ?? "",
    endDate: row.end_date ?? "",
    applicationDeadline: row.application_deadline ?? "",
    internalApplicationsEnabled: row.internal_applications_enabled,
    externalApplicationUrl: row.external_application_url ?? "",
    brochureUrl: row.brochure_url ?? "",
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    displayOrder: row.display_order,
    status: row.status,
    publishedAt: row.published_at,
  };
}

function mapPerson(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    professionalTitle: row.professional_title,
    organization: row.organization ?? "",
    shortBiography: row.short_biography ?? "",
    biography: row.biography ?? "",
    imagePath: row.image_path,
    linkedinUrl: row.linkedin_url ?? "",
    websiteUrl: row.website_url ?? "",
    publicEmail: row.public_email ?? "",
    expertise: row.expertise ?? [],
    displayOrder: row.display_order,
    status: row.status,
    publishedAt: row.published_at,
  };
}

function programWrite(input) {
  return compact({
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle || null,
    summary: input.summary || null,
    description: input.description || null,
    hero_image_path: input.heroImagePath ?? undefined,
    objectives: input.objectives,
    outcomes: input.outcomes,
    curriculum: input.curriculum,
    eligibility: input.eligibility,
    duration_text: input.duration || null,
    delivery_mode: input.deliveryMode || null,
    venue: input.venue || null,
    start_date: input.startDate || null,
    end_date: input.endDate || null,
    application_deadline: input.applicationDeadline || null,
    internal_applications_enabled: input.internalApplicationsEnabled,
    external_application_url: input.externalApplicationUrl || null,
    brochure_url: input.brochureUrl || null,
    seo_title: input.seoTitle || null,
    seo_description: input.seoDescription || null,
    display_order: input.displayOrder,
    status: input.status,
    published_at: input.publishedAt,
  });
}

function personWrite(input) {
  return compact({
    slug: input.slug,
    name: input.name,
    professional_title: input.professionalTitle,
    organization: input.organization || null,
    short_biography: input.shortBiography || null,
    biography: input.biography || null,
    image_path: input.imagePath ?? undefined,
    linkedin_url: input.linkedinUrl || null,
    website_url: input.websiteUrl || null,
    public_email: input.publicEmail || null,
    expertise: input.expertise,
    display_order: input.displayOrder,
    status: input.status,
    published_at: input.publishedAt,
  });
}

async function createRow(table, values, fields, mapper) {
  const { data, error } = await requireSupabase()
    .from(table).insert(values).select(fields).single();
  throwQueryError(error, `${table} create`);
  return mapper(data);
}

async function updateRow(table, id, values, fields, mapper) {
  const { data, error } = await requireSupabase()
    .from(table).update(values).eq("id", id).select(fields).single();
  throwQueryError(error, `${table} update`);
  return mapper(data);
}

async function deleteRow(table, id) {
  const { error } = await requireSupabase().from(table).delete().eq("id", id);
  throwQueryError(error, `${table} delete`);
}

export async function fetchPublishedPrograms() {
  const { data, error } = await requireSupabase()
    .from("academy_programs")
    .select(PROGRAM_FIELDS)
    .eq("status", "published")
    .order("display_order")
    .order("start_date", { nullsFirst: false });
  throwQueryError(error, "academy program read");
  return (data ?? []).map(mapProgram);
}

export async function fetchPublishedProgram(slug) {
  const client = requireSupabase();
  const programResult = await client
    .from("academy_programs")
    .select(PROGRAM_FIELDS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  throwQueryError(programResult.error, "academy program read");
  if (!programResult.data) return null;

  const assignmentResult = await client
    .from("academy_program_resource_persons")
    .select(`${ASSIGNMENT_FIELDS}, academy_resource_persons(${PERSON_FIELDS})`)
    .eq("program_id", programResult.data.id)
    .order("display_order");
  throwQueryError(assignmentResult.error, "academy resource-person read");

  return {
    ...mapProgram(programResult.data),
    resourcePersons: (assignmentResult.data ?? []).map((assignment) => ({
      ...mapPerson(assignment.academy_resource_persons),
      role: assignment.role ?? "Resource person",
      sessionTopic: assignment.session_topic ?? "",
      assignmentOrder: assignment.display_order,
    })),
  };
}

export async function fetchPublishedResourcePerson(slug) {
  const { data, error } = await requireSupabase()
    .from("academy_resource_persons")
    .select(PERSON_FIELDS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  throwQueryError(error, "academy resource-person read");
  return data ? mapPerson(data) : null;
}

export async function fetchAdminAcademy() {
  const client = requireSupabase();
  const [programs, people, assignments, applications] = await Promise.all([
    client.from("academy_programs").select(PROGRAM_FIELDS).order("display_order"),
    client.from("academy_resource_persons").select(PERSON_FIELDS).order("display_order"),
    client.from("academy_program_resource_persons").select(ASSIGNMENT_FIELDS).order("display_order"),
    client.from("academy_applications").select(APPLICATION_FIELDS).order("created_at", { ascending: false }),
  ]);
  [programs, people, assignments].forEach((result) =>
    throwQueryError(result.error, "academy admin read"),
  );
  if (applications.error && applications.error.code !== "42501")
    throwQueryError(applications.error, "academy application read");
  return {
    programs: (programs.data ?? []).map(mapProgram),
    resourcePersons: (people.data ?? []).map(mapPerson),
    assignments: assignments.data ?? [],
    applications: applications.data ?? [],
  };
}

export const academyCrud = Object.freeze({
  createProgram: (input) =>
    createRow("academy_programs", programWrite(input), PROGRAM_FIELDS, mapProgram),
  updateProgram: (id, input) =>
    updateRow("academy_programs", id, programWrite(input), PROGRAM_FIELDS, mapProgram),
  deleteProgram: (id) => deleteRow("academy_programs", id),
  createResourcePerson: (input) =>
    createRow("academy_resource_persons", personWrite(input), PERSON_FIELDS, mapPerson),
  updateResourcePerson: (id, input) =>
    updateRow("academy_resource_persons", id, personWrite(input), PERSON_FIELDS, mapPerson),
  deleteResourcePerson: (id) => deleteRow("academy_resource_persons", id),
});

export async function replaceProgramAssignments(programId, assignments) {
  const client = requireSupabase();
  const { data: existing, error: readError } = await client
    .from("academy_program_resource_persons")
    .select("resource_person_id")
    .eq("program_id", programId);
  throwQueryError(readError, "academy assignment read");

  const nextIds = new Set(assignments.map((item) => item.resourcePersonId));
  const removeIds = (existing ?? [])
    .map((item) => item.resource_person_id)
    .filter((id) => !nextIds.has(id));
  if (removeIds.length) {
    const { error } = await client
      .from("academy_program_resource_persons")
      .delete()
      .eq("program_id", programId)
      .in("resource_person_id", removeIds);
    throwQueryError(error, "academy assignment delete");
  }
  if (assignments.length) {
    const { error } = await client
      .from("academy_program_resource_persons")
      .upsert(
        assignments.map((item, index) => ({
          program_id: programId,
          resource_person_id: item.resourcePersonId,
          role: item.role || null,
          session_topic: item.sessionTopic || null,
          display_order: item.displayOrder ?? index,
        })),
        { onConflict: "program_id,resource_person_id" },
      );
    throwQueryError(error, "academy assignment save");
  }
}

export async function submitAcademyApplication(programId, input) {
  const client = requireSupabase();
  const { data: authData } = await client.auth.getUser();
  if (!authData.user) throw new Error("Sign in before submitting an application.");
  const { data, error } = await client
    .from("academy_applications")
    .insert({
      program_id: programId,
      user_id: authData.user.id,
      full_name: input.fullName,
      email: authData.user.email,
      phone: input.phone || null,
      organization: input.organization || null,
      background: input.background || null,
      motivation: input.motivation,
    })
    .select(APPLICATION_FIELDS)
    .single();
  throwQueryError(error, "academy application submission");
  return data;
}

export async function fetchMyAcademyApplications() {
  const client = requireSupabase();
  const { data: authData } = await client.auth.getUser();
  if (!authData.user) return [];
  const { data, error } = await client
    .from("academy_applications")
    .select(`${APPLICATION_FIELDS}, academy_programs(id, slug, title, subtitle, hero_image_path, start_date, status)`)
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });
  throwQueryError(error, "applicant application read");
  return (data ?? []).map((application) => ({
    ...application,
    program: application.academy_programs
      ? mapProgram({
        ...application.academy_programs,
        objectives: [], outcomes: [], curriculum: [], eligibility: [],
        display_order: 0,
      })
      : null,
  }));
}

export async function fetchMyAcademyApplication(programId) {
  const applications = await fetchMyAcademyApplications();
  return applications.find((application) => application.program_id === programId) ?? null;
}

export async function withdrawAcademyApplication(id) {
  const { data, error } = await requireSupabase()
    .from("academy_applications")
    .update({ status: "withdrawn" })
    .eq("id", id)
    .select("id, status, updated_at")
    .single();
  throwQueryError(error, "academy application withdrawal");
  return data;
}

export async function updateAcademyApplicationStatus(id, status) {
  const { data, error } = await requireSupabase()
    .from("academy_applications")
    .update({ status })
    .eq("id", id)
    .select("id, status, updated_at")
    .single();
  throwQueryError(error, "academy application status update");
  return data;
}

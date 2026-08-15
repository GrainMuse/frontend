import { requireSupabase } from "../lib/supabase";

const CATEGORY_FIELDS = "id, slug, name, display_order, status";
const PRODUCT_FIELDS = [
  "id",
  "category_id",
  "slug",
  "name",
  "subtitle",
  "tagline",
  "description",
  "long_description",
  "accent_color",
  "image_path",
  "nutrition",
  "tags",
  "highlights",
  "badge",
  "display_order",
  "status",
  "published_at",
  "product_categories!inner(slug, name)",
].join(", ");
const TEAM_FIELDS = [
  "id",
  "slug",
  "name",
  "position",
  "department",
  "biography",
  "quote",
  "image_path",
  "email",
  "linkedin_url",
  "instagram_url",
  "skills",
  "joined_year",
  "display_order",
  "status",
  "published_at",
].join(", ");
const SITE_CONTENT_FIELDS = "id, key, value, status";

let publicContentRequest = null;

function compact(record) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  );
}

function throwQueryError(error, operation) {
  if (error) throw new Error(`Supabase ${operation} failed: ${error.message}`);
}

function mapCategory(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    displayOrder: row.display_order,
    status: row.status,
  };
}

function mapProduct(row) {
  return {
    id: row.id,
    dbId: row.id,
    categoryId: row.category_id,
    category: row.product_categories?.slug ?? "",
    categoryName: row.product_categories?.name ?? "",
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle ?? "",
    tagline: row.tagline ?? "",
    desc: row.description ?? "",
    longDesc: row.long_description ?? "",
    color: row.accent_color ?? "#BF9A56",
    imagePath: row.image_path,
    nutrition: row.nutrition ?? {},
    tags: row.tags ?? [],
    highlights: row.highlights ?? [],
    badge: row.badge,
    displayOrder: row.display_order,
    status: row.status,
    publishedAt: row.published_at,
  };
}

function mapTeamMember(row) {
  return {
    id: row.id,
    dbId: row.id,
    slug: row.slug,
    name: row.name,
    position: row.position,
    dept: row.department ?? "",
    desc: row.biography ?? "",
    quote: row.quote ?? "",
    imagePath: row.image_path,
    email: row.email ?? "",
    linkedin: row.linkedin_url ?? "#",
    instagram: row.instagram_url ?? "#",
    skills: row.skills ?? [],
    joined: row.joined_year ? String(row.joined_year) : "",
    displayOrder: row.display_order,
    status: row.status,
    publishedAt: row.published_at,
  };
}

export async function fetchPublicContent({ force = false } = {}) {
  if (publicContentRequest && !force) return publicContentRequest;

  const client = requireSupabase();
  publicContentRequest = Promise.all([
    client.from("product_categories").select(CATEGORY_FIELDS).order("display_order"),
    client.from("products").select(PRODUCT_FIELDS).order("display_order"),
    client.from("team_members").select(TEAM_FIELDS).order("display_order"),
    client.from("site_content").select(SITE_CONTENT_FIELDS).order("key"),
  ]).then(([categoriesResult, productsResult, teamResult, siteResult]) => {
    throwQueryError(categoriesResult.error, "category read");
    throwQueryError(productsResult.error, "product read");
    throwQueryError(teamResult.error, "team read");
    throwQueryError(siteResult.error, "site content read");

    const siteContent = Object.fromEntries(
      (siteResult.data ?? []).map((row) => [row.key, row.value]),
    );

    return {
      categories: (categoriesResult.data ?? []).map(mapCategory),
      products: (productsResult.data ?? []).map(mapProduct),
      teamMembers: (teamResult.data ?? []).map(mapTeamMember),
      company: siteContent.company ?? { socials: {} },
      navLinks: siteContent.navigation ?? [],
      values: siteContent.values ?? [],
      processSteps: siteContent.process_steps ?? [],
    };
  }).catch((error) => {
    publicContentRequest = null;
    throw error;
  });

  return publicContentRequest;
}

export function invalidatePublicContent() {
  publicContentRequest = null;
}

function categoryWrite(input) {
  return compact({
    slug: input.slug,
    name: input.name,
    display_order: input.displayOrder,
    status: input.status,
  });
}

function productWrite(input) {
  return compact({
    category_id: input.categoryId,
    slug: input.slug,
    name: input.name,
    subtitle: input.subtitle,
    tagline: input.tagline,
    description: input.desc,
    long_description: input.longDesc,
    accent_color: input.color,
    image_path: input.imagePath,
    nutrition: input.nutrition,
    tags: input.tags,
    highlights: input.highlights,
    badge: input.badge,
    display_order: input.displayOrder,
    status: input.status,
    published_at: input.publishedAt,
  });
}

function teamWrite(input) {
  return compact({
    slug: input.slug,
    name: input.name,
    position: input.position,
    department: input.dept,
    biography: input.desc,
    quote: input.quote,
    image_path: input.imagePath,
    email: input.email,
    linkedin_url: input.linkedin,
    instagram_url: input.instagram,
    skills: input.skills,
    joined_year: input.joined ? Number(input.joined) : input.joined,
    display_order: input.displayOrder,
    status: input.status,
    published_at: input.publishedAt,
  });
}

async function createRow(table, values, select, mapper) {
  const { data, error } = await requireSupabase()
    .from(table)
    .insert(values)
    .select(select)
    .single();
  throwQueryError(error, `${table} create`);
  invalidatePublicContent();
  return mapper(data);
}

async function updateRow(table, id, values, select, mapper) {
  const { data, error } = await requireSupabase()
    .from(table)
    .update(values)
    .eq("id", id)
    .select(select)
    .single();
  throwQueryError(error, `${table} update`);
  invalidatePublicContent();
  return mapper(data);
}

async function deleteRow(table, id) {
  const { error } = await requireSupabase().from(table).delete().eq("id", id);
  throwQueryError(error, `${table} delete`);
  invalidatePublicContent();
}

export const contentCrud = Object.freeze({
  createCategory: (input) =>
    createRow("product_categories", categoryWrite(input), CATEGORY_FIELDS, mapCategory),
  updateCategory: (id, input) =>
    updateRow("product_categories", id, categoryWrite(input), CATEGORY_FIELDS, mapCategory),
  deleteCategory: (id) => deleteRow("product_categories", id),
  createProduct: (input) =>
    createRow("products", productWrite(input), PRODUCT_FIELDS, mapProduct),
  updateProduct: (id, input) =>
    updateRow("products", id, productWrite(input), PRODUCT_FIELDS, mapProduct),
  deleteProduct: (id) => deleteRow("products", id),
  createTeamMember: (input) =>
    createRow("team_members", teamWrite(input), TEAM_FIELDS, mapTeamMember),
  updateTeamMember: (id, input) =>
    updateRow("team_members", id, teamWrite(input), TEAM_FIELDS, mapTeamMember),
  deleteTeamMember: (id) => deleteRow("team_members", id),
  createSiteContent: (input) =>
    createRow(
      "site_content",
      compact({ key: input.key, value: input.value, status: input.status }),
      SITE_CONTENT_FIELDS,
      (row) => row,
    ),
  updateSiteContent: (id, input) =>
    updateRow(
      "site_content",
      id,
      compact({ key: input.key, value: input.value, status: input.status }),
      SITE_CONTENT_FIELDS,
      (row) => row,
    ),
  deleteSiteContent: (id) => deleteRow("site_content", id),
});

const productImageModules = import.meta.glob(
  '../images/products/*.(jpg|jpeg|png|webp|avif|svg)',
  { eager: true }
);

const teamImageModules = import.meta.glob(
  '../images/team/*.(jpg|jpeg|png|webp|avif|svg)',
  { eager: true }
);

const heroImageModules = import.meta.glob(
  '../images/hero/*.(jpg|jpeg|png|webp|avif|svg)',
  { eager: true }
);

// ── Helper: extract slug from file path ───────────────────────
function extractSlug(filePath) {
  return filePath
    .split('/')
    .pop()
    .replace(/\.(jpg|jpeg|png|webp|avif|svg)$/i, '');
}

// ── Helper: build a slug → URL map from a module object ───────
function buildImageMap(modules) {
  const map = {};
  for (const [path, module] of Object.entries(modules)) {
    const slug = extractSlug(path);
    // Vite returns { default: '/assets/image-[hash].jpg' }
    map[slug] = module.default ?? module;
  }
  return map;
}

// ── Build the maps ────────────────────────────────────────────
export const PRODUCT_IMAGE_MAP = buildImageMap(productImageModules);
export const TEAM_IMAGE_MAP    = buildImageMap(teamImageModules);
export const HERO_IMAGE_MAP    = buildImageMap(heroImageModules);

// ── Convenience getters with fallback support ─────────────────

/**
 * Get product image URL by slug.
 * Falls back to null if the file doesn't exist yet.
 *
 * @param {string} slug  e.g. 'classic-jasmine'
 * @returns {string|null}
 */
export function getProductImage(slug) {
  return PRODUCT_IMAGE_MAP[slug] ?? null;
}

/**
 * Get team member photo URL by slug.
 * Falls back to null if the file doesn't exist yet.
 *
 * @param {string} slug  e.g. 'amal-silva'
 * @returns {string|null}
 */
export function getTeamImage(slug) {
  return TEAM_IMAGE_MAP[slug] ?? null;
}

/**
 * Get a hero/general image by key name (filename without extension).
 *
 * @param {string} key  e.g. 'hero-main', 'about-story'
 * @returns {string|null}
 */
export function getHeroImage(key) {
  return HERO_IMAGE_MAP[key] ?? null;
}
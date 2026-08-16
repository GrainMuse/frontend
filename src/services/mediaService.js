import { requireSupabase, supabase } from "../lib/supabase";

export const SITE_MEDIA_BUCKET = "site-media";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const IMAGE_EXTENSIONS = Object.freeze({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
});

export function isStorageMediaPath(path) {
  return typeof path === "string" && /^(products|team|branding)\//.test(path);
}

export function resolveMediaUrl(path, localImages = {}) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (localImages[path]) return localImages[path];
  if (!supabase || !isStorageMediaPath(path)) return null;

  return supabase.storage.from(SITE_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadSiteImage(file, folder, slug) {
  if (!file) throw new Error("Choose an image to upload.");
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Use a JPEG, PNG, WebP, or AVIF image.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be 5 MB or smaller.");
  }
  if (!new Set(["products", "team", "branding"]).has(folder)) {
    throw new Error("Invalid media folder.");
  }

  const extension = IMAGE_EXTENSIONS[file.type];
  const safeSlug = slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (!safeSlug) throw new Error("Enter a valid slug before uploading an image.");

  const uniquePart = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const path = `${folder}/${safeSlug}-${uniquePart}.${extension}`;
  const { error } = await requireSupabase()
    .storage.from(SITE_MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Image upload failed: ${error.message}`);
  return path;
}

export async function removeSiteImage(path) {
  if (!isStorageMediaPath(path)) return;
  const { error } = await requireSupabase()
    .storage.from(SITE_MEDIA_BUCKET)
    .remove([path]);
  if (error) throw new Error(`Image cleanup failed: ${error.message}`);
}

#!/usr/bin/env bash
set -euo pipefail

target="${1:---linked}"
if [[ "$target" != "--linked" && "$target" != "--local" ]]; then
  echo "Usage: bash scripts/sync-site-media.sh [--linked|--local]" >&2
  exit 2
fi

existing="$({
  npx supabase --experimental storage ls "$target" --recursive ss:///site-media
} 2>&1)"

while IFS= read -r -d '' source; do
  relative="${source#src/images/}"
  case "$relative" in
    products/*|team/*)
      object_path="$relative"
      ;;
    hero/*)
      object_path="branding/$relative"
      ;;
    logo/*)
      object_path="branding/$relative"
      ;;
    *)
      continue
      ;;
  esac

  case "${source##*.}" in
    jpg|jpeg) content_type="image/jpeg" ;;
    png) content_type="image/png" ;;
    webp) content_type="image/webp" ;;
    avif) content_type="image/avif" ;;
    *)
      echo "Skipping unsupported file: $source" >&2
      continue
      ;;
  esac

  api_path="/site-media/$object_path"
  if grep -Fq "\"$api_path\"" <<<"$existing"; then
    echo "Already present: $object_path"
    continue
  fi

  npx supabase --experimental storage cp \
    "$target" \
    --cache-control "max-age=31536000, immutable" \
    --content-type "$content_type" \
    "$source" \
    "ss://$api_path"
  existing+="\"$api_path\""
done < <(
  find \
    src/images/products \
    src/images/team \
    src/images/hero \
    src/images/logo \
    -type f -print0
)

#!/usr/bin/env bash
set -euo pipefail

target="${1:---linked}"
if [[ "$target" != "--linked" && "$target" != "--local" ]]; then
  echo "Usage: bash scripts/sync-site-media.sh [--linked|--local]" >&2
  exit 2
fi

set +e
existing="$(
  npx supabase --experimental storage ls \
    "$target" \
    --recursive \
    ss:///site-media 2>&1
)"
list_status=$?
set -e
if (( list_status != 0 )); then
  echo "Could not pre-list site media; uploads will verify each object." >&2
  existing=""
fi

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
  if grep -Fq "$object_path" <<<"$existing"; then
    echo "Already present: $object_path"
    continue
  fi

  set +e
  upload_output="$(
    npx supabase --experimental storage cp \
      "$target" \
      --cache-control "max-age=31536000, immutable" \
      --content-type "$content_type" \
      "$source" \
      "ss://$api_path" 2>&1
  )"
  upload_status=$?
  set -e

  if (( upload_status == 0 )); then
    echo "$upload_output"
    existing+="$object_path"
  elif grep -Fq 'KeyAlreadyExists' <<<"$upload_output"; then
    echo "Already present: $object_path"
  else
    echo "$upload_output" >&2
    exit "$upload_status"
  fi
done < <(
  find \
    src/images/products \
    src/images/team \
    src/images/hero \
    src/images/logo \
    -type f -print0
)

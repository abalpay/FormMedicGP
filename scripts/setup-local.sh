#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env.local"

require_command() {
  local command_name="$1"
  local install_hint="$2"

  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Error: required command '${command_name}' is not installed." >&2
    echo "Hint: ${install_hint}" >&2
    exit 1
  fi
}

extract_status_var() {
  local status_output="$1"
  local key="$2"
  local value

  value="$(
    printf '%s\n' "${status_output}" | awk -v key="${key}" '
      index($0, key "=") == 1 {
        value = substr($0, length(key) + 2)
        gsub(/^"/, "", value)
        gsub(/"$/, "", value)
        print value
        exit
      }
    '
  )"

  if [[ -z "${value}" ]]; then
    echo "Error: failed to parse '${key}' from supabase status output." >&2
    exit 1
  fi

  printf '%s' "${value}"
}

upsert_env_var() {
  local key="$1"
  local value="$2"
  local tmp_file

  tmp_file="$(mktemp)"

  awk -v key="${key}" -v value="${value}" '
    BEGIN { updated = 0 }
    index($0, key "=") == 1 {
      print key "=" value
      updated = 1
      next
    }
    { print }
    END {
      if (updated == 0) {
        print key "=" value
      }
    }
  ' "${ENV_FILE}" >"${tmp_file}"

  mv "${tmp_file}" "${ENV_FILE}"
}

require_command "supabase" "Install Supabase CLI: https://supabase.com/docs/guides/local-development/cli/getting-started"
require_command "docker" "Install Docker Desktop: https://docs.docker.com/desktop/"

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not running. Start Docker Desktop and retry." >&2
  exit 1
fi

echo "Starting local Supabase services..."
supabase start --workdir "${REPO_ROOT}" >/dev/null

echo "Reading local Supabase credentials..."
STATUS_OUTPUT="$(supabase status --workdir "${REPO_ROOT}" -o env)"

NEXT_PUBLIC_SUPABASE_URL="$(extract_status_var "${STATUS_OUTPUT}" "API_URL")"
NEXT_PUBLIC_SUPABASE_ANON_KEY="$(extract_status_var "${STATUS_OUTPUT}" "ANON_KEY")"
SUPABASE_SERVICE_ROLE_KEY="$(extract_status_var "${STATUS_OUTPUT}" "SERVICE_ROLE_KEY")"
STUDIO_URL="$(extract_status_var "${STATUS_OUTPUT}" "STUDIO_URL")"
INBUCKET_URL="$(extract_status_var "${STATUS_OUTPUT}" "INBUCKET_URL")"

touch "${ENV_FILE}"

upsert_env_var "NEXT_PUBLIC_SUPABASE_URL" "${NEXT_PUBLIC_SUPABASE_URL}"
upsert_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
upsert_env_var "SUPABASE_SERVICE_ROLE_KEY" "${SUPABASE_SERVICE_ROLE_KEY}"

cat <<EOF
Local environment is ready.

Updated:
  ${ENV_FILE}

URLs:
  App:              http://localhost:3000
  Supabase API:     ${NEXT_PUBLIC_SUPABASE_URL}
  Supabase Studio:  ${STUDIO_URL}
  Inbucket:         ${INBUCKET_URL}
EOF

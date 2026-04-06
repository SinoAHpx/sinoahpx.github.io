#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v terraform >/dev/null 2>&1; then
  echo 'terraform is not installed or not on PATH.' >&2
  exit 1
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo 'CLOUDFLARE_API_TOKEN is not set.' >&2
  echo 'export CLOUDFLARE_API_TOKEN="<your-token>"' >&2
  exit 1
fi

cd "$SCRIPT_DIR"
exec terraform "$@"

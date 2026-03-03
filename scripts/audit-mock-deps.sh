#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

STRICT_MODE="${1:-}"

PATTERN='\bmock[A-Za-z0-9_]*\b|Mock data|mockData|mockStudents'
MATCHES="$(rg -n --glob 'src/pages/**/*.tsx' -e "$PATTERN" src/pages | rg -v '^src/pages/examples/' || true)"

if [[ -z "$MATCHES" ]]; then
  echo "[mock-audit] no mock dependency found in src/pages (excluding examples)."
  exit 0
fi

echo "[mock-audit] mock dependency still exists in src/pages (excluding examples):"
echo "$MATCHES"

FILE_COUNT="$(echo "$MATCHES" | cut -d: -f1 | sort -u | wc -l | tr -d ' ')"
LINE_COUNT="$(echo "$MATCHES" | wc -l | tr -d ' ')"

echo "[mock-audit] summary: ${FILE_COUNT} files, ${LINE_COUNT} matches."

if [[ "$STRICT_MODE" == "--strict" ]]; then
  echo "[mock-audit] strict mode enabled: exiting with non-zero status."
  exit 1
fi


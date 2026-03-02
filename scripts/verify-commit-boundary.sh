#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
cd "$REPO_ROOT"

origin_url="$(git remote get-url origin 2>/dev/null || true)"
repo_kind=""

if [[ "$origin_url" == *"edu-web.git" ]] || [[ "$origin_url" == *"edu-web" ]]; then
  repo_kind="edu-web"
elif [[ "$origin_url" == *"edu-server.git" ]] || [[ "$origin_url" == *"edu-server" ]]; then
  repo_kind="edu-server"
fi

gitlink_lines="$(git diff --cached --raw --no-renames | awk '{old=substr($1,2); new=$2; if (old=="160000" || new=="160000") print $0}')"
if [[ -n "$gitlink_lines" ]]; then
  echo "[pre-commit] blocked: staged changes contain nested git repository pointers (mode 160000)."
  echo "$gitlink_lines"
  exit 1
fi

staged_files=()
while IFS= read -r -d '' file; do
  staged_files+=("$file")
done < <(git diff --cached --name-only -z --diff-filter=ACMRDTUXB)
if [[ "${#staged_files[@]}" -eq 0 ]]; then
  exit 0
fi

violations=()

for file in "${staged_files[@]}"; do
  if [[ "$file" == ".agent/"* ]] || [[ "$file" == ".claude/"* ]] || [[ "$file" == ".cursorrules" ]]; then
    violations+=("$file -> AI/agent files are not allowed in commit.")
  fi
done

if [[ "$repo_kind" == "edu-web" ]]; then
  for file in "${staged_files[@]}"; do
    case "$file" in
      edu-admin/*|edu-common/*|edu-finance/*|edu-framework/*|edu-marketing/*|edu-notification/*|edu-student/*|edu-system/*|edu-teaching/*|pom.xml|migrate_databases.sql)
        violations+=("$file -> backend (edu-server) path detected in edu-web repository.")
        ;;
    esac
  done
fi

if [[ "$repo_kind" == "edu-server" ]]; then
  for file in "${staged_files[@]}"; do
    case "$file" in
      index.html|vite.config.ts|tsconfig.app.json|tsconfig.node.json|src/App.tsx|src/main.tsx|public/vite.svg)
        violations+=("$file -> frontend (edu-web) path detected in edu-server repository.")
        ;;
    esac
  done
fi

if [[ "${#violations[@]}" -gt 0 ]]; then
  echo "[pre-commit] blocked: repository boundary validation failed."
  if [[ -z "$repo_kind" ]]; then
    echo "[pre-commit] warning: unable to detect repository type from origin: $origin_url"
  fi
  printf ' - %s\n' "${violations[@]}"
  echo "[pre-commit] fix staged files and commit again."
  exit 1
fi

echo "[pre-commit] boundary check passed (${repo_kind:-unknown-repo})."

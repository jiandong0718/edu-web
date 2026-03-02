#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
cd "$REPO_ROOT"

chmod +x .githooks/pre-commit scripts/verify-commit-boundary.sh
git config core.hooksPath .githooks

echo "Git hooks installed: core.hooksPath=.githooks"

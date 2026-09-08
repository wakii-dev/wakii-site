#!/usr/bin/env bash
# probe-repos.sh — batch-3 repo probe (story FI-383 SF-1, Linear FI-384).
#
# Reads the repo column of the batch-3 matrix table (default path pinned
# below, override with $1), probes each repo via `gh api repos/<owner/repo>`
# and prints an aligned table: repo | stars | pushed | license | archived,
# followed by a summary (archived count, license-none count, probe errors).
#
# Claim convention source: docs/superpowers/editorial/2026-blog-longform/
# claims-registry.md §Third-party claims — batch-3 (FI-383): every
# third-party number must carry its retrieval date, and license
# none/NOASSERTION repos are "công khai trên GitHub", NEVER "open-source"
# (scoped FORBIDDEN on the 6 † slugs). This script is the probe tool behind
# that rule — run it, then cite the date you ran it in the post + digest.
#
# Gotcha carried from the research loop: `gh api` needs the bare
# `<owner/repo>` — a full `github.com/` URL 404s the whole list, so any URL
# prefix in the matrix column is stripped here before probing.
#
# Exit code: 1 when ANY repo row failed to probe (evidence incomplete —
# network/auth/matrix problem) — a partial table must never read as green.
# Display paths are scrubbed ($HOME → ~): output gets pasted to Linear, and a
# home-path leak there was a P1 security finding on a previous SF.
#
# Usage: bash scripts/probe-repos.sh [path/to/topic-matrix-batch3.md]

set -u # deliberately NO set -e — one failing repo must not kill the loop

MATRIX_FILE="${1:-docs/superpowers/editorial/2026-blog-longform/topic-matrix-batch3.md}"
HOME_DIR="${HOME:-/nonexistent-home}"
# never echo the operator-supplied path raw — scrub before display
DISP="${MATRIX_FILE/#$HOME_DIR/~}"

if ! command -v gh >/dev/null 2>&1; then
  echo "✗ gh CLI not found — install https://cli.github.com/ and run 'gh auth login' first" >&2
  exit 1
fi
if [ ! -f "$MATRIX_FILE" ]; then
  echo "✗ matrix file not found: $DISP" >&2
  exit 1
fi

# repo column = 8th |-separated field (the leading `|` makes $1 empty); table
# rows look like: | 12 | `deep-dive-cline-cline` | tech | 2026-10-06 | ... | cline/cline | ... |
REPOS=$(awk -F'|' '/^\|[[:space:]]*[0-9]+[[:space:]]*\|/ {
  r = $8
  gsub(/^[[:space:]]+|[[:space:]]+$/, "", r)
  if (r != "") print r
}' "$MATRIX_FILE" | sed -e 's|^https://github.com/||' -e 's|^github.com/||' -e 's|\.git$||')

TOTAL=$(printf '%s\n' "$REPOS" | grep -c .)
if [ "$TOTAL" -eq 0 ]; then
  echo "✗ parsed 0 repo rows from $DISP — table format drifted (want '| N | \`slug\` | cat | pubDate | ... | owner/repo | ... |')" >&2
  exit 1
fi

echo "probing $TOTAL repos from $DISP (gh api repos/<owner/repo>)..."
printf '%-46s %9s %12s %-14s %-8s\n' "repo" "stars" "pushed" "license" "archived"

ARCHIVED=0
NO_LIC=0
FAILS=0
while IFS= read -r repo; do
  [ -z "$repo" ] && continue
  # repo cell is repo-committed content flowing into a URL + the terminal:
  # require a clean `owner/repo` shape (blocks ANSI escape injection into the
  # printed table and traversal/junk cells hitting the API as garbage).
  if ! printf '%s' "$repo" | grep -Eq '^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$'; then
    FAILS=$((FAILS + 1))
    clean=$(printf '%s' "$repo" | tr -d '\033' | tr -c '[:print:]' '?')
    printf '%-46s %9s %12s %-14s %-8s\n' "$clean" "INVALID" "-" "-" "-"
    continue
  fi
  # gh api prints the error JSON to STDOUT and exits non-zero on 404/rate-limit
  # (repo GONE between research and publish = expected case, spec risk #3) —
  # trust the EXIT STATUS, not stdout emptiness, or the table fills with JSON.
  if ! row=$(gh api "repos/$repo" --jq '[.stargazers_count, (.pushed_at | .[0:10]), (.license.spdx_id // "none"), (.archived | tostring)] | @tsv' 2>/dev/null) || [ -z "$row" ]; then
    FAILS=$((FAILS + 1))
    printf '%-46s %9s %12s %-14s %-8s\n' "$repo" "ERR" "-" "-" "-"
    continue
  fi
  stars=$(printf '%s' "$row" | cut -f1)
  pushed=$(printf '%s' "$row" | cut -f2)
  lic=$(printf '%s' "$row" | cut -f3)
  arch=$(printf '%s' "$row" | cut -f4)
  if [ "$arch" = "true" ]; then ARCHIVED=$((ARCHIVED + 1)); fi
  if [ "$lic" = "none" ] || [ "$lic" = "NOASSERTION" ]; then NO_LIC=$((NO_LIC + 1)); fi
  printf '%-46s %9s %12s %-14s %-8s\n' "$repo" "$stars" "$pushed" "$lic" "$arch"
done <<< "$REPOS"

echo "----"
echo "summary: $TOTAL repos probed | archived: $ARCHIVED | license none/NOASSERTION: $NO_LIC | probe errors: $FAILS"
echo "convention: cite every number as \"theo GitHub API ngày $(date +%F)\" — claims-registry.md §Third-party claims; † slugs (license none/NOASSERTION) are never \"open-source\""
if [ "$FAILS" -gt 0 ]; then
  echo "✗ $FAILS repo row(s) failed/invalid — evidence incomplete (check network/gh auth or the matrix cells), re-run" >&2
  exit 1
fi

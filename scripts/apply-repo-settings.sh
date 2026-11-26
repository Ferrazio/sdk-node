#!/usr/bin/env bash
# Aplica no GitHub as regras de segurança do repositório.
#
#   REPO=Ferrazio/sdk-node bash scripts/apply-repo-settings.sh
#
# Requer o gh autenticado com permissão de admin no repositório.
set -euo pipefail

REPO="${REPO:-Ferrazio/sdk-node}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Ruleset da branch padrão em $REPO"
existing="$(gh api "repos/$REPO/rulesets" --jq '.[] | select(.name=="protect-main") | .id')"
if [ -n "$existing" ]; then
  gh api -X PUT "repos/$REPO/rulesets/$existing" --input "$DIR/.github/rulesets/main.json" > /dev/null
else
  gh api -X POST "repos/$REPO/rulesets" --input "$DIR/.github/rulesets/main.json" > /dev/null
fi

echo "Configurações gerais (merge só por squash, apagar branch após merge)"
gh api -X PATCH "repos/$REPO" \
  -F allow_merge_commit=false -F allow_rebase_merge=false -F allow_squash_merge=true \
  -F delete_branch_on_merge=true -F allow_auto_merge=false \
  -F web_commit_signoff_required=true > /dev/null

echo "Segurança: alertas e correções do Dependabot, secret scanning e push protection"
gh api -X PUT "repos/$REPO/vulnerability-alerts" > /dev/null
gh api -X PUT "repos/$REPO/automated-security-fixes" > /dev/null
gh api -X PATCH "repos/$REPO" --input - > /dev/null <<'JSON'
{ "security_and_analysis": {
    "secret_scanning": { "status": "enabled" },
    "secret_scanning_push_protection": { "status": "enabled" } } }
JSON
gh api -X PUT "repos/$REPO/private-vulnerability-reporting" > /dev/null

echo "Actions: token só leitura, sem aprovar PR, e só Actions fixadas por SHA"
gh api -X PUT "repos/$REPO/actions/permissions/workflow" \
  -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false > /dev/null
gh api -X PUT "repos/$REPO/actions/permissions" \
  -F enabled=true -f allowed_actions=all -F sha_pinning_required=true > /dev/null

echo "Pronto."

# Verified subscription ownership release

> PR #4 foi ampliado pela matriz aprovada em 11/11/2026. O roteiro atual está em `docs/approved-matrix-release.md`; este documento preserva o histórico da primeira correção. Nenhuma etapa autoriza produção antes de Pro, recuperação comprovada e aprovação final.

Status: prepared locally; production unchanged. One final approval is required for integration and deployment.
Target: ospnuclymrxjoqwyolfn. Never apply unrelated pending migrations.

## Scope

Use the already-versioned, not-yet-applied migration
`supabase/migrations/20261110110000_verified_claims_only.sql` in its entirety.
It replaces the claim/signup functions, adds the confirmation trigger and guards
future owner assignments, including privileged/legacy writes. It performs no bulk
UPDATE/DELETE, backfill, reassignment, plan change or revocation. Existing links
are grandfathered even when Auth email changes. The existing admin signup rule,
commercial checks, expiry rules, payment processing and confirmation UI are unchanged.
The owner guard deliberately refuses future reassignment/unlinking; unexpected
administrative workflows attempting these operations must stop, not bypass it.

Webhook retries can recover a pending verified link using the stored purchase
email, without recreating purchases or resending email. Auth/DB lookup failures
return a retryable error. A normal app subscription refresh also retries the
verified claim; failure does not replace the existing access checks.
The legacy code generator now claims via the guarded RPC for confirmed users
and checks existing owner IDs instead of trusting a matching email. Existing
linked clients and admins retain their original code flow. No code validator
or commercial eligibility logic is changed.

## Read-only preflight (repeat immediately before deployment)

Run `docs/subscription-preflight.sql` and compare aggregates with the baseline.
Observed 2026-11-10: 35 active, 0 linked unconfirmed, 5 unlinked, 0 orphan links,
1 linked email mismatch. No active purchase has a blank email; none of the five
unlinked purchases has a matching confirmed Auth user. The mismatch remains
linked and is explicitly covered by preservation tests. Do not repair it by email.

Verify the exact current definitions, triggers, ACLs and migration history again.
The audited migration version is absent. `comunicacoes_transacionais` already
exists despite missing history; do not run its creation migration. Older history
has timestamp differences: do not use a blanket `db push`.
If ownership-preserving deployment would block legitimate access, stop before
writes. No customer rows may be changed to make a preflight pass.

## Backup gate, after final approval and before any write

Confirm a successful Supabase backup/PITR restore point and its timestamp in the
official dashboard, plus the authorized restoration procedure. Backup availability
has NOT been verified in this task. Do not deploy without this check.
Privately export current pg_get_functiondef definitions, pg_get_triggerdef and ACLs
for the affected functions/triggers; capture deployed kiwify-webhook v77 and
generate-soph-token v14 (refresh versions at deployment). Keep these rollback
artifacts in restricted release storage, never subscriber dumps in Git or chat.
Record counts and an internal comparison of existing subscription IDs, owner IDs,
plan, status, customer IDs, validity and payment fields; report only aggregates.

## Deployment sequence, only after final approval

1. Run the preflight and backup gate. Record the approved commit.
2. Apply ONLY the reviewed verified_claims_only SQL transactionally through the
   authorized Supabase migration tool, registering that specific migration.
   The transaction must commit all functions, ACLs and triggers together.
3. Deploy ONLY kiwify-webhook and generate-soph-token from this commit, preserving
   existing secrets and gateway settings. Keep verify_jwt=false as already deployed;
   the handlers retain their own authentication. No other function is deployed.
4. Integrate the approved branch into main via the agreed GitHub process and let
   the existing frontend publishing workflow run. Do not modify Lovable/Netlify
   settings or environment values. SQL must precede the new frontend claim retry.
5. Inspect only structural definitions and aggregate outcomes. Confirm existing
   IDs, owners and commercial fields remain unchanged (legitimate new events must
   be distinguished). Do not execute fake purchases or experimental users in production.

## Reversal

Before commit of a failed SQL transaction: ROLLBACK leaves previous objects intact.
After deployment: prefer a focused forward fix that keeps verified identity checks.
For an urgent rollback, restore the captured previous Edge Function artifacts,
restore prior SQL function definitions and exact ACLs in a transaction, remove only
new triggers/functions that were absent in the captured baseline. Never restore
subscriber tables over live events, clear user_id, reassign purchases, or reverse
legitimate links created since release. Reverting to prior SQL reopens the original
vulnerability, so requires a deliberate incident decision. Retain all subscriptions
and communication records. Use backup restoration only for genuine data damage,
with an explicit recovery plan; it is not the normal code rollback.

## Reproducible validation

`npm ci --ignore-scripts`
`npm run test:subscriptions`
`npm test`
`npm run build`

Security suite: real PostgreSQL engine (PGlite), minimal Auth schema and fictional
users, actual migration applied twice; actual Edge handlers transpiled and run
against in-memory Auth/API doubles. No production services are contacted by tests.
This verifies trigger/SQL semantics and handler behavior, not live GoTrue email
transport, browser redirects, Netlify deployment or Deno gateway integration.
The npm lockfile was already inconsistent with package.json; it was regenerated
so npm ci works. PGlite 0.5.16 is pinned as a development-only test dependency.

## Validation results for this branch

- Clean `npm ci --ignore-scripts`: passed after lockfile reconciliation.
- 12 PostgreSQL integration cases: passed.
- 12 actual Edge-handler/recovery cases with API doubles: passed.
- Existing Vitest suite: 5 passed.
- Vite production build: passed (existing large-chunk/Browserslist advisories).
- ESLint on all changed TypeScript files: passed.
- Repository-wide ESLint: 29 errors and 9 warnings, reproduced unchanged in a
  clean archive of main using the same dependencies; unrelated files were not edited.
- `git diff --check`: passed.

Operational limits: no production write, deployment, real purchase, live email
or browser signup was performed. Backup/PITR readiness remains a deployment gate,
not a verified backup claim. The code of deployed validate-soph-code could not
be retrieved through the connector; its known role is code validation, and it
is neither replaced nor deployed by this release. The SQL owner guard covers
any future subscription assignment regardless of which legacy writer requests it.

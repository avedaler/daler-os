# AGENTS.md — Asita / Daler OS Repository Instructions

## Repository mission

This repository is the canonical codebase for **Asita Daler OS** and its integrated modules.

The existing Daler OS daily operating system must remain functional. New modules must extend the shared Asita architecture rather than becoming disconnected applications.

## RCMND module

The next product module is **Asita RCMND**.

- Product name: `RCMND`
- Parent brand: `Asita`
- Canonical product label: `RCMND by Asita`
- Canonical subdomain: `rcmnd.asita.ai`
- Canonical fallback route: `/rcmnd`
- Legacy codename/source project: `IntelFlow`
- Category: `Personal Experience Intelligence`
- Tagline: `Remember where you've been. Recommend what you know.`

RCMND is a private-first place memory, experience journal, contextual recommendation engine, and controlled sharing network.

Before RCMND work, read in this order:

1. `docs/rcmnd/README.md`
2. `docs/rcmnd/RCMND_FOUNDER_THREAD_AND_HISTORY.md`
3. `docs/rcmnd/RCMND_MASTER_PRODUCT_SPEC.md`
4. `docs/rcmnd/RCMND_INTEGRATION_ARCHITECTURE.md`
5. `docs/rcmnd/ADR_001_NAME_DOMAIN_AND_MODULE_BOUNDARY.md`
6. `docs/rcmnd/ADR_002_PRIVATE_DATA_SHARING_AND_AI_PROVENANCE.md`
7. `docs/rcmnd/CODEX_MASTER_INSTRUCTION.md`
8. the active task document under `docs/rcmnd/`
9. the current repository implementation and tests

## Non-negotiable integration rule

**Do not create a separate independent RCMND application, repository, design system, authentication system, or duplicate infrastructure stack.**

RCMND must be integrated into Daler OS as an Asita module and must reuse or deliberately evolve:

- the existing Vite/React application shell;
- the PWA and offline behavior;
- the shared visual language and component primitives;
- Supabase authentication and cloud configuration where suitable;
- existing IndexedDB utilities for offline drafts and caches;
- notification and export capabilities;
- shared settings and identity;
- the existing Vercel deployment architecture.

A separate Vercel hostname or project alias is allowed only as a deployment entry point to the same canonical codebase and shared module architecture. It must not become a fork.

## Product invariants

The core loop is:

`Capture → Enrich → Remember → Ask → Recommend → Share → Learn`

The domain distinction is:

`Place ≠ Branch ≠ Visit ≠ Experience ≠ Recommendation`

The trust rule is:

`No recommendation without evidence, no sharing without permission, and no AI claim without provenance.`

Additional invariants:

1. New records are private by default.
2. A repeat visit is a new Visit, not an overwrite of the old visit.
3. Branch-specific experiences are never silently merged.
4. User-authored ratings and notes are canonical.
5. AI may propose structure but cannot invent a visit, opinion, rating, companion, spend, or fact.
6. Hard constraints run before recommendation scoring or AI explanation.
7. Every recommendation candidate has an evidence bundle and score breakdown.
8. Friendship does not grant retroactive access.
9. Every share is previewable and revocable.
10. Cross-user access is denied unless an explicit policy permits it.

## Preserve Daler OS

Before changing shared routing, state, persistence, cloud sync, PWA configuration, or navigation:

- inspect the current implementation;
- record the current commit SHA;
- run the baseline build;
- preserve a rollback reference;
- confirm that Today, Deals, Overview, More, Forecast, lock screen, IndexedDB data, cloud sync, and PWA behavior still work.

Do not reinterpret existing Daler OS day, week, deal, settings, or forecast data as RCMND data.

## Working method

For every task:

1. State exact scope and non-scope.
2. Inspect before coding.
3. Run and record baseline commands.
4. Make the smallest complete vertical slice.
5. Keep changes reversible and feature-flagged until stable.
6. Add tests for domain, privacy, routing, and migration behavior.
7. Run all relevant quality commands.
8. Report exact results, limitations, and rollback steps.
9. Stop for unresolved founder decisions rather than inventing them.

Do not perform an uncontrolled full rewrite.

## Target module architecture

Converge toward a shared Asita module system:

```text
src/
  app/
    moduleRegistry.js
    hostResolver.js
    featureFlags.js
  modules/
    daler/
    rcmnd/
  components/
    shared/
  lib/
    auth/
    privacy/
    db/
    providers/
    storage/
    ai/
    observability/
```

This is directional. Do not create empty folders without an immediate consumer.

Preferred resolution behavior:

- `daler.asita.ai` → Daler OS home;
- `rcmnd.asita.ai` → RCMND home;
- local development → route or environment override;
- authenticated identity and shared settings → common Asita services;
- module data → separate domain tables and policies, not one untyped key-value blob.

## Data rules

- Existing Daler OS records may continue using IndexedDB and the current sync mechanism until intentionally migrated.
- Canonical RCMND multi-user data belongs in normalized PostgreSQL/Supabase tables with migrations and row-level security as defense in depth.
- IndexedDB may hold offline drafts, caches, queued uploads, and non-sensitive UI state.
- Use UUIDs for domain records.
- Store timestamps in UTC and retain source timezone.
- Store money in minor units with currency.
- Use explicit schema migrations and idempotent jobs.
- Keep external provider IDs as references, not canonical primary keys.

## Privacy and security

Never expose without explicit permission:

- exact visit time;
- companions;
- spend;
- reservation or receipt details;
- private journal text;
- original media metadata or EXIF;
- real-time location;
- home/work patterns;
- private AI prompts or evidence from another user.

Authorization must be deterministic and server-side. The model is never the authorization layer.

Every protected read, export, recommendation, share, and media URL must be checked against the actor and visibility policy.

## AI rules

- Call AI server-side only.
- Use a provider adapter and validated structured outputs.
- Record provider, model, prompt version, evidence IDs, input hash, and output metadata.
- Keep user-authored truth separate from AI-derived fields.
- Imported or inferred visits remain suggestions until confirmed.
- Validate every cited record after model output.
- The manual non-AI workflow must remain usable.
- No random/mock AI behavior in production routes.

## Quality requirements

Task 00 must establish these scripts if they do not exist:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Minimum tests over time:

- unit: host resolution, domain rules, scoring, redaction, timezone, normalization;
- integration: visits, experiences, media access, privacy, sharing, revocation;
- end-to-end: existing Daler OS smoke, RCMND capture, journal, recall, recommendation, sharing;
- AI evaluations: recall accuracy, branch resolution, evidence validity, hard constraints, privacy leakage;
- migration tests: empty database to current schema.

A privacy or authorization defect requires a regression test.

## Completion report

Every completed task must report:

1. Summary
2. Files changed
3. Migrations
4. Shared-shell impact
5. Privacy/permission impact
6. Tests and exact results
7. Lint/typecheck/build results
8. Reproduction steps
9. Known limitations
10. Follow-up task
11. Rollback path

## Immediate instruction

Execute `docs/rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md` first.

Do not begin broad RCMND feature development until Task 00 has established:

- a verified Daler OS baseline;
- an archive/rollback reference;
- quality scripts and CI;
- a shared module registry;
- hostname and route resolution;
- a disabled-by-default RCMND boundary;
- environment validation;
- database/privacy/provider foundations;
- a Phase 1 implementation plan.

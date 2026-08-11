# RCMND by Asita — Codex Master Instruction

**Audience:** Codex and engineers working in `avedaler/daler-os`  
**Canonical product:** RCMND by Asita  
**First executable task:** `docs/rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md`

---

## 1. Mission

Build RCMND as an integrated Asita Daler OS module.

RCMND must allow users to:

- record places and exact branches;
- preserve separate visits and repeat visits;
- write quick or detailed experiences;
- attach private photos, voice notes, documents, reservations, and tips;
- search and recall lived experience;
- receive evidence-backed contextual recommendations;
- create collections, city guides, and trip guides;
- selectively share with trusted people;
- control privacy at field and media level;
- inspect AI provenance and recommendation evidence.

The build must preserve the existing Daler OS application and proceed through small, reversible, tested vertical slices.

---

## 2. Required reading order

Before implementation, read:

1. root `AGENTS.md`;
2. `docs/README.md`;
3. `docs/rcmnd/README.md`;
4. `docs/rcmnd/RCMND_FOUNDER_THREAD_AND_HISTORY.md`;
5. `docs/rcmnd/RCMND_MASTER_PRODUCT_SPEC.md`;
6. `docs/rcmnd/RCMND_INTEGRATION_ARCHITECTURE.md`;
7. accepted ADRs in `docs/rcmnd`;
8. the active task file;
9. current repository implementation and tests;
10. migration manifest and archived IntelFlow references only for history.

When documents conflict, the latest explicit founder decision and the RCMND master product specification win.

---

## 3. Product rules that may not be violated

### Core loop

`Capture → Enrich → Remember → Ask → Recommend → Share → Learn`

### Domain distinction

`Place ≠ Branch ≠ Visit ≠ Experience ≠ Recommendation`

### Trust rule

`No recommendation without evidence, no sharing without permission, and no AI claim without provenance.`

### Private-by-default rule

New RCMND records are private.

### Branch rule

Attach experience to the exact branch when known. Never silently merge branch-specific history.

### Repeat-visit rule

Create a new Visit for each real event.

### Canonical-author rule

User-authored judgment is canonical. AI and external providers may propose but not overwrite.

### Authorization rule

Authorization is deterministic, server-side, and tested.

### Recommendation rule

Hard constraints execute before scoring and before AI explanation.

### Sharing rule

Shares are selective, previewable, expirable where applicable, and revocable.

### Integration rule

Do not create a separate long-lived RCMND repository or disconnected application fork.

---

## 4. Current repository reality

The existing application is a Vite and React PWA with:

- Daler OS daily operating flows;
- IndexedDB persistence;
- optional Supabase authentication and key-value synchronization;
- lock screen;
- notifications;
- export helpers;
- Vercel deployment;
- custom domain `daler.asita.ai`.

It does not yet have a shared module registry, normalized RCMND database, place provider, private media system, recommendation engine, field-level sharing, real AI server boundary, or RCMND route.

Treat the current Daler OS application as a production asset to preserve, not an obstacle to replace.

---

## 5. Delivery method

### 5.1 No uncontrolled rewrite

Do not convert the whole project to another framework, language, router, state library, or design system during unrelated work.

### 5.2 Preserve current behavior

Before shared-shell changes:

- record SHA;
- run baseline;
- preserve archive reference;
- test Today, Deals, Overview, More, Forecast, lock screen, IndexedDB, cloud sync, PWA, build, and deployment behavior.

### 5.3 Use a module boundary

Introduce a small Asita module registry and host resolver.

Do not move every existing file merely to make the directory tree look complete.

### 5.4 Feature flag RCMND

Keep RCMND disabled by default until its shell and tests pass.

### 5.5 One task, one complete outcome

Each task must define:

- scope;
- non-scope;
- shared-shell impact;
- schema changes;
- privacy impact;
- tests;
- deployment impact;
- rollback.

### 5.6 Stop on founder decisions

Do not invent decisions about:

- public sharing;
- subscription model;
- place provider contract;
- native app;
- delegated assistant access;
- paid storage;
- major framework migration;
- importing location history;
- influence of anonymous public reviews.

---

## 6. Required quality surface

Task 00 must establish these scripts:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Use the committed lockfile.

Recommended baseline:

- ESLint;
- TypeScript checking for typed boundaries, even if the app remains incrementally JavaScript-first;
- Vitest;
- React Testing Library;
- Playwright;
- GitHub Actions.

Do not create parallel test frameworks without justification.

Every completion report must include exact command results.

---

## 7. Target code organization

Converge incrementally toward:

```text
src/
  app/
    moduleRegistry.js
    hostResolver.js
    featureFlags.js
    AsitaShell.jsx
  modules/
    daler/
    rcmnd/
  components/
    shared/
  lib/
    auth/
    privacy/
    db/
    storage/
    providers/
    ai/
    observability/
    offline/
api-or-functions/
  rcmnd/
db/
  migrations/
  seeds/
tests/
  unit/
  integration/
  e2e/
  evals/
docs/
  rcmnd/
```

This is directional. Do not generate unused abstraction layers.

---

## 8. Host and module behavior

Required mapping:

- `daler.asita.ai` → Daler module;
- `rcmnd.asita.ai` → RCMND module;
- `/rcmnd` → RCMND fallback;
- localhost and preview → deterministic environment or route override.

Centralize host resolution. Do not scatter `window.location.hostname` checks.

Add unit and end-to-end tests.

Do not claim `rcmnd.asita.ai` is live until DNS and Vercel attachment are verified.

---

## 9. Data and persistence rules

### Existing Daler OS

Do not migrate or reinterpret current day, week, deals, settings, or forecast records during RCMND foundation work.

### RCMND canonical records

Use normalized PostgreSQL or Supabase tables with migrations and constraints.

### Local storage

Use IndexedDB for:

- offline drafts;
- queued mutations;
- recent cache;
- upload queue metadata;
- non-sensitive UI state.

Do not use one browser state blob as canonical multi-user RCMND storage.

### Data conventions

- UUIDs;
- UTC timestamps plus source timezone;
- minor-unit money and ISO currency;
- explicit deletion state;
- provider references with source and freshness;
- reversible merge history;
- idempotent jobs.

---

## 10. Domain implementation order

### Phase 0 — Integration foundation

Execute Task 00.

Outcomes:

- baseline and archive;
- quality scripts and CI;
- shared module registry;
- host and route resolver;
- disabled RCMND shell;
- environment validation;
- server-boundary decision record;
- database and migration foundation;
- fake providers;
- deny-by-default privacy interface;
- Phase 1 plan.

### Phase 1 — Private capture

Core entities:

- Profile;
- Place;
- Branch;
- Visit;
- Experience;
- Rating;
- Media;
- Visibility policy;
- Audit event.

Core journey:

1. authenticated user opens RCMND;
2. searches or creates exact branch;
3. records private visit;
4. adds sentiment and return intent;
5. optionally adds full restaurant or hotel detail;
6. uploads private photo;
7. sees the record in Journal;
8. sees repeat-visit history on Branch Detail;
9. another user cannot access the record.

### Phase 2 — Memory and retrieval

- structured filters;
- full-text search;
- Map and list alternative;
- Trips;
- semantic retrieval;
- Ask over own authorized records;
- evidence cards;
- voice extraction behind confirmation;
- AI artifact provenance.

### Phase 3 — Deterministic recommendations

- request context;
- candidate generation;
- hard filters;
- versioned scoring;
- confidence;
- evidence bundle;
- feedback;
- non-generative explanation template;
- optional AI explanation only after validation.

### Phase 4 — Controlled sharing

- collections and guides;
- relationships and circles;
- field inclusion policy;
- media derivatives;
- share preview;
- expiry;
- revocation;
- cross-user tests.

### Phase 5 — Friend-aware recommendation

- authorized friend evidence;
- category trust;
- similarity;
- own versus friend labels;
- no retroactive access.

### Phase 6 — Imports

- calendar;
- reservations;
- photos;
- receipts;
- approved location history;
- review queue;
- confirmation before canonical history.

### Phase 7 — Scale and commercial model

- advanced offline sync;
- push;
- share extension;
- native decision;
- subscription and storage model;
- concierge and white-label evaluation.

---

## 11. Domain contracts

### Place provider

```ts
interface PlaceProvider {
  search(input: PlaceSearchInput): Promise<PlaceCandidate[]>;
  getDetails(ref: ProviderPlaceReference): Promise<ProviderPlaceDetails | null>;
}
```

### Storage provider

```ts
interface StorageProvider {
  createUploadIntent(input: CreateUploadIntent): Promise<UploadIntent>;
  createDownloadUrl(input: CreateDownloadUrl): Promise<SignedResource>;
  deleteObject(input: DeleteObject): Promise<void>;
}
```

### Actor

```ts
interface ActorContext {
  userId: string | null;
  roles: string[];
  isService: boolean;
}
```

### Privacy policy

```ts
interface PrivacyPolicyEvaluator {
  canRead(input: PolicyInput): Promise<PolicyDecision>;
  canWrite(input: PolicyInput): Promise<PolicyDecision>;
  redact(input: RedactionInput): Promise<RedactedResource>;
}
```

### AI provider

Use a server-only adapter with structured output and provenance. Do not add production methods before their active task defines input, output, redaction, and evaluation schemas.

---

## 12. Privacy implementation contract

Minimum actors:

- anonymous;
- owner;
- explicitly shared recipient;
- circle member;
- connected friend without share;
- blocked user;
- service role;
- support role.

Minimum protected resources:

- Visit;
- Experience;
- private journal;
- companion;
- spend and reservation;
- media original;
- media derivative;
- Collection;
- Share;
- AI artifact;
- recommendation evidence;
- audit event.

Default is deny.

A privacy defect requires a regression test.

---

## 13. AI implementation contract

Pipeline:

`Authorize → Retrieve → Redact → Generate → Validate Schema → Validate Evidence → Reapply Policy → Render`

Rules:

- server-side calls only;
- no service key in client;
- structured outputs;
- prompt versioning;
- evidence IDs;
- no fabricated visits or ratings;
- AI does not overwrite user truth;
- manual workflow remains usable;
- inaccessible citations are rejected;
- model is not hard-filter or scoring engine;
- no random mock AI in production paths.

---

## 14. UI and UX rules

- mobile capture is primary;
- quick capture target under 30 seconds;
- photo-first Journal cards;
- visible private status;
- explicit source badges;
- separate user, friend, AI, and external data;
- real loading, empty, offline, and error states;
- drafts recover;
- actionable errors;
- keyboard and screen-reader support;
- adequate contrast and touch targets;
- map has list alternative;
- no public-feed-first design.

---

## 15. Testing requirements

### Unit

Host resolution, flags, normalization, privacy, redaction, timezone, scoring, confidence.

### Integration

Visit creation, repeat visits, media access, user isolation, sharing, revocation, imports, deletion.

### End-to-end

Daler OS smoke, module switching, RCMND capture, Journal, Branch Detail, Ask, recommendation constraints, share preview.

### AI evaluations

Fabrication, branch resolution, evidence validity, privacy leakage, constraint compliance, recommendation explanation.

### Migration

Empty database to current schema and rollback where supported.

---

## 16. Documentation rules

Update documentation when changing:

- product behavior;
- module boundary;
- database schema;
- API contract;
- hostname or deployment;
- privacy;
- AI prompt or output schema;
- recommendation weights;
- provider choice;
- import behavior;
- deletion and export.

Create an ADR for material decisions, not trivial implementation details.

---

## 17. Task completion report

Every task report must contain:

### Summary

### Scope and non-scope

### Files changed

### Shared Daler OS impact

### Database and migrations

### Privacy and permission impact

### Tests and exact results

### Lint, typecheck, build, and e2e results

### Reproduction steps

### Deployment impact

### Known limitations

### Follow-up task

### Rollback path

Do not claim success for commands not run or infrastructure not verified.

---

## 18. Immediate execution instruction

```text
Execute docs/rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md only.

Read AGENTS.md and all required RCMND documents first. Inspect and verify the
existing Daler OS repository before changing shared routing, persistence, PWA,
authentication, or navigation. Preserve the current SHA and establish a
reversible Asita module foundation.

Do not build broad place, visit, media, AI, social, import, or recommendation
features in Task 00. Do not create a separate RCMND repository or code fork.
Run every required command and report exact results, limitations, deployment
status, privacy impact, and rollback steps.
```

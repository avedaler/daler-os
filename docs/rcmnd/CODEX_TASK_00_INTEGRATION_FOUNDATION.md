# Codex Task 00 — Preserve Daler OS and Establish the RCMND Integration Foundation

**Task type:** Repository and platform foundation  
**Priority:** P0  
**Execution order:** First  
**Broad RCMND product development:** Out of scope  
**Canonical hostname:** `rcmnd.asita.ai`  
**Fallback route:** `/rcmnd`

---

## 1. Objective

Create a reproducible, testable, reversible foundation for RCMND inside Asita Daler OS without breaking the existing application.

At completion:

- current Daler OS behavior is preserved and documented;
- an archive or rollback reference exists;
- quality commands and CI exist;
- the existing application still builds and passes smoke tests;
- a central Asita module registry exists;
- deterministic host and route resolution exists;
- RCMND has a disabled-by-default shell boundary;
- environment configuration is validated;
- database, provider, privacy, logging, and server-boundary foundations are documented or minimally scaffolded;
- a Phase 1 private-capture plan exists;
- no broad RCMND feature set has been built.

---

## 2. Required reading

Before modifying code, read:

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/rcmnd/README.md`
4. `docs/rcmnd/RCMND_FOUNDER_THREAD_AND_HISTORY.md`
5. `docs/rcmnd/RCMND_MASTER_PRODUCT_SPEC.md`
6. `docs/rcmnd/RCMND_INTEGRATION_ARCHITECTURE.md`
7. `docs/rcmnd/ADR_001_NAME_DOMAIN_AND_MODULE_BOUNDARY.md`
8. `docs/rcmnd/ADR_002_PRIVATE_DATA_SHARING_AND_AI_PROVENANCE.md`
9. `docs/rcmnd/CODEX_MASTER_INSTRUCTION.md`
10. current package files, Vite configuration, PWA configuration, App shell, storage, cloud sync, lock, notification, and deployment files

Inspect before coding.

---

## 3. Scope

### In scope

- baseline audit;
- archive and rollback record;
- quality scripts;
- test framework;
- CI;
- environment validation;
- Asita module registry;
- hostname and route resolution;
- feature flags;
- minimal RCMND shell;
- Daler OS wrapper only where needed;
- shared auth boundary documentation or adapter;
- database and migration tooling foundation;
- server-boundary decision and safe placeholder;
- place, storage, AI, privacy, logging, and offline interfaces with deterministic fake adapters where immediately useful;
- Phase 1 implementation plan;
- deployment instructions for `rcmnd.asita.ai` without falsely claiming DNS is live;
- README updates where required.

### Out of scope

- real place search;
- production place-provider contract;
- Visit or Experience CRUD;
- private media upload implementation;
- Map;
- semantic search;
- Ask RCMND;
- recommendation scoring;
- friends and circles;
- sharing;
- imports;
- public profiles;
- native application;
- payment or subscription work;
- major React, Vite, or framework upgrade;
- migration of Daler OS IndexedDB records;
- broad visual redesign;
- moving every existing file into a new folder.

---

## 4. Step 1 — Inspect and record the baseline

Run and record:

```bash
git status --short
git rev-parse HEAD
git log --oneline --decorate -15
node --version
npm --version
npm ci
npm run build
```

Also inspect:

- all package scripts and lockfile;
- current route and tab behavior;
- `src/App.jsx`;
- current component tree;
- `src/lib/store.js`;
- `src/lib/cloud.js`;
- `src/lib/lock.js`;
- `src/lib/notify.js`;
- `src/lib/export.js`;
- Vite PWA configuration and service worker behavior;
- existing environment variables;
- current Vercel assumptions;
- generated build output;
- current accessibility and build warnings;
- committed secrets or unsafe configuration;
- current cloud configuration and SQL instructions;
- whether the application can run without Supabase configured.

Manually or through browser automation verify:

- lock screen;
- Today;
- date navigation;
- Deals;
- Overview;
- More;
- Forecast;
- Settings;
- IndexedDB save and reload;
- offline shell where practical;
- application build;
- PWA manifest generation.

Create:

`docs/audits/RCMND_TASK_00_DALER_OS_BASELINE.md`

The audit must contain:

- starting SHA;
- branch;
- command results before changes;
- route and screen inventory;
- persistence inventory;
- cloud and auth inventory;
- PWA inventory;
- deployment inventory;
- known warnings and limitations;
- privacy and security findings;
- archive status;
- before and after results kept separately.

Do not rewrite failed baseline results after fixing them.

---

## 5. Step 2 — Preserve the current repository state

Create, when permissions permit:

- tag: `asita-daler-os-pre-rcmnd-foundation-2026-08-11`
- optional branch: `archive/pre-rcmnd-foundation`

Both should point to the pre-Task-00 implementation commit.

If remote creation is unavailable:

- create local references where possible;
- record exact commands for the owner;
- record the SHA;
- do not falsely claim remote archive creation.

Do not delete existing Daler OS files or routes in this task.

---

## 6. Step 3 — Establish quality commands

The repository must expose:

```json
{
  "lint": "...",
  "typecheck": "...",
  "test": "...",
  "test:watch": "...",
  "test:e2e": "...",
  "build": "vite build"
}
```

Recommended baseline:

- ESLint;
- TypeScript compiler or `checkJs` for typed boundaries;
- Vitest;
- React Testing Library;
- Playwright.

The project can remain incrementally JavaScript-first. Do not convert the whole app to TypeScript in this task.

Add at minimum:

1. deterministic unit tests for module resolution and feature flags;
2. a component test for the RCMND disabled state or shared shell;
3. a Daler OS smoke test;
4. a Playwright test for `/rcmnd` or host override behavior;
5. a test proving no legacy Daler data is reinterpreted as RCMND data.

Remove randomness from tests. Do not depend on external services.

---

## 7. Step 4 — Add CI

Create:

`.github/workflows/ci.yml`

The workflow should:

- run on pull requests and pushes to the main branch;
- use Node compatible with the project and Vercel settings;
- install with `npm ci`;
- run lint;
- run typecheck;
- run unit and component tests;
- run production build;
- run a lightweight browser smoke test when practical;
- use deterministic fake providers;
- require no production secret;
- fail clearly.

Do not print secrets or private fixture data.

---

## 8. Step 5 — Add typed or validated environment configuration

Create or update:

- `.env.example`;
- a central environment reader such as `src/app/env.js` or `src/lib/config/env.js`;
- tests for provider-dependent requirements.

Recommended variables:

```text
VITE_ASITA_DEFAULT_MODULE=daler
VITE_RCMND_ENABLED=false
VITE_DALER_HOST=daler.asita.ai
VITE_RCMND_HOST=rcmnd.asita.ai
VITE_ASITA_APP_URL=http://localhost:5173
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
RCMND_DATABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RCMND_SERVER_PROVIDER=fake
RCMND_PLACE_PROVIDER=fake
RCMND_STORAGE_PROVIDER=fake
RCMND_AI_PROVIDER=fake
OPENAI_API_KEY=
OPENAI_MODEL=
SENTRY_DSN=
```

Rules:

- browser-safe values alone may use `VITE_`;
- service-role and AI keys must never be exposed to the client bundle;
- production startup or server function should fail clearly when a real provider is selected without credentials;
- local tests use fake providers;
- no real secret is committed;
- document client and server variables separately.

If the current Vite-only architecture cannot safely consume server secrets, record and scaffold the chosen secure server boundary rather than exposing them.

---

## 9. Step 6 — Create the Asita module registry

Create a minimal central module definition.

Example shape:

```js
export const ASITA_MODULES = {
  daler: {
    id: "daler",
    label: "Daler OS",
    canonicalHost: "daler.asita.ai",
  },
  rcmnd: {
    id: "rcmnd",
    label: "RCMND",
    canonicalHost: "rcmnd.asita.ai",
    enabledFlag: "rcmnd",
  },
};
```

Requirements:

- no dependency on remote services;
- one source of truth;
- test coverage;
- no duplicate module lists across components;
- current Daler OS remains the default.

Do not create a general plugin platform beyond current needs.

---

## 10. Step 7 — Implement deterministic host and route resolution

Create a central resolver.

Resolution priority should be documented and tested, for example:

1. explicit development override;
2. canonical hostname;
3. `/rcmnd` path fallback;
4. configured default module;
5. safe Daler fallback.

Test:

- `daler.asita.ai`;
- `rcmnd.asita.ai`;
- localhost root;
- localhost `/rcmnd`;
- Vercel preview hostname with explicit override;
- unknown hostname;
- disabled RCMND flag.

Do not scatter hostname checks in React components.

---

## 11. Step 8 — Add a minimal RCMND shell

Create a minimal, truthful RCMND screen.

It may include:

- RCMND by Asita identity;
- tagline;
- private-by-default explanation;
- development status;
- implemented links only;
- navigation back to Daler OS;
- no fake visits, recommendations, ratings, or personal history.

Behavior:

- disabled by default;
- enabled only through central feature flag;
- `/rcmnd` handles disabled state clearly;
- Daler OS remains unchanged at root;
- no redirect of all production traffic.

The shell is a boundary test, not the product implementation.

---

## 12. Step 9 — Preserve Daler OS within the module boundary

Create a wrapper only if required by the module registry.

Requirements:

- existing state and component behavior preserved;
- no data migration;
- no change to storage keys;
- no forced account creation;
- no visual redesign;
- no loss of lock, notifications, exports, Forecast, Deals, or Today.

Add regression tests for the shared shell.

---

## 13. Step 10 — Establish shared auth boundary

The current cloud helper combines configuration, client creation, authentication, and key-value synchronization.

Task 00 should document and minimally prepare separation between:

- shared Asita authentication;
- existing Daler key-value sync;
- future RCMND repositories and policies.

Possible minimum deliverables:

- `src/lib/auth/actor.js`;
- a shared Supabase client factory for browser-safe authentication;
- no service-role key in client;
- current cloud behavior preserved;
- tests for anonymous and authenticated actor representation.

Do not rewrite all current synchronization logic.

---

## 14. Step 11 — Establish database and migration foundation

Use PostgreSQL or Supabase-compatible PostgreSQL.

Recommended tooling may be Drizzle, Supabase migrations, or another accepted solution. Record the choice in an ADR.

Task 00 should create:

- migration directory;
- migration commands;
- local development instructions;
- CI migration validation;
- safe test database or repository adapter;
- no production credentials;
- an empty baseline migration or minimal schema metadata only.

Do not build the complete RCMND schema in Task 00.

Document how future tables will remain separate from `daleros_kv`.

---

## 15. Step 12 — Establish secure server boundary

RCMND requires server-side operations for:

- database authorization;
- service-role operations;
- signed media URLs;
- AI calls;
- provider secrets;
- recommendation runs;
- audit events.

Task 00 must select or document the initial boundary, such as:

- Vercel Functions;
- Supabase Edge Functions;
- a dedicated API service.

Create an ADR when a decision is made.

A minimal health endpoint or fake provider boundary is acceptable.

Do not expose secrets to Vite client code.

---

## 16. Step 13 — Add minimal provider interfaces and fake adapters

Create only immediately useful boundaries.

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

### AI provider

Task 00 needs only a health or availability boundary. Do not add unvalidated production generation methods.

### Fake adapters

- deterministic;
- no network calls;
- safe fixture data;
- explicit fake-provider label;
- tests.

Avoid dozens of unused files.

---

## 17. Step 14 — Add deny-by-default privacy interface

Create a minimal policy evaluator that denies protected RCMND access unless explicitly allowed.

Task 00 does not need the final sharing model, but must establish:

- actor input;
- resource input;
- action;
- allow or deny decision;
- reason code;
- optional redaction boundary;
- tests for anonymous, owner, and non-owner.

Do not rely on UI hiding.

Do not apply RCMND rules to existing Daler data without an explicit migration task.

---

## 18. Step 15 — Logging and observability conventions

Create or document:

- structured logger boundary;
- request or correlation ID;
- safe error reporting;
- provider health convention;
- audit-event contract;
- forbidden log fields.

Never log:

- passwords;
- service keys;
- signed URLs;
- raw private journals;
- exact companion data;
- unredacted AI evidence.

Do not implement a full analytics platform.

---

## 19. Step 16 — Deployment and domain plan

Document:

- current Vercel project and `daler.asita.ai` behavior;
- preferred single-project, multi-domain approach;
- acceptable same-repository transitional deployment;
- required environment variables;
- preview override;
- DNS and Vercel custom-domain steps for `rcmnd.asita.ai`;
- verification checklist;
- rollback.

Do not state that `rcmnd.asita.ai` is live until it is actually resolved, attached, and serving the intended build.

Do not configure an unrelated independent codebase.

---

## 20. Step 17 — PWA impact record

Inspect the current manifest and service-worker configuration.

Create an ADR or plan covering:

- one Asita manifest versus module-specific manifests;
- start URL behavior;
- install behavior from each hostname;
- cache isolation;
- current Daler PWA preservation.

Task 00 should avoid a broad PWA redesign unless required to keep the build correct.

---

## 21. Step 18 — Create Phase 1 implementation plan

Create:

`docs/plans/RCMND_PHASE_1_PRIVATE_CAPTURE_PLAN.md`

Decompose Task 01 into reviewable pull requests.

Recommended sequence:

1. shared actor and database core;
2. Place and Branch schema and manual provider;
3. Visit and private authorization;
4. Experience and rating dimensions;
5. private media metadata and upload;
6. Journal and Branch Detail;
7. repeat visits and privacy hardening;
8. end-to-end founder dogfood flow.

For each pull request include:

- scope;
- schema;
- API or server actions;
- UI;
- shared-shell impact;
- privacy;
- tests;
- feature flag;
- deployment;
- rollback.

---

## 22. Required deliverables

Task 00 must produce equivalent deliverables for:

- baseline audit;
- archive record;
- lint, typecheck, unit, build, and e2e scripts;
- CI workflow;
- `.env.example`;
- environment validator;
- module registry;
- host resolver;
- feature flags;
- minimal RCMND shell;
- Daler OS regression tests;
- shared actor boundary;
- database and migration setup;
- secure server-boundary ADR or scaffold;
- deterministic fake providers;
- deny-by-default privacy interface;
- safe logging convention;
- deployment and domain plan;
- PWA impact plan;
- Phase 1 pull-request plan;
- updated setup documentation.

---

## 23. Acceptance criteria

Task 00 is complete only when:

1. starting SHA is documented;
2. archive status is truthful;
3. `npm ci` passes;
4. `npm run lint` passes without newly ignored errors;
5. `npm run typecheck` passes;
6. `npm test` passes;
7. `npm run build` passes;
8. `npm run test:e2e` has a passing smoke test or a precise documented platform limitation and CI-ready setup;
9. CI runs without production secrets;
10. Daler OS remains functional;
11. existing storage keys are preserved;
12. RCMND is disabled by default;
13. host and route resolution is tested;
14. no mock personal history is presented as real;
15. server secrets are absent from client code;
16. database migration tooling is reproducible;
17. fake providers are deterministic;
18. privacy policy denies by default;
19. the domain plan does not falsely claim a live hostname;
20. Phase 1 has a reviewable plan;
21. rollback steps are documented;
22. no broad RCMND feature work leaked into the task.

---

## 24. Required privacy review

Verify:

- no private founder data is added to fixtures;
- no service-role key is browser-visible;
- RCMND does not use localStorage as canonical private multi-user storage;
- fake providers cannot call production;
- disabled shell exposes no mock history;
- policy denies non-owner access;
- logs exclude sensitive values;
- current Daler data is not silently copied into RCMND.

---

## 25. Rollback plan

Minimum rollback:

- keep `VITE_RCMND_ENABLED=false`;
- revert Task 00 commits;
- restore package and Vite configuration from archive SHA;
- remove module resolution while preserving original App entry;
- retain existing IndexedDB keys;
- no irreversible RCMND user schema because full domain migrations are out of scope;
- retain current Daler Vercel deployment.

Document exact commands and references.

---

## 26. Completion report format

Return:

### Summary

### Baseline before and after

### Archive status

### Files changed

### Shared Daler OS impact

### Module and host behavior

### Database and migrations

### Server boundary

### Privacy impact

### Tests with exact results

### Lint, typecheck, build, and e2e results

### Deployment and domain status

### Reproduction steps

### Known limitations

### First Phase 1 pull request

### Rollback

---

## 27. Codex execution prompt

```text
Execute docs/rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md only.

Read AGENTS.md and all required Asita RCMND documents first. Inspect the current
Daler OS implementation before modifying shared shell, routing, PWA, IndexedDB,
Supabase, lock, notifications, or deployment. Record and preserve the starting
SHA, run the complete baseline, and keep the existing application functional.

Establish a reversible module registry, deterministic host and route resolver,
disabled-by-default RCMND shell, complete quality command surface, CI, validated
environment configuration, database and migration foundation, secure server
boundary, deterministic fake providers, deny-by-default privacy interface,
deployment/domain plan, and Phase 1 pull-request plan.

Do not build broad Place, Visit, Experience, media, AI, recommendation, social,
sharing, or import features. Do not create a separate RCMND repository or code
fork. Run every required command and report exact results, limitations, privacy
impact, domain status, and rollback steps.
```

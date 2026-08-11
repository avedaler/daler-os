# RCMND by Asita — Integration Architecture

**Repository:** `avedaler/daler-os`  
**Parent system:** Asita Daler OS  
**Canonical hostname:** `rcmnd.asita.ai`  
**Fallback route:** `/rcmnd`  
**Status:** Target architecture and migration constraints

---

## 1. Architectural objective

Integrate RCMND into the existing Daler OS repository as a first-class Asita module without breaking the current personal operating system or creating a disconnected product fork.

The architecture must support two coherent entry points:

- `daler.asita.ai` for Daler OS;
- `rcmnd.asita.ai` for RCMND.

Both entry points should resolve into one canonical codebase, shared identity, shared design system, shared deployment discipline, and deliberate module boundaries.

RCMND-specific domain data, privacy policies, and business logic must remain explicit and normalized.

---

## 2. Current Daler OS reality

The current repository uses:

- Vite;
- React 18;
- JavaScript and JSX;
- Vite PWA;
- IndexedDB through `idb-keyval`;
- optional Supabase email authentication and cloud synchronization;
- one client application shell;
- a lock screen;
- local notifications;
- export helpers;
- a responsive mobile-oriented interface;
- a Vercel deployment under `daler.asita.ai`.

The current primary surfaces include:

- Today;
- Deals;
- Overview;
- More;
- Forecast;
- Settings;
- lock screen;
- print and export views.

The existing cloud layer synchronizes selected key-value records to a Supabase table. This is acceptable for current Daler OS data but is not the correct canonical model for a multi-user RCMND experience graph.

---

## 3. Non-negotiable no-fork rule

Do not create:

- a second long-lived repository;
- a separate design system;
- duplicate authentication;
- duplicate user settings;
- duplicate analytics and logging foundations;
- disconnected PWA behavior;
- a second manual configuration mechanism for the same Supabase identity;
- a new application that cannot navigate back into Asita.

A separate domain or Vercel alias is an entry point, not a reason for architectural duplication.

---

## 4. Recommended transition strategy

Do not rewrite Daler OS into a new framework in one operation.

Use an incremental module boundary.

### Step A — preserve and verify

- record the current SHA;
- create an archive tag or branch;
- verify existing build and core flows;
- add tests before changing shared shell behavior.

### Step B — introduce a module registry

Create a small shared application layer that resolves the active module from:

1. explicit development override;
2. hostname;
3. path fallback;
4. default module.

### Step C — preserve existing screens as the Daler module

Existing behavior may initially remain in place while the registry treats it as the `daler` module.

Do not mechanically move every file before the boundary is proven.

### Step D — add an isolated RCMND shell

Add a disabled-by-default RCMND route and hostname boundary containing no fake personal data.

### Step E — build vertical slices

Add real RCMND capabilities through small, tested slices while keeping Daler OS operational.

---

## 5. Target application organization

Directional structure:

```text
src/
  app/
    moduleRegistry.js
    hostResolver.js
    featureFlags.js
    AsitaShell.jsx
    navigation.js
  modules/
    daler/
      DalerModule.jsx
    rcmnd/
      RcmndModule.jsx
      routes/
      components/
      domain/
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
```

Do not create empty architecture for appearance. Each addition must serve the active task.

---

## 6. Host and route resolution

### 6.1 Required behavior

- `daler.asita.ai` → Daler OS module
- `rcmnd.asita.ai` → RCMND module
- `localhost` → default Daler module unless a query, environment, or path override is provided
- `/rcmnd` → RCMND fallback route
- unknown Asita host → safe module chooser or Daler default, according to the accepted host-resolution ADR

### 6.2 Suggested resolver contract

```js
export function resolveAsitaModule({ hostname, pathname, override }) {
  // returns "daler" | "rcmnd"
}
```

Rules:

- deterministic;
- unit tested;
- no network dependency;
- no direct hostname checks scattered across components;
- preview and local hosts supported;
- feature flag evaluated centrally.

### 6.3 Feature flags

Suggested values:

```text
VITE_RCMND_ENABLED=false
VITE_ASITA_DEFAULT_MODULE=daler
VITE_RCMND_HOST=rcmnd.asita.ai
```

The first implementation should leave RCMND disabled by default until the shell and tests are stable.

---

## 7. Shared Asita shell

The shared shell may provide:

- identity and account menu;
- module switching;
- common typography and tokens;
- shared toast and error handling;
- network and sync status;
- global lock behavior where appropriate;
- shared settings entry;
- consistent mobile navigation frame;
- accessibility foundation.

The shell must not force Daler OS and RCMND to use identical navigation structures if their jobs differ.

Recommended approach:

- shared top-level Asita identity;
- module-specific primary navigation;
- explicit switcher between Daler and RCMND;
- consistent visual grammar.

---

## 8. Identity and authentication

### 8.1 Shared identity

RCMND should use the same authenticated Asita user identity as Daler OS.

The existing Supabase client configuration can be evolved into a shared auth service.

Avoid requiring users to configure the same Supabase URL and key separately for each module.

### 8.2 Actor context

Introduce a shared actor abstraction:

```ts
interface ActorContext {
  userId: string | null;
  roles: string[];
  isService: boolean;
  sessionId?: string;
}
```

JavaScript may be used initially, but public boundaries should be validated and documented. A later TypeScript migration may be performed incrementally, not as an unrelated rewrite.

### 8.3 Authorization versus authentication

Authentication identifies the user.

Authorization decides whether the actor can read, write, share, export, or delete a resource.

Supabase row-level security should be used as defense in depth, not as the only authorization logic.

---

## 9. Data architecture

### 9.1 Existing Daler OS data

Existing Daler OS data may continue in:

- IndexedDB;
- the current `daleros_kv` synchronization table;
- current export format.

Do not silently migrate this data in RCMND Task 00.

### 9.2 RCMND canonical data

RCMND requires normalized PostgreSQL or Supabase tables.

Recommended initial tables:

- `profiles`;
- `places`;
- `branches`;
- `place_provider_refs`;
- `visits`;
- `experiences`;
- `experience_ratings`;
- `experience_tags`;
- `media_assets`;
- `media_links`;
- `visibility_policies`;
- `audit_events`.

Later tables:

- `trips`;
- `collections`;
- `collection_items`;
- `relationships`;
- `circles`;
- `circle_members`;
- `shares`;
- `share_fields`;
- `recommendation_runs`;
- `recommendation_candidates`;
- `recommendation_feedback`;
- `preference_signals`;
- `preference_hypotheses`;
- `ai_artifacts`;
- `imports`;
- `provider_sync_state`.

### 9.3 Database requirements

- UUID primary keys;
- explicit migrations;
- foreign keys;
- constraints;
- timestamps in UTC;
- source timezone preserved;
- minor-unit money fields and ISO currency;
- soft-delete or deletion-state policy where required;
- auditable merge history;
- geospatial support when Map and radius search are introduced;
- vector support when semantic retrieval is introduced.

### 9.4 Provider independence

External place IDs are references, not canonical primary keys.

The internal Branch ID remains stable even if provider mappings change.

---

## 10. Offline and synchronization architecture

### 10.1 Local-first capture

IndexedDB is appropriate for:

- unfinished drafts;
- queued mutations;
- upload queue metadata;
- recent local cache;
- non-sensitive UI preferences;
- provider search cache with expiry.

### 10.2 Canonical server state

Confirmed RCMND multi-user records belong in the database.

### 10.3 Sync requirements

- idempotent mutation IDs;
- explicit sync state;
- retries with backoff;
- conflict detection;
- no silent text loss;
- media upload resumability;
- offline creation with later server ID reconciliation;
- deletion propagation;
- logout cache policy.

### 10.4 Conflict policy

Avoid global last-write-wins for complex experiences.

At minimum:

- preserve the user's local draft;
- show a recoverable conflict;
- merge independent fields safely;
- never overwrite private journal text silently.

---

## 11. Media architecture

### 11.1 Storage classes

- private original;
- normalized display derivative;
- thumbnail;
- share-safe derivative;
- audio transcript artifact;
- document preview.

### 11.2 Required controls

- private buckets or equivalent;
- ownership checks;
- short-lived signed URLs;
- metadata stripping;
- file type and size validation;
- malicious-file controls;
- idempotent processing;
- deletion queue;
- orphan cleanup;
- share revocation support.

### 11.3 Privacy rule

Media may be more restrictive than its parent experience.

Original EXIF and precise location metadata must not be exposed in shared derivatives.

---

## 12. Place and map provider architecture

Use an adapter rather than provider calls inside UI components.

Suggested contract:

```ts
interface PlaceProvider {
  search(input: PlaceSearchInput): Promise<PlaceCandidate[]>;
  getDetails(ref: ProviderPlaceReference): Promise<ProviderPlaceDetails | null>;
}
```

Store:

- provider;
- provider place ID;
- fetched time;
- fields returned;
- match confidence;
- attribution metadata;
- expiry or freshness.

The product must support manual branch creation when the provider cannot resolve a place.

---

## 13. Privacy and authorization architecture

### 13.1 Central policy evaluator

Create one policy layer rather than embedding permission rules in components.

Suggested contract:

```ts
interface PrivacyPolicyEvaluator {
  canRead(input: PolicyInput): Promise<PolicyDecision>;
  canWrite(input: PolicyInput): Promise<PolicyDecision>;
  redact(input: RedactionInput): Promise<RedactedResource>;
}
```

### 13.2 Default deny

Every protected resource is denied unless an explicit ownership or sharing rule permits it.

### 13.3 Field-level redaction

The policy layer must support hiding:

- exact time;
- companions;
- spend;
- reservations;
- receipts;
- private journal;
- room or table detail;
- media original;
- precise location;
- private AI evidence.

### 13.4 Audit events

Record sensitive operations such as:

- share creation;
- share access;
- revocation;
- export;
- account deletion;
- admin support access;
- policy denial where useful;
- AI generation involving private evidence.

Logs must not contain raw private content unless explicitly designed and secured.

---

## 14. AI architecture

### 14.1 Provider boundary

Use a server-side AI adapter.

Do not put API secrets in the Vite client.

The current static front-end deployment will therefore need a secure server boundary, such as:

- Vercel Functions;
- Supabase Edge Functions;
- a dedicated Asita API service;
- another accepted server runtime.

The chosen boundary must be recorded in an ADR before production AI calls.

### 14.2 AI pipeline

`Authorize → Retrieve Evidence → Redact → Call Model → Validate Schema → Validate Citations → Apply Policy → Render`

### 14.3 AI artifact metadata

Store:

- provider;
- model;
- prompt version;
- schema version;
- evidence IDs;
- input hash;
- actor;
- created time;
- redaction policy;
- user acceptance or correction.

### 14.4 No model-only decisions

The model is not responsible for:

- authorization;
- hard constraints;
- exact geospatial calculations;
- deterministic score calculation;
- canonical user truth;
- share-policy enforcement.

---

## 15. Recommendation architecture

### 15.1 Server-side deterministic core

Recommendation scoring should be implemented in a testable domain service.

### 15.2 Versioned run

Every recommendation run records:

- request context;
- actor;
- candidate source;
- hard-filter decisions;
- feature values;
- weights;
- total score;
- confidence;
- evidence IDs;
- algorithm version;
- feedback.

### 15.3 AI explanation after ranking

The model may explain ranked results, but cannot add a candidate that failed hard constraints or cite inaccessible evidence.

---

## 16. Server and API boundary

The existing Vite application is client-oriented. RCMND requires secure server operations.

Recommended request flow:

`UI → authenticated server endpoint → validation → authorization → domain service → repository → database`

Potential endpoint groups:

- `/api/rcmnd/places`;
- `/api/rcmnd/visits`;
- `/api/rcmnd/experiences`;
- `/api/rcmnd/media`;
- `/api/rcmnd/search`;
- `/api/rcmnd/recommendations`;
- `/api/rcmnd/shares`.

Do not expose service-role keys to the browser.

---

## 17. Deployment architecture

### 17.1 Current state

Daler OS is deployed through Vercel and has the custom domain `daler.asita.ai`.

### 17.2 Target behavior

The same repository should support RCMND through one of these accepted patterns:

#### Preferred initial pattern

One Vercel project, one build, hostname-based module resolution, and both custom domains attached.

#### Acceptable transitional pattern

Two Vercel projects connected to the same repository and branch, with environment-controlled default module, while sharing the same backend and avoiding code forks.

The preferred pattern should be attempted first unless platform constraints justify the transitional pattern.

### 17.3 Domain work

The documentation establishes `rcmnd.asita.ai` as canonical.

Actual DNS and Vercel domain attachment require infrastructure access and must be performed during a deployment task. Documentation must not falsely claim the domain is live before verification.

### 17.4 Preview deployments

Preview deployments must support module override without relying on the production hostname.

---

## 18. PWA architecture

The existing PWA manifest is Daler OS-specific.

Options:

- one Asita PWA with module-aware launch behavior;
- separate generated manifests for Daler and RCMND entry points;
- a later native shell.

Task 00 should document the decision but avoid a large PWA redesign.

At minimum, RCMND must not break existing Daler OS installation and service-worker behavior.

---

## 19. Shared design system

Reuse the existing visual language where appropriate:

- dark premium palette;
- typography hierarchy;
- rules and separators;
- chips;
- compact mobile interactions;
- clear status language.

RCMND will also need:

- photo-first cards;
- map and list views;
- rating controls;
- privacy indicators;
- evidence badges;
- share preview;
- media gallery;
- structured capture forms.

Create reusable primitives rather than copying inline style blocks across modules.

Do not force a full design-system rewrite in Task 00.

---

## 20. Observability

Required foundations:

- structured error reporting;
- request correlation ID;
- safe application logs;
- job status;
- provider health;
- upload processing status;
- audit events;
- privacy-safe product analytics;
- AI evaluation metrics.

Never log:

- passwords;
- service keys;
- signed URLs;
- raw private journal text;
- exact companion details;
- complete AI prompts containing unredacted private records.

---

## 21. Testing strategy

### Unit

- host resolution;
- feature flags;
- place normalization;
- branch deduplication;
- rating validation;
- privacy decisions;
- redaction;
- timezone conversion;
- recommendation scoring;
- evidence confidence.

### Integration

- create visit and experience;
- repeat visit;
- user isolation;
- media ownership;
- share creation and revocation;
- import confirmation;
- deletion;
- migration.

### End-to-end

- existing Daler OS smoke;
- module switching;
- RCMND capture;
- Journal;
- branch history;
- Ask with evidence;
- recommendation hard constraints;
- selective sharing.

### AI evaluations

- no fabricated visit;
- branch resolution;
- citation validity;
- privacy leakage;
- hard-constraint compliance;
- recommendation explanation consistency.

---

## 22. Migration from IntelFlow

### Preserve

- history documents;
- product principles;
- evidence and confidence concepts;
- Ask interaction patterns;
- collection and timeline ideas;
- prediction framework as a later layer.

### Do not directly migrate as domain truth

- mock signals;
- mock assumptions;
- mock agents;
- mock analytics;
- executive watchlists;
- localStorage state;
- random run history;
- keyword-only Ask results.

### Repository status

`avedaler/intelflow` becomes a historical reference.

All new implementation decisions belong in `avedaler/daler-os/docs/rcmnd` and the Daler OS codebase.

---

## 23. Architecture decision gates

Codex must stop for founder or architecture confirmation when deciding:

- production server runtime;
- place provider contract;
- PWA manifest strategy;
- public sharing;
- delegated assistant access;
- native app commitment;
- paid storage architecture;
- migration of existing Daler OS cloud data;
- major framework migration.

---

## 24. Immediate architecture task

Execute:

`docs/rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md`

The task must create a reversible module boundary and quality foundation. It must not build the broad RCMND product or rewrite Daler OS.

# IntelFlow → RCMND by Asita Migration Manifest

**Migration date:** 11 August 2026  
**Canonical destination:** `avedaler/daler-os`  
**Canonical module path:** `docs/rcmnd`  
**Canonical product:** RCMND by Asita  
**Canonical hostname:** `rcmnd.asita.ai`

---

## 1. Source repository record

Previous repository:

`avedaler/intelflow`

Original standalone IntelFlow prototype commit:

`dd1f7f4ecfda782140f6b056118d6ac610074e90`

IntelFlow documentation head at the time of migration:

`3115ed7c9f5303ea8e6f6a6492a11196140007e9`

The source repository is preserved as a historical implementation and documentation reference. It is not deleted and its mock prototype is not copied into Daler OS as production domain data.

---

## 2. Founder-thread material migrated

The following conversation decisions are now preserved in:

[`RCMND_FOUNDER_THREAD_AND_HISTORY.md`](./RCMND_FOUNDER_THREAD_AND_HISTORY.md)

Migrated context includes:

- the original topic-intelligence idea;
- the standalone executive-intelligence prototype;
- the prediction framework;
- the founder's place-memory and recommendation clarification;
- restaurant and hotel examples;
- photos, ratings, comments, insider tips, and good/bad experience requirements;
- Kuala Lumpur personal recommendation database use case;
- sharing with friends and users;
- private-by-default requirement;
- migration into Asita Daler OS;
- naming and domain decision.

---

## 3. Document mapping

| IntelFlow source | RCMND destination | Treatment |
|---|---|---|
| `AGENTS.md` | root `AGENTS.md` in Daler OS | Rewritten for Asita integration and no-fork rule |
| `docs/README.md` | `docs/rcmnd/README.md` | Replaced by canonical RCMND index |
| `docs/INTELFLOW_HISTORY_AND_CURRENT_STATE.md` | `RCMND_FOUNDER_THREAD_AND_HISTORY.md` | Expanded with founder conversation and Asita migration |
| `docs/INTELFLOW_V2_MASTER_PRODUCT_SPEC.md` | `RCMND_MASTER_PRODUCT_SPEC.md` | Renamed, consolidated, and adapted to Asita module architecture |
| `docs/CODEX_MASTER_BUILD_INSTRUCTION.md` | `CODEX_MASTER_INSTRUCTION.md` | Rewritten for existing Vite Daler OS repository and shared shell |
| `docs/CODEX_TASK_00_FOUNDATION.md` | `CODEX_TASK_00_INTEGRATION_FOUNDATION.md` | Replaced by Daler OS preservation and module-integration task |
| `docs/CODEX_TASK_01_CAPTURE_VERTICAL_SLICE.md` | `CODEX_TASK_01_PRIVATE_CAPTURE_VERTICAL_SLICE.md` | Adapted to shared Asita identity, deployment, and privacy foundations |
| IntelFlow product-pivot ADR | `ADR_001_NAME_DOMAIN_AND_MODULE_BOUNDARY.md` | Superseded by RCMND name, domain, and no-fork decision |
| IntelFlow architecture ADR | `RCMND_INTEGRATION_ARCHITECTURE.md` plus future implementation ADRs | Adapted from standalone Next.js assumptions to current Daler OS Vite architecture |
| IntelFlow privacy/AI ADR | `ADR_002_PRIVATE_DATA_SHARING_AND_AI_PROVENANCE.md` | Preserved and strengthened |
| Prediction framework thread | `RCMND_PREDICTION_AND_LEARNING_FRAMEWORK.md` | Preserved as later preference and recommendation-calibration layer |
| Standalone IntelFlow code | Source repository only | Historical UX reference; not canonical production code |
| IntelFlow mock signals and agents | Not migrated as user data | Explicitly rejected as RCMND domain truth |

---

## 4. Concepts preserved

- structured intelligence rather than an unfiltered feed;
- evidence and provenance;
- confidence and uncertainty;
- relevance;
- Ask as an interface;
- timelines;
- collections;
- source quality;
- prediction and invalidation;
- decision implications;
- explainable outputs.

These concepts are now applied to real personal experiences rather than executive news signals.

---

## 5. Concepts replaced

| Legacy concept | RCMND concept |
|---|---|
| Signal | Visit, Experience, recommendation evidence, or external place update |
| Topic | Place, Branch, city, Trip, or Collection |
| Company/person/topic watchlist | Wish list, followed place, trusted person, or saved context |
| Geography filter | City, neighborhood, Trip region, or radius |
| Trusted source | Direct experience, selected friend, imported evidence, or external provider |
| Morning Brief | Memory resurfacing and contextual recommendation home |
| Assumption | Preference Hypothesis |
| Confidence score | Evidence, retrieval, or recommendation confidence |
| Relevance score | Contextual personal-fit score |
| Agent | Background capture, enrichment, retrieval, media, or recommendation job |
| Saved signal | Collection, Guide, saved place, or recommendation |
| Export | Experience export, city Guide, recommendation card, or private share |

---

## 6. Material intentionally not moved as canonical behavior

- mock executive news;
- random agent runs;
- fake analytics;
- keyword-only Ask;
- localStorage signal state;
- company and policy-maker onboarding;
- mock confidence percentages;
- simulated findings;
- a separate IntelFlow user account;
- a separate design system;
- a separate long-lived repository.

The old implementation remains available for visual and historical reference.

---

## 7. New canonical files

- `AGENTS.md`
- `docs/README.md`
- `docs/rcmnd/README.md`
- `docs/rcmnd/RCMND_FOUNDER_THREAD_AND_HISTORY.md`
- `docs/rcmnd/RCMND_MASTER_PRODUCT_SPEC.md`
- `docs/rcmnd/RCMND_INTEGRATION_ARCHITECTURE.md`
- `docs/rcmnd/RCMND_PREDICTION_AND_LEARNING_FRAMEWORK.md`
- `docs/rcmnd/ADR_001_NAME_DOMAIN_AND_MODULE_BOUNDARY.md`
- `docs/rcmnd/ADR_002_PRIVATE_DATA_SHARING_AND_AI_PROVENANCE.md`
- `docs/rcmnd/CODEX_MASTER_INSTRUCTION.md`
- `docs/rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md`
- `docs/rcmnd/CODEX_TASK_01_PRIVATE_CAPTURE_VERTICAL_SLICE.md`
- this migration manifest.

---

## 8. Repository source-of-truth rule

After migration:

1. new RCMND features are developed only in `avedaler/daler-os`;
2. Codex starts with root `AGENTS.md`;
3. `docs/rcmnd/RCMND_MASTER_PRODUCT_SPEC.md` is the canonical product definition;
4. the old IntelFlow repository is read-only in product intent unless a later explicit founder decision reactivates it;
5. useful legacy patterns may be reimplemented, but legacy mock state is not imported as real history.

---

## 9. Domain and deployment status

The canonical hostname decision is complete:

`rcmnd.asita.ai`

This manifest does not claim that DNS or Vercel attachment is live. Domain activation requires a separate verified deployment action.

---

## 10. Immediate development action

Codex must execute:

`docs/rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md`

before broad RCMND implementation.

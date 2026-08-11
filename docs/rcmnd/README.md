# RCMND by Asita — Documentation Index

**Canonical product:** RCMND by Asita  
**Canonical subdomain:** `rcmnd.asita.ai`  
**Fallback route:** `/rcmnd`  
**Repository:** `avedaler/daler-os`  
**Legacy source project:** IntelFlow  
**Category:** Personal Experience Intelligence

## Product definition

RCMND is a private-first place memory, experience journal, contextual recommendation engine, and controlled sharing network.

It helps a user remember:

- where they have been;
- the exact branch or venue;
- what happened on each visit;
- what they liked and disliked;
- what they ordered, used, or experienced;
- who they were with;
- what practical inside information mattered;
- whether they would return;
- what they would recommend to another person.

It converts those memories into searchable, evidence-backed personal intelligence and selectively shareable recommendations.

## Core loop

`Capture → Enrich → Remember → Ask → Recommend → Share → Learn`

## Core domain distinction

`Place ≠ Branch ≠ Visit ≠ Experience ≠ Recommendation`

## Core trust rule

> No recommendation without evidence, no sharing without permission, and no AI claim without provenance.

## Read in this order

1. [`RCMND_FOUNDER_THREAD_AND_HISTORY.md`](./RCMND_FOUNDER_THREAD_AND_HISTORY.md) — migrated conversation context, product evolution, founder requirements, and final decisions.
2. [`RCMND_MASTER_PRODUCT_SPEC.md`](./RCMND_MASTER_PRODUCT_SPEC.md) — complete product definition, user journeys, domain model, recommendation logic, privacy, MVP, roadmap, and acceptance criteria.
3. [`RCMND_INTEGRATION_ARCHITECTURE.md`](./RCMND_INTEGRATION_ARCHITECTURE.md) — how RCMND fits into the existing Daler OS repository, identity, offline layer, Supabase, Vercel, and shared module architecture.
4. [`RCMND_PREDICTION_AND_LEARNING_FRAMEWORK.md`](./RCMND_PREDICTION_AND_LEARNING_FRAMEWORK.md) — migrated probability, scenario, preference-hypothesis, and recommendation-calibration framework.
5. [`ADR_001_NAME_DOMAIN_AND_MODULE_BOUNDARY.md`](./ADR_001_NAME_DOMAIN_AND_MODULE_BOUNDARY.md) — accepted naming, domain, and no-fork integration decision.
6. [`ADR_002_PRIVATE_DATA_SHARING_AND_AI_PROVENANCE.md`](./ADR_002_PRIVATE_DATA_SHARING_AND_AI_PROVENANCE.md) — accepted privacy, sharing, and AI evidence rules.
7. [`CODEX_MASTER_INSTRUCTION.md`](./CODEX_MASTER_INSTRUCTION.md) — permanent RCMND implementation method and phase sequence.
8. [`CODEX_TASK_00_INTEGRATION_FOUNDATION.md`](./CODEX_TASK_00_INTEGRATION_FOUNDATION.md) — first executable task: preserve Daler OS and establish the integrated module foundation.
9. [`CODEX_TASK_01_PRIVATE_CAPTURE_VERTICAL_SLICE.md`](./CODEX_TASK_01_PRIVATE_CAPTURE_VERTICAL_SLICE.md) — first real product slice after Task 00.
10. [`MIGRATION_MANIFEST.md`](./MIGRATION_MANIFEST.md) — record of what moved from IntelFlow and what remains archived.

## Status

The product strategy and migration instructions are now canonical in this repository.

The existing Daler OS application is still the live implementation. RCMND functionality has not yet been represented as complete.

Codex must execute Task 00 before broad feature work.

## Naming decision

The final working name is:

> **RCMND by Asita**

The canonical hostname is:

> **`rcmnd.asita.ai`**

Why this name:

- it is short and memorable;
- it directly connects to recommendation;
- it can grow beyond restaurants into hotels, travel, activities, shops, services, and personal guides;
- it is clearly part of the Asita product family;
- it works as a product name, verb, and URL.

`recommend.asita.ai`, `places.asita.ai`, and `memory.asita.ai` remain possible redirects or future campaign domains, but they are not the canonical product identity.

## Immediate instruction

```text
Read AGENTS.md and every required file in docs/rcmnd.
Execute docs/rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md only.
Do not create a separate RCMND repository or app fork.
Preserve and verify the existing Daler OS application first.
```

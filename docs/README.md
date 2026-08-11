# Asita / Daler OS Documentation

This repository is the canonical codebase and documentation home for **Asita Daler OS** and its integrated modules.

## Active products

### Daler OS

The existing personal operating system for daily execution, deals, strategic review, forecasts, reminders, offline storage, and optional Supabase synchronization.

- Production entry point: `daler.asita.ai`
- Existing application: repository root
- Existing data: IndexedDB plus the current optional cloud synchronization mechanism

### RCMND by Asita

A private-first personal experience intelligence system for remembering places, recording visits and opinions, retrieving lived experience, producing contextual recommendations, and selectively sharing trusted guides.

- Canonical product name: **RCMND by Asita**
- Canonical subdomain: `rcmnd.asita.ai`
- Fallback application route: `/rcmnd`
- Legacy codename and source project: `IntelFlow`
- Canonical documentation: [`docs/rcmnd`](./rcmnd/README.md)

## Architectural rule

RCMND is an **integrated Asita module**, not a separate product fork.

It must reuse or deliberately extend the shared:

- identity;
- application shell;
- design language;
- PWA and offline capabilities;
- storage and cloud configuration;
- settings;
- deployment;
- observability;
- privacy and authorization foundations.

Module-specific domain data must remain properly separated and normalized.

## Codex entry point

Codex reads the root [`AGENTS.md`](../AGENTS.md).

The first RCMND engineering task is:

[`docs/rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md`](./rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md)

Do not begin broad RCMND feature development before Task 00 has preserved and verified the existing Daler OS application.

## Source-of-truth order

1. Latest explicit founder decision
2. Root `AGENTS.md`
3. Module master product specification
4. Accepted architecture decisions
5. Active Codex task
6. Integration architecture
7. Founder thread and historical record
8. Existing implementation behavior
9. Archived IntelFlow documents

## Product domains

The repository should converge toward a shared Asita module architecture without forcing a premature rewrite:

```text
src/
  app/
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

Only create or move code when an active task requires it and the rollback path is documented.

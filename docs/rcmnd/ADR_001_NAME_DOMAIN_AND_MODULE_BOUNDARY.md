# ADR 001 — RCMND Name, Domain, and Asita Module Boundary

**Status:** Accepted  
**Date:** 11 August 2026  
**Decision owners:** Founder and Asita product architecture

## Context

The product was previously developed under the working name IntelFlow. Its earlier forms focused on external topic intelligence and a standalone executive-intelligence prototype.

The founder later redefined the product as a personal experience memory and recommendation system, and instructed that the complete context be moved under Asita Daler OS.

A decision was required on:

- product name;
- canonical subdomain;
- repository ownership;
- whether RCMND should remain a separate application or become an integrated Asita module.

## Decision

### Product name

The product name is:

> **RCMND**

The branded label is:

> **RCMND by Asita**

### Canonical domain

The canonical hostname is:

> **`rcmnd.asita.ai`**

The fallback route is:

> **`/rcmnd`**

Alternative names such as `recommend.asita.ai`, `places.asita.ai`, and `memory.asita.ai` may be used only as future redirects or campaigns unless a later ADR changes the decision.

### Canonical repository

The canonical repository is:

> **`avedaler/daler-os`**

The previous repository `avedaler/intelflow` becomes a historical reference and migration source.

### Module boundary

RCMND is an integrated Asita module.

It must not become a separate long-lived fork with duplicate:

- identity;
- design system;
- settings;
- PWA foundation;
- deployment architecture;
- privacy layer;
- AI provider layer;
- observability;
- user account.

A separate hostname or transitional Vercel project is permitted only as an entry point to the same canonical codebase and shared backend architecture.

## Rationale

### Why RCMND

- Short and memorable
- Directly connected to recommendation
- Works beyond restaurants
- Suitable for hotels, travel, activities, stores, services, and city guides
- Strong fit within the Asita domain family
- Suitable as a mobile navigation label and icon identity

### Why integration into Daler OS

- Daler OS is the user's existing personal operating environment
- Identity, settings, offline behavior, and cloud foundations should not be duplicated
- RCMND adds a personal experience intelligence layer to the wider Asita system
- One codebase reduces drift and contradictory privacy implementations
- The founder explicitly requested the move

### Why not continue in the IntelFlow repository

- The existing IntelFlow code is a mock executive-intelligence prototype
- Its signal-centric domain model does not represent Place, Branch, Visit, Experience, or Recommendation
- Continuing there would create competing product identities and duplicate infrastructure

## Consequences

### Positive

- One canonical source of truth
- Shared user identity
- Consistent Asita brand
- Reusable offline, PWA, notification, export, and cloud capabilities
- Reduced infrastructure and design duplication
- Clear domain and deployment direction

### Costs

- Daler OS needs a module boundary before broad RCMND development
- Existing shared code may need gradual extraction
- Host-based routing and local-development overrides require tests
- RCMND requires normalized server data beyond the current key-value sync model
- The existing PWA manifest and navigation need a deliberate transition strategy

### Risks

- An uncontrolled integration could break Daler OS
- Shared services could become tightly coupled without explicit interfaces
- A second deployment could accidentally become a fork

These risks are mitigated by Task 00, feature flags, baseline tests, and rollback requirements.

## Implementation rules

1. Preserve the current Daler OS SHA before shared-shell changes.
2. Add a central module registry and host resolver.
3. Keep RCMND disabled by default until the boundary is tested.
4. Do not reinterpret existing Daler OS records as RCMND data.
5. Use normalized RCMND tables and explicit authorization.
6. Keep `rcmnd.asita.ai` documented as canonical, but do not claim it is live before DNS and deployment verification.
7. Do not create a new long-lived RCMND repository.

## Supersedes

This ADR supersedes any earlier assumption that IntelFlow remains a standalone canonical product repository.

## Review trigger

Review only if:

- Asita adopts a formal multi-repository platform architecture;
- platform constraints make one codebase impossible;
- the founder explicitly changes the product name or domain;
- a native application requires a different distribution boundary.

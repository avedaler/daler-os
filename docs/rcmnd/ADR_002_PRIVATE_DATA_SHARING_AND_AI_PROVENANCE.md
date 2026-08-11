# ADR 002 — Private-by-Default Data, Selective Sharing, and AI Provenance

**Status:** Accepted  
**Date:** 11 August 2026  
**Decision owners:** Founder and Asita product architecture

## Context

RCMND stores highly personal real-world experience data, including locations, visit times, companions, photos, private notes, spend, reservations, receipts, preferences, and recommendation history.

The product also uses AI to structure notes, retrieve memories, infer preferences, draft guides, and explain recommendations.

Without explicit policy, the system could:

- expose sensitive location history;
- reveal companions or spending;
- share private journal text;
- allow friendship to grant excessive access;
- let AI cite records that the recipient cannot access;
- confuse inferred data with user-authored truth;
- generate unsupported claims about visits or opinions.

## Decision

### Private by default

Every new RCMND Visit, Experience, note, media item, and collection is private unless the owner explicitly changes the visibility policy.

### Default deny authorization

Protected resources are denied unless an ownership, explicit share, circle, or service policy permits access.

Authorization is deterministic and server-side.

The language model is never the authorization engine.

### Field-level sharing

Sharing is based on selected fields, not merely entire records.

Potentially sensitive fields remain hidden unless deliberately selected:

- exact visit date and time;
- companions;
- spend;
- reservations;
- receipts;
- private journal;
- hotel room or table details;
- original media and EXIF;
- precise sensitive location;
- private AI prompts and source evidence.

### Share preview and revocation

Every share must:

- identify the recipient or link policy;
- show a preview of exactly what will be visible;
- show what remains hidden;
- support expiry when applicable;
- support revocation;
- invalidate protected media access after revocation as quickly as practical.

### No retroactive friendship access

Accepting a friendship or joining a circle does not grant automatic access to historical records.

Existing records remain governed by their original visibility policy unless the owner changes it.

### User-authored truth is canonical

AI and external providers may propose data but may not overwrite:

- user ratings;
- user sentiment;
- private journal;
- highlights and lowlights;
- return intent;
- recommendation strength;
- explicit preferences.

### AI provenance

Every AI-derived artifact or field must retain sufficient metadata to identify:

- provider;
- model;
- prompt version;
- schema version;
- evidence IDs;
- actor;
- created time;
- input hash;
- redaction policy;
- acceptance, correction, or rejection state.

### No fabricated memory

AI must never claim that a user:

- visited a place;
- liked or disliked it;
- ordered a dish;
- stayed in a room;
- spent an amount;
- was with a person;
- recommended a place;

without supporting evidence.

Imported or inferred visits remain suggestions until confirmed unless a later accepted rule explicitly permits another state.

### Evidence authorization

An Ask response or recommendation explanation may cite only evidence that the viewing actor is authorized to access.

Citations and permissions must be validated after model generation.

## Rationale

RCMND's value depends on honest, detailed personal memory. Users will not record useful experience data if they do not trust the privacy model.

A selective sharing system also produces better recommendations because it separates:

- private memory;
- shareable opinion;
- trusted-circle evidence;
- public or external facts.

AI provenance makes corrections, auditing, evaluation, and trust possible.

## Consequences

### Positive

- Strong user trust
- Safer location and companion data
- Clear separation between private journal and shared recommendation
- Auditable AI behavior
- Easier correction of inferred preferences
- Reduced risk of cross-user evidence leakage
- Better support for professional and executive use cases

### Costs

- More complex authorization
- Field-level redaction and share preview
- Separate media derivatives
- Revocation infrastructure
- More metadata for AI artifacts
- Additional integration and regression tests

### Risks

- Inconsistent policy enforcement across routes
- Signed URLs surviving too long
- Model output containing an inaccessible fact
- Client-only checks being bypassed
- stale circle membership affecting access

Mitigations include a central policy evaluator, short-lived signed URLs, server-side checks, post-generation citation validation, and automated cross-user tests.

## Required tests

At minimum:

1. A second user cannot read an unshared Visit.
2. A connected friend cannot read historical records by default.
3. A selected recipient sees only selected fields.
4. A revoked share no longer resolves.
5. Original media remains private when a derivative is shared.
6. AI retrieval excludes unauthorized evidence.
7. AI output with an invalid citation is rejected or corrected.
8. Imported visits remain unconfirmed.
9. User-authored data is not overwritten by enrichment.
10. Account deletion revokes active shares and schedules media cleanup.

## Implementation rules

- Centralize policy evaluation.
- Deny by default.
- Apply authorization before retrieval and again before rendering.
- Apply field-level redaction before AI calls when possible.
- Validate structured model output.
- Validate citations after generation.
- Keep service-role keys server-side.
- Keep private originals in protected storage.
- Record sensitive share and export events.
- Add a regression test for every privacy or authorization defect.

## Review trigger

Review only if:

- public profiles or public guides are approved;
- legal requirements change;
- delegated assistant access is introduced;
- enterprise tenancy requires additional policy levels;
- end-to-end encrypted private journals are adopted.

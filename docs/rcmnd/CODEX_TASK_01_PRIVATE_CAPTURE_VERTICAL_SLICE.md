# Codex Task 01 — RCMND Private Capture Vertical Slice

**Task type:** First real product vertical slice  
**Priority:** P0 after Task 00  
**Prerequisite:** Task 00 accepted and all required checks passing  
**Feature flag:** RCMND remains controlled until acceptance

---

## 1. Objective

Deliver one complete, private, production-oriented RCMND journey inside Asita Daler OS:

1. an authenticated user opens RCMND;
2. searches for or manually creates an exact Branch;
3. records a private Visit;
4. adds quick sentiment and return intent;
5. optionally completes a restaurant or hotel Experience;
6. uploads one private photo;
7. sees the record in a private Journal;
8. opens Branch Detail and sees separate repeat visits;
9. edits or deletes their record;
10. another authenticated user cannot access the private record or media.

This task must prove the domain distinction:

`Place ≠ Branch ≠ Visit ≠ Experience`

Recommendation, Ask, friends, and sharing remain out of scope.

---

## 2. Required reading

Read:

1. `AGENTS.md`
2. all canonical RCMND product and architecture documents
3. accepted Task 00 report
4. Phase 1 implementation plan created by Task 00
5. database and privacy ADRs
6. current shared shell, actor, provider, and feature-flag implementation

Do not begin if Task 00 has unresolved build, privacy, or rollback failures.

---

## 3. Scope

### In scope

- authenticated actor;
- Profile minimum record;
- Place;
- exact Branch;
- provider reference and manual Branch creation;
- Visit;
- Experience;
- quick sentiment;
- would-return value;
- optional overall score;
- restaurant and hotel rating dimensions;
- highlights and lowlights;
- private journal;
- private shareable-summary draft field, not externally shared;
- private photo upload;
- media derivative and signed access;
- private Journal;
- Branch Detail;
- repeat visits;
- edit and deletion;
- audit events for sensitive operations;
- server-side authorization;
- row-level security as defense in depth;
- offline or recoverable draft where Task 00 architecture supports it;
- unit, integration, and end-to-end tests;
- founder dogfood seed option using fictional data only.

### Out of scope

- public records;
- friend relationships;
- circles;
- sharing links;
- city guides;
- Ask RCMND;
- semantic search;
- recommendation engine;
- AI note extraction;
- voice transcription;
- calendar or email import;
- map history import;
- automatic place merging;
- native mobile application;
- payment;
- migration of legacy IntelFlow mock data;
- migration of existing Daler OS records.

---

## 4. Required user journey

### 4.1 Open RCMND

The authenticated user sees:

- private Journal state;
- capture call to action;
- clear private-by-default indicator;
- no fake personal records.

### 4.2 Choose a Branch

The user can:

- search through the configured PlaceProvider;
- choose an exact returned branch;
- manually create a Branch if no result is correct;
- see provider source when applicable;
- correct location before saving.

Do not require a production external provider if the selected adapter remains fake or manual for this phase.

### 4.3 Create a Visit

Minimum fields:

- branch;
- start time;
- source timezone;
- confirmation state `confirmed`;
- source type `manual`;
- private visibility policy.

Optional:

- purpose;
- end time;
- trip placeholder only if already supported safely.

### 4.4 Quick Experience

Required capture options:

- Loved;
- Good;
- Mixed;
- Bad;
- Would Return: Yes / Maybe / No.

Optional:

- overall score 1–10;
- one note;
- one photo.

Save must not require the full editor.

### 4.5 Full Experience

Common fields:

- overall score;
- highlights;
- lowlights;
- private journal;
- shareable-summary draft;
- recommendation strength;
- tags where implemented;
- category dimensions.

Restaurant dimensions:

- food;
- service;
- ambience;
- value;
- noise;
- business suitability;
- parking or valet note;
- best dish;
- dish to avoid.

Hotel dimensions:

- room quality;
- sleep quality;
- service;
- cleanliness;
- breakfast;
- gym;
- pool;
- spa or sauna;
- Wi-Fi;
- location;
- whether the user would stay again.

Use structured tables for reusable rating dimensions. Category-specific free text may use validated JSON only when justified and versioned.

### 4.6 Journal

The Journal shows:

- photo or safe placeholder;
- branch name;
- city;
- visit date with the owner's permitted precision;
- quick sentiment;
- return intent;
- optional score;
- private status;
- category;
- draft or complete state.

It supports at minimum:

- newest first;
- category filter;
- sentiment filter;
- text search over the owner's records if infrastructure is available;
- empty, loading, error, and offline states.

### 4.7 Branch Detail

Branch Detail shows:

- canonical Place and Branch identity;
- external facts with source and fetched time;
- aggregate personal summary;
- each Visit separately;
- score or sentiment trend;
- repeat-visit count;
- photos authorized for the owner;
- edit and delete actions.

A second visit must create a second Visit and Experience.

### 4.8 Edit and delete

The owner can edit their Experience without changing immutable audit facts silently.

Deletion behavior must be explicit:

- remove or mark deleted according to policy;
- revoke media access;
- schedule object cleanup;
- update Journal and Branch Detail;
- record audit event;
- preserve only metadata required by policy.

---

## 5. Domain schema

Use the migration tooling selected in Task 00.

Exact column names may adapt, but domain meaning must remain.

### 5.1 Profiles

Minimum:

- `user_id` primary or unique reference to auth user;
- display name;
- created and updated timestamps.

### 5.2 Places

- UUID;
- name;
- canonical category;
- optional parent or brand reference;
- created and updated timestamps.

### 5.3 Branches

- UUID;
- `place_id`;
- display name;
- address;
- locality;
- country code;
- latitude and longitude when known;
- timezone;
- status;
- created and updated timestamps.

### 5.4 Place Provider References

- branch ID;
- provider;
- provider place ID;
- raw reference fields only when policy permits;
- fetched time;
- match confidence;
- attribution metadata;
- unique provider-reference constraint.

### 5.5 Visibility Policies

For this phase, every created policy is private and owner-only.

Minimum:

- UUID;
- owner user ID;
- visibility type `private`;
- created and updated timestamps.

Do not build the complete sharing policy matrix yet.

### 5.6 Visits

- UUID;
- owner user ID;
- branch ID;
- start UTC;
- optional end UTC;
- source timezone;
- confirmation state;
- source type;
- optional purpose;
- visibility policy ID;
- created, updated, and deleted state.

### 5.7 Experiences

- UUID;
- Visit ID unique for the initial one-experience-per-user-per-visit model;
- owner user ID;
- quick sentiment;
- optional overall score;
- would-return value;
- optional recommendation strength;
- highlights;
- lowlights;
- private journal;
- shareable-summary draft;
- category schema version;
- authorship state `user`;
- created, updated, and deleted state.

### 5.8 Experience Ratings

- UUID or composite key;
- experience ID;
- dimension;
- score;
- scale version;
- created and updated timestamps;
- unique experience and dimension constraint.

### 5.9 Media Assets

- UUID;
- owner user ID;
- storage key;
- MIME type;
- size;
- original or derivative type;
- processing state;
- visibility policy ID;
- metadata-stripped state;
- created, updated, and deleted state.

### 5.10 Media Links

- media ID;
- Visit or Experience link;
- ordering;
- caption;
- created time.

### 5.11 Audit Events

- UUID;
- actor user ID;
- action;
- resource type;
- resource ID;
- safe metadata;
- request or correlation ID;
- created time.

Do not store private journal content in audit metadata.

---

## 6. Domain invariants

Enforce through code, constraints, and tests where possible.

1. A Branch belongs to one Place.
2. A user may create multiple Visits for the same Branch.
3. Every Experience belongs to one Visit and one owner.
4. Owner IDs remain consistent across Visit and Experience.
5. Quick sentiment accepts only defined values.
6. Overall score is null or within the accepted scale.
7. Would Return accepts only Yes, Maybe, or No.
8. A private policy permits only the owner and authorized service operations.
9. Media owner matches the linked Experience owner.
10. A non-owner cannot infer the existence of a private resource through response differences.
11. Provider reference does not become the internal primary key.
12. Deleting one repeat Visit does not remove other Visits.
13. User-authored data is never overwritten by provider enrichment.

---

## 7. Authorization requirements

Create server-side checks for:

- create Branch where allowed;
- create Visit as actor;
- read own Visit;
- update own Visit;
- delete own Visit;
- read own Experience;
- update own Experience;
- upload own media;
- receive signed URL for own media;
- read Branch external facts;
- deny another user private Visit, Experience, and Media.

Response behavior should avoid revealing private resource existence.

Add defense-in-depth row-level policies for owner-controlled tables.

Service-role use must be server-only and auditable.

---

## 8. API or server operation contracts

Use the Task 00 server boundary.

Recommended operation groups:

### Places

- search candidates;
- create manual Place and Branch;
- get Branch Detail for authorized actor.

### Visits

- create;
- list own;
- get own;
- update own;
- delete own.

### Experiences

- create or update for Visit;
- get own;
- save ratings.

### Media

- request upload intent;
- confirm upload;
- get signed download URL;
- delete.

Validate all external input at the boundary.

Keep domain logic in services, not route handlers or React components.

---

## 9. Offline and draft requirements

At minimum:

- preserve an unfinished quick-capture draft locally;
- restore the draft after refresh;
- clear it only after confirmed server save or explicit discard;
- show offline state;
- do not fake successful server persistence;
- avoid storing service credentials or signed URLs;
- queue media only if the Task 00 offline architecture supports safe retry.

If full mutation queue is too broad, implement reliable draft recovery and document server-save limitations.

---

## 10. Media requirements

For one private photo:

- validate type and size;
- upload through a signed or server-mediated intent;
- store private original;
- create display and thumbnail derivatives where architecture supports it;
- strip sensitive metadata from derivatives;
- issue short-lived signed read URLs;
- verify owner authorization before URL creation;
- revoke access after deletion;
- handle failed processing visibly;
- avoid embedding permanent public URLs in database records.

Use safe fictional test images.

---

## 11. UI requirements

### RCMND Home

- capture CTA;
- private status;
- recent Journal items;
- no public feed.

### Capture

- mobile-first;
- progress is clear;
- quick save possible;
- full editor optional;
- draft recovery;
- place source visible;
- privacy visible.

### Journal

- photo-first cards;
- filters;
- empty state that leads to first capture;
- loading and error states;
- owner-only data.

### Branch Detail

- separate visits;
- repeat count;
- trend without hiding individual history;
- source and freshness for external facts;
- edit and delete.

### Accessibility

- labels;
- keyboard behavior;
- focus management;
- screen-reader status;
- contrast;
- touch targets;
- reduced motion where relevant.

---

## 12. No AI requirement in this task

Do not add production AI extraction, summaries, Ask, or recommendation explanation.

All core capture behavior must function without AI.

If provider interfaces exist, keep AI disabled or fake and clearly labeled.

---

## 13. Testing requirements

### Unit

- sentiment validation;
- score validation;
- return-intent validation;
- timezone conversion;
- domain ownership consistency;
- privacy decisions;
- media metadata redaction helper;
- Branch versus Place normalization.

### Integration

- create Place and Branch;
- create first Visit and Experience;
- create repeat Visit;
- list owner Journal;
- Branch Detail returns both Visits;
- update one Experience without changing the other;
- upload and authorize media;
- non-owner read denied;
- non-owner signed media URL denied;
- delete one Visit;
- migration from empty database.

### End-to-end

1. Existing Daler OS smoke still passes.
2. User A signs in.
3. User A creates manual restaurant Branch.
4. User A records a Loved Visit and Would Return Yes.
5. User A adds ratings and a photo.
6. Journal shows the record.
7. User A records a second Visit.
8. Branch Detail shows two separate Visits.
9. User B cannot open User A's private Visit or media.
10. User A deletes one Visit and the other remains.

Use deterministic test accounts and fixtures.

---

## 14. Privacy review

Before completion verify:

- all new records are private;
- exact visit time is not accidentally displayed outside owner views;
- no private journal in logs;
- no permanent public media URL;
- no service role in client;
- non-owner responses do not reveal existence;
- RLS and application authorization agree;
- deleted media is inaccessible;
- test fixtures contain no founder personal data;
- existing Daler data remains untouched.

---

## 15. Performance and reliability targets

Initial targets:

- RCMND shell interactive without unnecessary large bundle increase;
- quick capture usable on mobile;
- Journal paginated or bounded;
- image thumbnail used in lists;
- database queries scoped by owner and indexed;
- repeated submit is idempotent;
- failed save preserves draft;
- network retry does not create duplicate Visit;
- Branch Detail avoids N+1 queries.

Document measured results where practical.

---

## 16. Observability

Record safe events for:

- capture started;
- draft restored;
- Visit created;
- Experience completed;
- media processing success or failure;
- authorization denied;
- Visit deleted;
- sync error.

Do not record private content in analytics.

Use request or correlation IDs.

---

## 17. Required deliverables

Equivalent files and changes for:

- domain schema and migrations;
- repository and service layers;
- authorization policies;
- private storage configuration;
- PlaceProvider manual or fake implementation;
- capture UI;
- Journal;
- Branch Detail;
- repeat Visit behavior;
- edit and delete;
- draft recovery;
- tests;
- updated documentation;
- migration and rollback notes;
- founder dogfood instructions using real data only outside committed fixtures.

---

## 18. Acceptance criteria

Task 01 is complete only when:

1. all Task 00 checks still pass;
2. Daler OS remains functional;
3. RCMND is accessible through controlled module resolution;
4. User A can create a private Branch, Visit, and Experience;
5. a useful quick capture does not require full fields;
6. restaurant and hotel dimensions validate;
7. a private photo is accessible only through authorized short-lived access;
8. Journal displays the owner's record;
9. repeat Visit creates a separate record;
10. Branch Detail shows separate Visit history;
11. editing one Visit does not overwrite another;
12. User B cannot access User A's private records or media;
13. deletion removes access and preserves unrelated repeat Visits;
14. migrations run from an empty database;
15. draft recovery works for an interrupted capture;
16. all unit, integration, e2e, lint, typecheck, and build commands pass;
17. no production AI or social feature leaked into scope;
18. rollback is documented and tested where practical.

---

## 19. Rollback plan

Document:

- feature flag disable;
- migration rollback or forward-fix strategy;
- code revert commit;
- storage cleanup for test records;
- restoration of shared shell;
- preservation of existing Daler IndexedDB;
- no loss of unrelated RCMND repeat Visits during deletion rollback.

Production user data must never be dropped casually.

---

## 20. Completion report

Return:

### Summary

### Scope and non-scope

### User journey delivered

### Files changed

### Database and migrations

### Authorization and privacy

### Media architecture

### Offline and draft behavior

### Daler OS regression status

### Tests and exact results

### Lint, typecheck, build, and e2e results

### Reproduction steps

### Performance notes

### Known limitations

### Next recommended task

### Rollback

---

## 21. Codex execution prompt

```text
Execute docs/rcmnd/CODEX_TASK_01_PRIVATE_CAPTURE_VERTICAL_SLICE.md only after
Task 00 has been accepted and every required baseline check passes.

Deliver one complete private RCMND journey: exact Place and Branch, separate
Visit, quick and full Experience, restaurant and hotel dimensions, one private
photo, private Journal, Branch Detail, repeat Visits, edit, deletion, and
cross-user authorization tests.

Do not add Ask, production AI, recommendations, friends, circles, sharing,
imports, public records, or a new repository. Preserve Daler OS and use the
shared Asita module, identity, privacy, database, provider, and deployment
foundations. Run every required command and report exact results and rollback.
```

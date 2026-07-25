# THE CODE implementation plan

## Existing architecture

- React 18 + Vite PWA, no router and no server ORM.
- IndexedDB is the source of truth; optional Supabase sync mirrors selected keys.
- Navigation is state-based in `App.jsx`.
- Daily protocol data is stored under `day:YYYY-MM-DD`.
- Deals are the existing durable work/task register. Day-level tasks and calendar events live in `dailyProtocol.work.tasks`.
- Calendar and achievement views are derived from saved day records.

## Decisions

1. Store THE CODE as one backward-compatible private `code` record and add it to the existing cloud allowlist.
2. Keep daily Code sessions keyed by local ISO date to respect the current Kuala Lumpur date model.
3. Seed bilingual laws, identity statements, and triggers; all seeded content remains editable.
4. Link Main Move to existing day tasks by ID instead of duplicating task data.
5. Reuse existing themes, controls, cards, storage, export, and navigation patterns.
6. Label analytics as self-reported patterns and avoid causal or scientific claims.

## Delivery phases

1. Data model, migration, seed content, storage, and tests.
2. Dedicated THE CODE screen: protocol, laws, identity, triggers, reviews, settings.
3. Today integration: active law, Main Move, trigger, completion state, morning and evening actions.
4. Task/calendar integration and export.
5. Responsive verification, regression tests, build, and deployment.

## Security and privacy

- Code content stays in the existing private IndexedDB/Supabase user boundary.
- No public sharing and no third-party analytics.
- No secrets are added to the repository.

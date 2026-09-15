# THE MOVIE V2 — Mobile Pilot

Date: 2026-09-14
Source decision: THE MOVIE / 00 CONTROL ROOM

## Scope

Create a mobile-first, single-scroll Today experience for THE MOVIE at `/the-movie` inside the canonical Daler OS codebase.

The pilot uses Episode 002 (15 Sep 2026) as the first real scenario and is designed for fast reading from an iPhone.

## UX invariants

- Mobile-first, one vertical scroll.
- Character of the Day appears before the task list.
- One Win is explicit.
- Every scene shows WHY / OUTCOME, not just the action.
- Director's Moves are visibly generated from the bigger strategy.
- Oracle validation remains visible in the same page.
- Script and Reality are two modes of the same episode; Reality never overwrites Script.
- Evening shutdown is part of the character-development script.
- Progress is stored locally for the pilot.

## Episode 002 strategy

90-day direction toward December:

- stronger, more athletic body;
- USD 20M capital under management / available to support projects;
- stronger companies through partnerships, contracts and visible execution;
- disciplined strategic character.

Episode One Win: `Capital Map v1` — amount → purpose → instrument → investors → owners → deadlines.

## Safety / legal constraints

- Australia recovery scene uses facts, documented obligations and lawful options; no informal pressure.
- Online betting remains opportunity assessment until a valid regulatory path is clear.

## Files

- `src/components/MovieV2.jsx`
- `src/components/MovieShell.jsx`
- `src/main.jsx`
- `vercel.json`

## Non-scope

- Full Movie / Vision / Archive integration.
- Server persistence or project-wide sync of episode data.
- Automatic ingestion from CONTROL ROOM.
- AI generation inside the product.
- Replacing existing Daler OS Today / Deals / Overview / More.

## Acceptance

1. `/the-movie` renders the mobile episode page without changing the normal Daler OS home route.
2. Existing local lock still protects `/the-movie` when enabled.
3. Episode 002 can be read top-to-bottom on a phone.
4. Scene completion and Reality notes survive refresh locally.
5. The pilot contains no invented new life goals beyond the approved scenario.

## Known limitation

This branch has not been deployed from this chat. A build/deploy check is required before merging to production.

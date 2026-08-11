# RCMND by Asita — Founder Thread and Product History

**Document purpose:** Preserve the product conversation, historical decisions, founder requirements, and migration context in the canonical Asita Daler OS repository.  
**Status:** Authoritative historical and founder-intent record  
**Date migrated:** 11 August 2026  
**Canonical repository:** `avedaler/daler-os`  
**Previous repository:** `avedaler/intelflow`

---

## 1. Executive conclusion

The product previously called **IntelFlow** has evolved through several materially different concepts.

The final founder direction is not an executive-news dashboard. It is:

> A private-first personal memory and recommendation system that records where a user has been, what the user experienced, what the user liked or disliked, which photos and practical details belong to the visit, and what the user would recommend to other people.

The product has now moved under **Asita Daler OS** as the integrated module:

> **RCMND by Asita**

Canonical subdomain:

> **`rcmnd.asita.ai`**

RCMND must be implemented inside the Daler OS repository and shared Asita architecture. The old IntelFlow repository remains a historical implementation and documentation source, not the canonical place for new development.

---

## 2. Founder requirement that triggered the final product definition

The founder described the intended system as a combination of:

- personal journaling;
- memory of places visited;
- location history that the user controls;
- personal ratings and opinions;
- good and bad experience records;
- photos and other media;
- practical inside information;
- restaurant, hotel, and venue notes;
- recommendation sharing with friends and other users;
- city-level personal recommendation databases;
- an AI layer that can later retrieve, compare, summarize, and recommend from the accumulated experience history.

The Kuala Lumpur example is the initial design center:

- record every restaurant, hotel, spa, activity, shop, or venue visited;
- preserve the exact location and branch;
- add comments, ratings, experience, photos, and useful practical details;
- remember whether the experience was good or bad;
- create a complete personal recommendation database for Kuala Lumpur;
- later send individual recommendations or complete guides to other users.

This founder direction supersedes the earlier executive-news orientation where the concepts conflict.

---

## 3. Historical evolution

### 3.1 Early FinanceOS intelligence module

The earliest IntelFlow concept was an information-intelligence module inside FinanceOS.

Its purpose was to reduce information overload by converting news and external sources into structured intelligence. Its important ideas included:

- structured information rather than an endless feed;
- evidence and source links;
- confidence and uncertainty;
- changes over time;
- contradictions and competing views;
- monitoring and alerts;
- collections;
- decision implications;
- natural-language questions.

The central object was a topic or external signal.

### 3.2 March 2026 topic-intelligence architecture

The March 2026 product architecture expanded the concept into an AI-native topic-intelligence product.

The core object was a Topic Brief intended to answer:

1. What is this?
2. What changed?
3. Why does it matter?
4. What do the sources say?
5. What should the user watch next?

The proposed product included:

- discovery;
- structured analysis;
- timelines;
- source evidence;
- monitoring;
- watchlists;
- alerts;
- collections;
- confidence;
- related topics.

This stage established the intellectual foundation of evidence-backed, structured intelligence.

### 3.3 Standalone IntelFlow prototype

A standalone Next.js prototype was later created in `avedaler/intelflow`.

It included:

- Morning Brief;
- Signals;
- Signal Detail;
- simulated Agents;
- Strategic Assumptions;
- Analytics;
- Ask IntelFlow;
- onboarding;
- watchlists and trusted sources;
- browser-local persistence.

The prototype used mock signals, mock agents, mock assumptions, mock analytics, localStorage, and keyword matching. It did not contain a production database, real AI retrieval, place history, multi-user authorization, photos, maps, social relationships, or a real recommendation engine.

The prototype is therefore a useful UX and design reference, but not the foundation that should dictate the new domain model.

### 3.4 Prediction framework

A prediction framework was added conceptually after the original IntelFlow work.

Its operating sequence was:

`Question → Base Rate → Drivers → Signals → Scenarios → Probabilities → Triggers → Action → Review`

Its useful ideas included:

- explicit probabilities;
- bull, base, and bear scenarios;
- leading indicators;
- confirmation and invalidation triggers;
- anti-thesis;
- review cadence;
- prediction-to-action links.

This framework remains relevant to RCMND as a later preference and recommendation-calibration layer.

Examples:

- predicted likelihood that the user will enjoy a place;
- confidence that a venue fits a business dinner;
- a preference hypothesis derived from repeat behavior;
- confirmation or invalidation after an actual visit;
- tracking whether friend recommendations consistently work for the user.

It is not the first implementation milestone.

### 3.5 Personal Experience Intelligence pivot

The founder then clarified that the system should remember places and personal experiences rather than primarily monitoring external news.

This changed the central product object from:

`Topic / Signal`

into:

`Place → Branch → Visit → Experience → Recommendation`

The new product combines:

- a private journal;
- a place memory;
- a personal map;
- a recommendation engine;
- photo memories;
- contextual retrieval;
- controlled social sharing;
- an AI assistant grounded in actual evidence.

### 3.6 Migration into Asita Daler OS

The founder instructed that the complete product context, history, specification, and Codex instructions be moved under **Asita Daler OS**.

The resulting decisions are:

- canonical repository: `avedaler/daler-os`;
- product name: `RCMND by Asita`;
- canonical subdomain: `rcmnd.asita.ai`;
- fallback route: `/rcmnd`;
- RCMND is an integrated Asita module;
- no independent repository or disconnected application fork;
- legacy IntelFlow documents remain historical references;
- all future Codex work starts from the Daler OS repository instructions.

---

## 4. What must be preserved from the old IntelFlow concept

The following principles remain strategically valuable.

### 4.1 Structured, not feed-first

RCMND should not become an infinite public social feed.

The core object is a structured experience record. Social discovery is secondary to memory, evidence, and recommendation quality.

### 4.2 Evidence and provenance

Every conclusion should identify its source.

Possible evidence includes:

- confirmed visit;
- user-authored rating;
- private or shareable note;
- photo;
- voice memo;
- receipt;
- reservation;
- calendar event;
- imported suggestion;
- trusted friend experience;
- external place provider fact with a freshness timestamp.

### 4.3 Relevance

The old signal relevance score becomes personal recommendation relevance.

It should consider:

- direct personal experience;
- current request context;
- hard constraints;
- repeat outcomes;
- preference similarity;
- trusted-friend evidence;
- location;
- recency;
- factual freshness;
- confidence.

### 4.4 Ask as an interface

Ask remains a central interface, but it must search the authorized experience graph rather than run keyword matching over mock signals.

### 4.5 Timelines and collections

The earlier timeline and collection patterns become:

- private Journal;
- place history;
- trip timeline;
- city guide;
- restaurant list;
- hotel shortlist;
- best-of collection;
- avoid list;
- shareable recommendation pack.

### 4.6 Confidence and uncertainty

The product must visibly distinguish:

- direct user experience;
- friend experience;
- imported but unconfirmed visit;
- AI inference;
- external factual data;
- stale data;
- low-confidence place matching;
- prediction versus fact.

---

## 5. What must not be carried forward as product truth

The following legacy behaviors are not production requirements:

- mock executive signals as the canonical data model;
- company, person, topic, and geography watchlists as the primary onboarding flow;
- random agent activity;
- fake analytics;
- keyword-only Ask behavior;
- localStorage as the canonical store for private multi-user records;
- a standalone IntelFlow deployment that duplicates Asita services;
- a public engagement feed as the main experience;
- treating a brand as if all branches have the same quality;
- editing one review to represent all repeat visits;
- AI-generated claims without supporting evidence.

---

## 6. Final product identity

### Product name

**RCMND**

### Parent brand

**Asita**

### Full product label

**RCMND by Asita**

### Domain

**`rcmnd.asita.ai`**

### Category

**Personal Experience Intelligence**

### Recommended tagline

> **Remember where you've been. Recommend what you know.**

Alternative supporting line:

> Your private memory of places, transformed into trusted recommendations.

### Naming rationale

RCMND is preferred because it is:

- compact;
- product-like;
- directly connected to recommendation;
- not limited to restaurants;
- compatible with hotels, travel, activities, stores, services, and city guides;
- easy to place within the Asita domain family;
- suitable for an application icon and mobile navigation label.

---

## 7. Canonical founder use cases

### 7.1 Record a restaurant visit

The user records:

- exact branch;
- time and occasion;
- overall sentiment;
- whether they would return;
- dishes ordered;
- best dish and dish to avoid;
- food, service, ambience, and value;
- noise and crowd;
- suitability for a date, family dinner, or business meeting;
- private-room information;
- parking and valet;
- practical tip;
- photos;
- private note;
- shareable recommendation.

### 7.2 Record a hotel stay

The user records:

- exact hotel;
- dates;
- room type;
- room quality;
- sleep quality;
- service;
- breakfast;
- gym;
- pool;
- spa, sauna, and steam room;
- Wi-Fi and workspace;
- location;
- what room to request;
- what to avoid;
- whether they would stay again;
- photos and private notes.

### 7.3 Remember a vague past experience

Examples:

- “Which restaurant in Bukit Bintang had great food but bad parking?”
- “Where did I stay with the good sauna and poor breakfast?”
- “What was the place Harpreet recommended near KLCC?”
- “Which branch did I dislike?”

### 7.4 Generate a contextual recommendation

Examples:

- quiet business dinner for six people;
- romantic restaurant with valet;
- hotel with strong gym and sauna;
- place suitable for visiting partners;
- activity around Kuala Lumpur for a girlfriend;
- camping place accessible by a G63;
- restaurant based only on places the user or selected friends actually visited.

### 7.5 Share a city guide

The user creates:

- “Daler's Kuala Lumpur Restaurants”;
- “Best Private Business Dinner Places in KL”;
- “Hotels I Would Return To”;
- “Best Spas and Saunas in Malaysia”;
- “Three-Day Kuala Lumpur Guide”;
- “Avoid / Do Not Return.”

The recipient sees only fields selected by the owner.

---

## 8. Founder experience requirements

The product must prioritize:

- mobile capture;
- low friction;
- premium but calm design;
- photos and memory cues;
- voice capture;
- private notes;
- quick sentiment before detailed review;
- exact branch accuracy;
- repeat visits;
- easy retrieval;
- polished sharing;
- useful insider information;
- evidence-backed AI;
- user control over what is learned and shared.

The user should be able to save a useful memory in under 30 seconds and enrich it later.

---

## 9. Privacy intent

Private-by-default is a founder-level product requirement.

The following remain hidden unless deliberately selected:

- exact visit date and time;
- companions;
- spend;
- reservation and receipt information;
- private journal;
- hotel room or table details;
- original photo metadata;
- habitual location patterns;
- real-time location.

Sharing must be selective, previewable, expirable where appropriate, and revocable.

---

## 10. Integration intent

RCMND belongs under Asita Daler OS because the broader system is intended to become the user's operating and intelligence environment.

Shared foundations can include:

- identity;
- settings;
- design language;
- navigation shell;
- PWA behavior;
- offline drafts;
- notifications;
- exports;
- cloud configuration;
- AI provider layer;
- privacy and auditing.

RCMND-specific domain tables and authorization rules must remain explicit and normalized.

The existing Daler OS daily data must not be mixed into RCMND records.

---

## 11. Decisions still intentionally open

The following require later founder confirmation or validated product evidence:

- whether any user profile or guide can become fully public;
- exact subscription model;
- default numeric rating scale versus sentiment-first only;
- external maps/place provider contract;
- calendar, email, photo, and location-history import permissions;
- native mobile application timing;
- delegated access for assistants;
- commercial concierge or white-label version;
- whether external public reviews influence ranking and by how much;
- whether `recommend.asita.ai` or `places.asita.ai` should redirect to the canonical domain.

Codex must not invent these decisions.

---

## 12. Source-of-truth decision

After this migration, use the following order when materials conflict:

1. latest explicit founder decision;
2. root `AGENTS.md` in `avedaler/daler-os`;
3. `docs/rcmnd/RCMND_MASTER_PRODUCT_SPEC.md`;
4. accepted RCMND ADRs;
5. active RCMND Codex task;
6. `RCMND_INTEGRATION_ARCHITECTURE.md`;
7. this historical record;
8. existing Daler OS implementation;
9. archived IntelFlow documents and implementation.

---

## 13. Immediate next action

The next engineering action is not a full product rewrite.

Codex must execute:

`docs/rcmnd/CODEX_TASK_00_INTEGRATION_FOUNDATION.md`

Task 00 must preserve and verify Daler OS, establish the shared module boundary, create hostname and route resolution, add quality gates, and document the first private capture slice.

# RCMND by Asita — Master Product Specification

**Product:** RCMND by Asita  
**Category:** Personal Experience Intelligence  
**Canonical subdomain:** `rcmnd.asita.ai`  
**Fallback route:** `/rcmnd`  
**Repository:** `avedaler/daler-os`  
**Status:** Canonical product definition  
**Primary founder dogfood market:** Kuala Lumpur, Malaysia  
**Date:** 11 August 2026

---

## 1. Executive summary

RCMND is a private-first personal experience graph, place memory, journal, contextual recommendation engine, and controlled sharing network.

It lets a user record where they have been, the exact branch or venue, what happened on each visit, what they liked and disliked, what they ordered or used, who they were with, what they spent, which photos or documents belong to the experience, what practical inside information mattered, whether they would return, and what they would recommend.

RCMND converts those raw memories into structured, searchable, evidence-backed personal intelligence.

Over time it should answer questions such as:

- Where did I have the best steak in Kuala Lumpur?
- Which hotel had the best gym, sauna, and breakfast?
- What did I dislike about that restaurant in Bukit Bintang?
- Which branch did I prefer?
- Which places are suitable for a quiet private business dinner for six people?
- Which restaurants did I visit with a specific person?
- Where did parking create a problem?
- What should I recommend to a friend visiting Kuala Lumpur for three days?
- Which places did I initially enjoy but rate lower after a repeat visit?
- Which friends consistently give recommendations that work for me?

RCMND is not a generic public review platform. Its recommendations are grounded in:

- the user's own direct experiences;
- explicit and inferred preferences;
- exact request context;
- deterministic hard constraints;
- selected trusted users' authorized experiences;
- branch-level accuracy;
- recency;
- external place facts with source and freshness;
- recommendation feedback.

The social layer is selective rather than performative. A user may share one recommendation, a shortlist, a collection, a city guide, or selected parts of an experience. Private journal text, exact visit time, companions, spend, reservations, receipts, and original media metadata remain hidden unless explicitly included.

The core loop is:

`Capture → Enrich → Remember → Ask → Recommend → Share → Learn`

The core domain distinction is:

`Place ≠ Branch ≠ Visit ≠ Experience ≠ Recommendation`

The core trust rule is:

> No recommendation without evidence, no sharing without permission, and no AI claim without provenance.

---

## 2. Product identity

### 2.1 Product name

**RCMND**

### 2.2 Parent brand

**Asita**

### 2.3 Full label

**RCMND by Asita**

### 2.4 Canonical hostname

`rcmnd.asita.ai`

### 2.5 Category statement

RCMND creates a category between:

- personal journaling;
- maps and saved places;
- private photo memories;
- restaurant and hotel reviews;
- travel history;
- recommendation engines;
- trusted social sharing;
- concierge tools;
- personal AI memory.

The clearest category name is:

> **Personal Experience Intelligence**

### 2.6 One-line proposition

> RCMND remembers where you have been and turns your real experiences into trusted recommendations.

### 2.7 Primary tagline

> **Remember where you've been. Recommend what you know.**

### 2.8 Brand personality

RCMND should feel:

- premium but restrained;
- intelligent but not academic;
- personal but not intrusive;
- useful before impressive;
- social but not performative;
- evidence-led;
- calm and fast;
- private and trustworthy;
- consistent with the wider Asita visual system.

---

## 3. Problem definition

People visit hundreds or thousands of places, but their experience data is fragmented across:

- phone photos;
- map history;
- notes;
- messages;
- calendars;
- reservations;
- receipts;
- social posts;
- memory;
- other people's recommendations.

This creates recurring failures.

### 3.1 Memory loss

The user remembers that a place was good or bad but forgets why.

### 3.2 Context loss

A restaurant may be excellent for a date but wrong for a business meeting. A hotel may be attractive but have poor sleep quality or no useful gym.

### 3.3 Branch confusion

One branch can be excellent while another is weak. Generic brand-level ratings hide this difference.

### 3.4 Repeat-visit blindness

The user cannot easily see whether quality improved, declined, or changed by occasion.

### 3.5 Recommendation friction

When someone asks for advice, the user rebuilds the same list from memory or old messages.

### 3.6 Trust failure

Public averages do not reflect the user's taste, the reviewer's credibility, or the context of the visit.

### 3.7 Fragmented evidence

Photos, notes, reservation details, receipts, dishes, room types, and insider tips are not connected to one durable record.

### 3.8 Privacy risk

Social and location products frequently encourage excessive disclosure of exact times, companions, and habitual movement.

### 3.9 Weak personalization

Many recommendation platforms optimize for popularity, advertising, or broad similarity rather than lived experience.

### 3.10 No learning loop

Most systems do not learn whether the recommendation worked after the user visited.

RCMND solves these problems through a durable, structured, permissioned experience graph.

---

## 4. Target users

### 4.1 Founder design center

The first design center is a high-frequency executive and traveler who:

- regularly visits restaurants, hotels, resorts, spas, attractions, shops, business venues, and outdoor locations;
- has strong opinions about service and quality;
- often recommends places to friends, partners, and visitors;
- values private notes and inside information;
- wants fast mobile capture;
- expects premium design;
- wants AI to recall and organize real personal history;
- needs context-sensitive recommendations rather than generic popularity.

### 4.2 Initial user segments

#### Frequent travelers and executives

Need reliable memory, business-context recommendations, hotel comparisons, and shareable city guides.

#### Food and hospitality enthusiasts

Want detailed records of dishes, service, ambience, value, and repeat visits without becoming public reviewers.

#### Trusted circles

Friends and families who frequently exchange recommendations and want evidence from people they trust.

#### Premium concierge users

Want highly personalized options based on their own history and selected trusted people.

### 4.3 Later user segments

- executive assistants;
- travel advisors;
- private clubs;
- family offices;
- boutique hospitality communities;
- corporate travel teams;
- white-label concierge products.

---

## 5. Jobs to be done

### 5.1 Capture

When I leave a place, help me save the useful parts of the experience in under a minute without requiring a long review.

### 5.2 Remember

When I vaguely remember a past place, help me find it using natural language, photos, people, time, city, neighborhood, occasion, or how I felt.

### 5.3 Decide

When I need somewhere to go, recommend options that fit the exact situation and explain why they fit me.

### 5.4 Compare

When I have visited similar places, help me compare them using the criteria that actually mattered to me.

### 5.5 Recommend

When someone asks where to go, let me send a polished recommendation or guide without exposing private details.

### 5.6 Learn

When I act on a recommendation, learn from whether it worked and improve future recommendations.

### 5.7 Reconstruct

When photos, calendar events, or reservations suggest a past visit, help me reconstruct it without falsely treating the suggestion as confirmed history.

---

## 6. Product principles

### 6.1 Private by default

Every new visit, experience, note, and media item is private unless the user explicitly changes visibility.

### 6.2 Experience-first, not feed-first

The product is organized around places, visits, and experiences. A public engagement feed is not the primary product.

### 6.3 Fast capture before perfect structure

A user can save a quick memory first and enrich it later. The application must not require every field before saving.

### 6.4 User-authored truth is canonical

AI or external providers may propose data, but they may not overwrite user-authored ratings, notes, or judgments.

### 6.5 Separate fact, opinion, inference, and recommendation

The interface must distinguish:

- user-authored opinion;
- friend-authored opinion;
- external fact;
- imported suggestion;
- AI-derived structure;
- inferred preference;
- AI-generated explanation;
- recommendation output.

### 6.6 Branch accuracy

Experiences belong to the exact physical branch or venue whenever possible.

### 6.7 Repeat visits are first-class

A repeat visit is a new Visit, not an edit to the previous visit.

### 6.8 Explain recommendations

The user must see why an option was recommended, which evidence influenced it, what trade-offs exist, and how confident the system is.

### 6.9 Hard constraints before preference scoring

Dietary needs, distance, opening status, budget, group size, accessibility, privacy, and other non-negotiable constraints must be applied deterministically before scoring or AI explanation.

### 6.10 Selective and revocable sharing

Every share must be previewable, limited, expirable where applicable, and revocable.

### 6.11 No fabricated memory

AI must never claim that the user visited, liked, disliked, ordered, spent, or experienced something without supporting evidence.

### 6.12 User control over learning

The user can inspect, correct, disable, or delete inferred preferences.

### 6.13 Asita integration without data confusion

RCMND shares the Asita platform foundation but does not reinterpret Daler OS day, deal, week, or forecast records as place experiences.

---

## 7. Core domain model

### 7.1 User and Profile

A user owns private experience data and can configure:

- name and avatar;
- home city and travel regions;
- languages;
- units and currencies;
- dietary and accessibility needs;
- preference-learning controls;
- privacy defaults;
- trusted circles;
- import permissions;
- notification preferences.

### 7.2 Place

A conceptual establishment, brand, destination, or venue identity.

Examples:

- a hotel brand;
- a restaurant brand;
- an independent cafe;
- an attraction;
- a spa;
- a store;
- a camping site.

A Place may have one or many Branches.

### 7.3 Branch or Venue

The exact physical location experienced by the user.

Minimum characteristics:

- stable internal UUID;
- `place_id`;
- display name;
- address;
- latitude and longitude;
- locality, city, country;
- timezone;
- category;
- provider references;
- provider source and freshness;
- operational status;
- merge and duplicate history.

### 7.4 Visit

A real or imported event connecting a user to a branch at a time and in a context.

Possible fields:

- `user_id`;
- `branch_id`;
- start and end time in UTC;
- source timezone;
- confirmation state;
- source type;
- purpose;
- trip;
- companions;
- reservation;
- spend;
- evidence references;
- visibility policy;
- created and updated timestamps.

Confirmation states:

- confirmed;
- suggested;
- rejected;
- needs branch resolution.

### 7.5 Experience

The user's evaluation of one visit.

Possible fields:

- quick sentiment;
- optional overall score;
- would return;
- recommendation strength;
- highlights;
- lowlights;
- private journal;
- shareable summary;
- category-specific ratings;
- insider tips;
- tags;
- authorship and provenance state;
- version history.

### 7.6 Rating

A dimension score attached to an experience.

Examples:

- food;
- service;
- ambience;
- value;
- room quality;
- sleep quality;
- gym;
- spa;
- cleanliness;
- location.

Every rating records scale version and author.

### 7.7 Media

A photo, video, audio note, document, receipt, reservation, or derived asset.

Media requires:

- owner;
- storage key;
- type and size;
- processing state;
- original or derivative state;
- visibility policy;
- provenance;
- metadata stripping state;
- deletion state.

### 7.8 Recommendation

A context-specific output derived from one or more experiences.

It contains:

- intended audience;
- use case;
- recommendation strength;
- reasons;
- caveats;
- evidence references;
- confidence;
- score breakdown;
- visibility;
- created time;
- optional expiry;
- algorithm version.

A Recommendation is not identical to a rating.

### 7.9 Collection or Guide

An ordered group of places or recommendations with commentary.

Examples:

- Daler's Kuala Lumpur Restaurants;
- Best Business Dinner Places in KL;
- Hotels I Would Return To;
- Best Spas and Saunas in Malaysia;
- Three-Day Kuala Lumpur Guide;
- Avoid or Do Not Return.

### 7.10 Trip

A time-bounded group of visits, places, media, notes, and guides.

### 7.11 Person, Companion, Relationship, and Circle

A companion can exist privately without being an RCMND user.

A user relationship is separate and requires acceptance.

A Circle is a user-controlled group such as:

- Close Friends;
- Family;
- Business Partners;
- Travel Group;
- Food Circle.

### 7.12 Preference Signal

A direct piece of evidence about taste or behavior.

Examples:

- repeated high ratings for quiet hotel rooms;
- repeated rejection of difficult parking;
- strong preference for private rooms for business dinners;
- positive outcomes from one friend's recommendations.

### 7.13 Preference Hypothesis

An inferred statement derived from preference signals.

Example:

> The user prefers high-energy restaurants for social evenings but quiet, private venues for business meetings.

A hypothesis records:

- confidence;
- supporting evidence;
- contradictions;
- model and prompt version;
- user-confirmation state;
- last recalculated time.

### 7.14 Provenance Record

Every imported, external, or AI-derived field should be traceable to:

- source type;
- source identifier;
- actor;
- provider;
- model;
- prompt version;
- retrieved or generated time;
- evidence IDs;
- user acceptance state.

---

## 8. Capture experience

### 8.1 Capture entry points

A user can begin capture from:

- global add button;
- RCMND home;
- place search;
- map pin;
- current or recent location suggestion;
- trip timeline;
- photo memory suggestion;
- calendar event;
- reservation email;
- browser or mobile share action;
- received recommendation;
- voice command;
- manual place creation.

### 8.2 Quick capture target

A useful private record should be savable in under 30 seconds.

Minimum flow:

1. choose or create the exact branch;
2. confirm visit time or use now;
3. choose Loved, Good, Mixed, or Bad;
4. choose Would Return: Yes, Maybe, or No;
5. add an optional note, photo, or voice memo;
6. save privately.

Everything else can be completed later.

### 8.3 Full experience editor

The full editor supports:

- overall score, recommended optional 1–10;
- quick sentiment;
- would return;
- recommendation strength;
- purpose or occasion;
- highlights and lowlights;
- private journal;
- shareable summary;
- rating dimensions;
- structured insider notes;
- people and circles;
- spend and currency;
- reservation details;
- media;
- custom tags;
- field-level visibility;
- follow-up reminders.

### 8.4 Rating model

The product should not force a numeric score.

Recommended model:

- Quick sentiment: Loved / Good / Mixed / Bad
- Would return: Yes / Maybe / No
- Optional overall score: 1–10
- Optional category dimensions: 1–10
- Recommendation strength: Strongly recommend / Recommend / Recommend with caveats / Neutral / Do not recommend

### 8.5 Voice-first capture

Example input:

> I am at Restaurant X in KLCC. Food was excellent, service was slow, the wagyu was the best dish, the private room works for six people, parking was difficult, and I would return for a business dinner but not on Friday.

The system may propose structured fields, but it must:

- preserve the original transcript;
- label extracted fields as AI-derived;
- show a confirmation screen;
- require user acceptance before treating them as canonical;
- avoid inventing missing details.

### 8.6 Draft and recovery behavior

- auto-save recoverable drafts;
- preserve media if one structured field fails;
- resume interrupted capture;
- queue offline changes;
- resolve duplicates after capture rather than blocking the user;
- show clear sync state;
- never lose user-authored text silently.

---

## 9. Category-specific schemas

The system uses one common experience core plus category modules.

### 9.1 Restaurant, cafe, and bar

Possible structured fields:

- cuisine;
- meal type;
- dishes ordered;
- best dish;
- dish to avoid;
- food quality;
- service;
- ambience;
- value;
- noise;
- crowd and energy;
- business-meeting suitability;
- date suitability;
- family suitability;
- private room;
- seating preference;
- dietary accommodation;
- alcohol selection;
- smoking policy;
- dress code;
- reservation difficulty;
- waiting time;
- parking or valet;
- best time to go;
- insider tip.

### 9.2 Hotel and resort

Possible structured fields:

- room type;
- private room number;
- room quality;
- bed and sleep quality;
- cleanliness;
- service;
- breakfast;
- gym;
- pool;
- spa;
- sauna or steam room;
- lounge;
- location;
- noise;
- Wi-Fi;
- workspace;
- business suitability;
- family suitability;
- check-in and checkout;
- upgrade or status recognition;
- parking;
- room orientation;
- what to request;
- what to avoid;
- whether the user would stay again.

### 9.3 Spa, salon, and wellness venue

Possible fields:

- treatment;
- therapist or practitioner, private by default;
- cleanliness;
- privacy;
- service;
- facilities;
- sauna, steam, cold plunge, or pool;
- treatment quality;
- value;
- booking difficulty;
- parking;
- what to request;
- whether the user would return.

### 9.4 Attraction and activity

Possible fields:

- activity type;
- duration;
- difficulty;
- weather dependency;
- crowd;
- scenery;
- family or partner suitability;
- required equipment;
- accessibility;
- parking and transport;
- best time;
- safety notes;
- whether the user would repeat it.

### 9.5 Store and service provider

Possible fields:

- product or service purchased;
- quality;
- selection;
- service;
- price and value;
- authenticity or trust;
- delivery;
- return policy;
- staff member, private by default;
- parking;
- whether the user would buy again.

### 9.6 Camping and outdoor location

Possible fields:

- terrain;
- vehicle access;
- G63 or caravan suitability;
- road condition;
- power and water;
- toilets and showers;
- shelter;
- mobile signal;
- privacy;
- security;
- weather exposure;
- family or couple suitability;
- nearby supplies;
- booking requirements;
- equipment notes;
- whether the user would return.

### 9.7 Generic fallback

Every unsupported category can still use:

- sentiment;
- overall score;
- return intent;
- recommendation strength;
- highlights;
- lowlights;
- private journal;
- shareable summary;
- media;
- custom dimensions and tags.

---

## 10. Core product surfaces

### 10.1 RCMND Home

The home experience should prioritize:

- global capture;
- recent memories;
- incomplete drafts;
- recent visits needing review;
- contextual suggestions;
- selected collections;
- Ask entry point;
- nearby or trip-related prompts;
- private-by-default status.

It should not look like a public social feed.

### 10.2 Journal

A chronological, photo-first timeline of visits.

Filters:

- date;
- city;
- category;
- sentiment;
- return intent;
- companion;
- trip;
- tag;
- rated or unrated;
- shared or private.

### 10.3 Map

A map and non-map alternative showing:

- visited places;
- wish list;
- recommended places;
- collections;
- trip locations;
- selected friend recommendations;
- category and sentiment filters.

Exact sensitive locations must never be exposed to unauthorized users.

### 10.4 Branch Detail

Displays:

- external place facts with source and freshness;
- aggregate personal summary;
- every visit as a separate event;
- rating trend;
- repeat-visit changes;
- photos;
- practical tips;
- recommendation history;
- related collections;
- friend evidence only when authorized.

### 10.5 Visit Detail

Displays one specific visit and its experience, evidence, privacy, and edit history.

### 10.6 Trips

Trips group visits, photos, notes, and guides by time and region.

### 10.7 Collections and Guides

Users can create:

- manual ordered lists;
- AI-assisted draft guides;
- city guides;
- occasion lists;
- best-of lists;
- avoid lists;
- collaborative guides later.

AI suggestions require user approval before publishing or sharing.

### 10.8 Ask RCMND

Natural-language recall and recommendation over authorized records.

Answer types:

- direct memory recall;
- comparison;
- list or guide creation;
- recommendation;
- trend or change summary;
- missing-information clarification.

Every answer must cite accessible evidence cards.

### 10.9 Recommendations

A request form or natural-language interface captures:

- location;
- date and time;
- occasion;
- group size;
- budget;
- distance;
- hard requirements;
- desired mood;
- relevant people or circles;
- novelty preference;
- whether external places without personal evidence are allowed.

### 10.10 Friends and Circles

The user controls:

- requests and acceptance;
- blocks;
- circles;
- category-specific trust;
- recommendation requests;
- sharing defaults;
- whether friend evidence can influence ranking.

### 10.11 Settings and Data Control

Settings include:

- account and identity;
- privacy defaults;
- AI and preference learning;
- import permissions;
- connected services;
- storage usage;
- exports;
- deletion;
- blocked users;
- sharing history;
- audit events where appropriate.

---

## 11. Ask and memory retrieval

### 11.1 Retrieval order

The retrieval system should work in layers:

1. authorize actor;
2. parse intent and constraints;
3. apply structured relational filters;
4. use full-text search;
5. use geospatial filters;
6. use vector retrieval when helpful;
7. rerank evidence;
8. synthesize answer;
9. validate citations and permissions;
10. render evidence cards.

### 11.2 Evidence requirements

An answer may reference only records the actor is authorized to access.

Each claim should be traceable to one or more of:

- visit;
- experience;
- rating;
- media;
- friend-shared record;
- collection;
- external place fact.

### 11.3 No-answer behavior

When evidence is insufficient, RCMND should say so and offer a useful next step, such as:

- broaden location;
- include external places;
- ask the user to confirm an imported visit;
- request more context;
- show related records without pretending they answer the question.

---

## 12. Recommendation engine

### 12.1 Pipeline

`Request → Authorization → Context Validation → Candidate Generation → Hard Filters → Feature Computation → Deterministic Ranking → Diversification → Confidence → Evidence Bundle → Optional AI Explanation → Post-validation → Feedback`

### 12.2 Candidate sources

Candidates may come from:

- user's visited branches;
- user's saved or wish-list branches;
- selected friends' authorized experiences;
- collection membership;
- external place provider results;
- recent context or trip location.

The interface must label whether a candidate is:

- personally experienced;
- experienced by a trusted person;
- externally discovered without direct evidence.

### 12.3 Hard filters

Examples:

- location or radius;
- opening status;
- date and time;
- budget ceiling;
- dietary requirement;
- accessibility;
- group capacity;
- private room requirement;
- child suitability;
- parking requirement;
- hotel facility requirement;
- excluded categories;
- block or privacy policy.

Hard constraints must not be delegated to the language model.

### 12.4 Initial scoring components

A transparent initial model can include:

- personal experience score;
- return-intent score;
- context-fit score;
- preference-similarity score;
- trusted-friend score;
- recency score;
- evidence-quality score;
- external-fact freshness;
- convenience score;
- diversity or novelty adjustment;
- negative-evidence penalty;
- uncertainty penalty.

Weights must be versioned.

### 12.5 Confidence

Confidence should depend on:

- amount of direct evidence;
- age of evidence;
- branch certainty;
- agreement or contradiction;
- context similarity;
- external factual freshness;
- friend trust and similarity;
- previous recommendation outcomes.

### 12.6 Explanation

An explanation should include:

- why it fits;
- evidence used;
- trade-offs;
- relevant private details excluded from the recipient view;
- confidence;
- whether it is based on direct experience, friend experience, or external facts.

### 12.7 Feedback

Track:

- viewed;
- saved;
- selected;
- shared;
- visited;
- enjoyed;
- rejected;
- reason for rejection;
- no longer relevant;
- friend recommendation worked or failed.

Feedback must not silently rewrite explicit user preferences.

---

## 13. Sharing model

### 13.1 Shareable objects

- recommendation card;
- selected experience fields;
- branch summary;
- shortlist;
- collection;
- city guide;
- trip guide;
- selected media;
- private link.

### 13.2 Visibility levels

Recommended initial levels:

- private;
- selected users;
- selected circle;
- private link;
- public only if explicitly approved in a later product decision.

### 13.3 Share preview

Before sharing, show exactly:

- title and commentary;
- ratings;
- selected photos;
- tips;
- visit date precision;
- companions, if any;
- spend, if any;
- source attribution;
- recipient and expiry;
- fields that remain hidden.

### 13.4 Revocation

The owner can revoke a share at any time.

Revocation must invalidate access and signed media URLs as quickly as practical.

### 13.5 No retroactive friendship access

Accepting a friendship does not expose previous private records automatically.

---

## 14. Privacy and authorization

### 14.1 Default policy

Deny by default.

### 14.2 Protected fields

Never expose without explicit permission:

- exact visit time;
- companions;
- spend;
- receipts;
- reservations;
- private journal;
- room or table details;
- original media metadata;
- home and work patterns;
- real-time location;
- private AI prompts;
- evidence from an unauthorized user's records.

### 14.3 Authorization actors

At minimum:

- anonymous;
- owner;
- explicitly shared recipient;
- circle member;
- connected friend without a share;
- blocked user;
- service role;
- support or admin role with tightly controlled access.

### 14.4 Authorization resources

At minimum:

- branch external facts;
- visit;
- experience shareable fields;
- private journal;
- media original;
- media derivative;
- companion data;
- spend and reservation;
- collection or guide;
- AI artifact;
- recommendation evidence;
- audit event.

### 14.5 Deletion

User deletion should:

- revoke active shares;
- remove access tokens;
- schedule media deletion;
- delete or anonymize domain records according to policy;
- preserve only legally required audit metadata;
- provide a clear export first where applicable.

---

## 15. AI and provenance

### 15.1 AI use cases

- voice and text extraction;
- place or branch resolution assistance;
- note summarization;
- memory retrieval synthesis;
- guide drafting;
- preference hypothesis generation;
- recommendation explanation;
- duplicate suggestion;
- missing-field prompts.

### 15.2 AI restrictions

AI is not:

- the authorization engine;
- the privacy-policy engine;
- the hard-constraint engine;
- the canonical source of user truth;
- the sole recommendation scorer;
- permitted to fabricate visits or opinions.

### 15.3 Artifact requirements

Every AI artifact should record:

- provider;
- model;
- prompt version;
- input hash;
- evidence IDs;
- actor;
- created time;
- structured output schema version;
- user acceptance or correction;
- redaction policy applied.

### 15.4 User correction

The user can correct or reject every inferred field and preference hypothesis.

AI-derived fields must remain distinguishable from user-authored fields.

---

## 16. Imports and reconstruction

Potential providers:

- calendar;
- reservation email;
- photos;
- browser or mobile share input;
- receipts;
- location history where legally and contractually permitted.

Rules:

- importing is opt-in;
- imported visits remain suggested until confirmed unless a later approved rule states otherwise;
- source is recorded;
- duplicates are reviewed;
- branch resolution uncertainty is visible;
- deletion and provider disconnection are supported;
- raw provider data is minimized.

---

## 17. Notifications and resurfacing

Useful notifications may include:

- review a recent visit;
- complete an unfinished memory;
- confirm a suggested visit;
- revisit a past trip anniversary;
- respond to a recommendation request;
- a shared guide was updated;
- a place fact changed materially;
- storage or sync issue.

Notifications must be useful, configurable, and non-addictive.

---

## 18. Search, discovery, and place data

### 18.1 Search layers

- exact name and branch;
- full-text notes;
- tags and dimensions;
- people and trip;
- geospatial radius;
- semantic similarity;
- visual memory later.

### 18.2 External place data

External provider data is enrichment, not canonical user truth.

Store:

- provider name;
- provider place ID;
- field source;
- fetched time;
- freshness or expiry;
- attribution requirements;
- match confidence.

### 18.3 Duplicate and merge policy

- never merge silently;
- preserve original references;
- provide reversible merge history;
- protect branch-specific visits;
- allow user correction.

---

## 19. Offline and mobile behavior

RCMND is designed mobile-first.

Requirements:

- capture works with weak connectivity;
- drafts persist locally;
- sync is visible and retryable;
- uploads resume;
- conflicts do not silently destroy user text;
- cached private data is minimized and protected;
- map has a list alternative;
- PWA installation remains supported;
- future native-app decision remains open.

---

## 20. Accessibility and internationalization

Requirements:

- keyboard accessibility;
- screen-reader labels;
- visible focus;
- sufficient contrast;
- reduced-motion support;
- appropriate touch targets;
- non-map alternatives;
- localized dates, currency, distance, and timezones;
- initial English and Russian readiness;
- architecture capable of additional languages.

---

## 21. Product analytics and success metrics

Analytics must not expose private content unnecessarily.

### 21.1 Activation

- first confirmed visit;
- first completed experience;
- first photo attached;
- first successful memory query;
- first recommendation generated;
- first guide shared.

### 21.2 Capture quality

- median quick-capture time;
- draft completion rate;
- repeat-visit creation rate;
- branch resolution rate;
- media upload success;
- offline recovery rate.

### 21.3 Memory value

- successful search or Ask rate;
- evidence click-through;
- correction rate;
- no-answer rate;
- time to find a remembered place.

### 21.4 Recommendation quality

- recommendation selection rate;
- visit-after-recommendation rate;
- positive outcome rate;
- rejection reasons;
- confidence calibration;
- personal versus friend versus external candidate performance.

### 21.5 Sharing value

- shares created;
- guide opens;
- saves from a shared guide;
- revocation rate;
- recipient-to-user conversion later.

### 21.6 Trust and privacy

- permission-denial correctness;
- privacy incident count;
- share-preview abandonment;
- deletion completion time;
- AI citation validity;
- unauthorized-evidence rate, target zero.

---

## 22. MVP scope

The first production-worthy MVP should include:

- shared Asita identity;
- exact Place and Branch;
- private Visit;
- quick and full Experience;
- restaurant and hotel dimensions;
- photo upload with private access;
- Journal;
- branch detail and repeat visits;
- structured filters;
- basic collections;
- deterministic privacy;
- export and deletion foundations;
- founder dogfood dataset in Kuala Lumpur.

The MVP does not require:

- public profiles;
- public feed;
- autonomous AI agent;
- full friend network;
- complex imports;
- native mobile app;
- booking marketplace;
- paid plans;
- full external discovery engine.

---

## 23. Delivery phases

### Phase 0 — Integration foundation

- preserve Daler OS;
- module registry;
- hostname and route resolution;
- feature flag;
- test and CI baseline;
- environment validation;
- normalized database and privacy foundations;
- provider interfaces;
- rollback plan.

### Phase 1 — Private capture

- identity actor;
- places and branches;
- visits;
- experiences;
- ratings;
- private media;
- Journal;
- repeat-visit history;
- privacy tests.

### Phase 2 — Memory and retrieval

- filters;
- full-text search;
- Map;
- Trips;
- semantic retrieval;
- Ask over own data;
- evidence cards;
- voice extraction behind confirmation.

### Phase 3 — Deterministic recommendations

- recommendation context;
- candidate generation;
- hard filters;
- versioned scoring;
- confidence;
- evidence bundle;
- feedback.

### Phase 4 — Controlled sharing

- collections and guides;
- relationships and circles;
- selective field policies;
- share preview;
- expiry and revocation;
- safe media derivatives.

### Phase 5 — Friend-aware recommendations

- authorized friend evidence;
- category-specific trust;
- similarity;
- own versus friend evidence labels;
- no retroactive access.

### Phase 6 — Imports and automation

- calendar;
- reservation email;
- photos;
- receipts;
- permitted location history;
- review queue.

### Phase 7 — Mobile depth and commercial model

- advanced offline sync;
- share extension;
- push notifications;
- native-app decision;
- premium tiers;
- storage billing;
- concierge and white-label evaluation.

---

## 24. Founder dogfood plan

Initial data should be built from real founder usage in Kuala Lumpur.

Suggested first categories:

- restaurants;
- hotels and resorts;
- spas and saunas;
- attractions and activities;
- camping and outdoor locations;
- equipment and specialty stores;
- business-meeting venues.

Suggested first guides:

- Daler's Best Kuala Lumpur Restaurants;
- Business Dinner Places in KL;
- Hotels with the Best Gym and Sauna;
- Weekend Experiences Around Kuala Lumpur;
- Camping Places in Malaysia;
- Avoid or Do Not Return.

The founder dogfood phase should test:

- capture time;
- usefulness of category dimensions;
- repeat-visit history;
- quality of Ask answers;
- privacy defaults;
- recommendation fit;
- guide-sharing friction.

---

## 25. Acceptance criteria for the product direction

The product direction is implemented correctly only when:

1. the exact branch is represented separately from the brand;
2. repeat visits remain separate;
3. a useful private memory can be saved quickly;
4. photos and notes remain connected to the visit;
5. private fields are denied by default;
6. another user cannot read an unshared visit;
7. Ask answers cite authorized evidence;
8. recommendations apply hard constraints before scoring;
9. recommendation reasons and confidence are visible;
10. friend evidence is clearly labeled;
11. every share has a recipient preview;
12. shares can be revoked;
13. AI-generated structure remains distinguishable and correctable;
14. Daler OS remains functional;
15. RCMND is served as an integrated Asita module rather than a fork.

---

## 26. Explicit non-goals

RCMND is not initially:

- a generic public review website;
- an influencer network;
- a social engagement feed;
- a replacement for a maps provider;
- a booking marketplace;
- a fully autonomous travel agent;
- a system that publishes location history by default;
- a system that lets AI invent personal experience;
- a reason to rewrite Daler OS unnecessarily.

---

## 27. Open founder decisions

The following remain open until explicitly resolved:

- public guide capability;
- subscription and storage pricing;
- final default numeric scale;
- selected place and map provider;
- import permissions and scope;
- delegated assistant access;
- native application timing;
- concierge and enterprise offering;
- influence of anonymous public reviews;
- alternative redirect domains.

Safe private defaults should be used while these remain open.

---

## 28. Final product rule

RCMND succeeds when it becomes the user's trusted memory of the physical world and makes recommendations that are demonstrably better because they come from real experience.

It must be:

- easy enough to capture consistently;
- structured enough to retrieve precisely;
- private enough to trust;
- evidence-backed enough to believe;
- useful enough to share;
- integrated enough to strengthen Asita Daler OS rather than fragment it.

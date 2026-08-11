# RCMND by Asita — Prediction and Learning Framework

**Purpose:** Preserve the earlier IntelFlow prediction framework and adapt it to personal experience intelligence, preference learning, recommendation confidence, and outcome calibration.

---

## 1. Core principle

A prediction is not a claim that something will certainly happen.

It is:

> A probability-weighted view of a future outcome based on evidence, drivers, timing, uncertainty, and disconfirming signals.

Within RCMND, predictions can include:

- likelihood that a user will enjoy a place;
- likelihood that a venue fits a particular occasion;
- expected quality of a repeat visit;
- likelihood that a friend's recommendation will work for the user;
- confidence in an inferred preference;
- expected recommendation outcome;
- expected deterioration or improvement based on recent evidence.

Prediction is a later intelligence layer. It must never replace direct experience or pretend to be fact.

---

## 2. General operating model

`Question → Base Rate → Drivers → Signals → Scenarios → Probabilities → Triggers → Action → Review`

Every prediction should be stored as a living, versioned object with evidence and review history.

---

## 3. Define the prediction clearly

Every prediction needs:

- question;
- subject;
- context;
- time horizon;
- success condition;
- current probability;
- evidence scope;
- owner or system actor;
- version.

Weak example:

> The user will like this restaurant.

Better example:

> There is a 74% probability that the user will rate the KLCC branch at least 8/10 for a quiet six-person business dinner during a weekday evening, assuming a private room is available.

The better prediction is measurable and context-specific.

---

## 4. Start with the base rate

Before personalization, ask what normally happens in comparable cases.

Possible base rates:

- the user's average rating for the category;
- the user's return rate after a first positive visit;
- success rate of recommendations from a particular friend;
- average outcome for similar occasion, budget, distance, and venue type;
- branch-level repeat-visit stability;
- frequency with which a stated requirement predicts rejection.

Base rates reduce narrative bias.

---

## 5. Identify the key drivers

Use a limited set of variables that actually influence the outcome.

### Structural drivers

- category;
- location;
- opening hours;
- pricing;
- availability;
- facilities;
- branch characteristics;
- travel time.

### Personal drivers

- explicit preferences;
- repeated positive or negative signals;
- dietary and accessibility needs;
- mood and occasion;
- group size;
- previous experience;
- novelty preference;
- companion context.

### Social drivers

- trusted friend's direct experience;
- similarity between friend and user tastes;
- friend category credibility;
- agreement among selected trusted users.

### Constraint drivers

- budget;
- distance;
- parking;
- private room;
- noise;
- timing;
- capacity;
- weather;
- availability.

### Catalysts

- confirmed booking;
- special event;
- renovation;
- management or chef change;
- new branch;
- updated menu;
- recent trusted visit.

### Failure points

- stale information;
- wrong branch;
- hidden hard-constraint violation;
- insufficient evidence;
- contradictory repeat visits;
- unverified external claim;
- overreliance on public popularity.

---

## 6. Separate evidence levels

Not all evidence has equal strength.

### Level 1 — Weak signal

- vague memory;
- anonymous public opinion;
- social media chatter;
- unverified provider field;
- AI inference without confirmation;
- old external rating.

### Level 2 — Useful signal

- trusted friend experience;
- recent external factual data;
- confirmed facility;
- repeated preference pattern;
- photo or reservation suggesting a visit;
- one direct user experience in a different context.

### Level 3 — Strong evidence

- direct confirmed visit;
- user-authored rating;
- repeat visits;
- clear return intent;
- direct context match;
- multiple authorized and recent direct experiences;
- actual recommendation outcome feedback.

The system must label evidence level and provenance.

---

## 7. Build scenarios

Avoid one absolute forecast.

### Base case

The most likely outcome if current conditions and known facts hold.

### Positive case

The outcome if important drivers align favorably.

### Negative case

The outcome if constraints, uncertainty, or failure points dominate.

Example:

**Question:** Will the user enjoy Hotel X for a three-night work stay?

**Base case:** Good room and location, acceptable breakfast, weak gym. Overall 7.5/10.

**Positive case:** Upgrade, quiet room, and lounge access raise the outcome above 8.5/10.

**Negative case:** Street-facing room and weak Wi-Fi reduce the outcome below 6.5/10.

Each scenario should identify what must be true and what would break it.

---

## 8. Assign probabilities

Probabilities force discipline.

Example:

- positive case: 25%;
- base case: 55%;
- negative case: 20%.

For recommendation outcomes, store component probabilities where useful:

- 90% hard-constraint compliance;
- 78% occasion fit;
- 72% taste fit;
- 64% value fit;
- 70% overall positive-outcome probability.

Do not display false precision when evidence is weak. Probability bands may be more honest:

- low confidence;
- moderate confidence;
- high confidence.

---

## 9. Define triggers and signposts

Every prediction should include observable updates.

### Leading indicators

- a new direct visit;
- a new trusted-friend visit;
- repeated selection of similar places;
- reservation behavior;
- category preference changes;
- recent rejection reasons.

### Confirmation triggers

- user visits and rates positively;
- user returns;
- user shares the recommendation;
- stated hard requirements are confirmed;
- multiple repeat visits agree.

### Invalidation triggers

- user rejects the place for a predicted reason;
- user rates below threshold;
- wrong branch was matched;
- a hard constraint failed;
- external facts were stale;
- friend similarity was overestimated;
- quality changed materially.

Triggers update probability; they do not silently rewrite the original record.

---

## 10. Add the anti-thesis

Every prediction must include the strongest reason it may be wrong.

Questions:

- What assumption carries most of the prediction?
- What information is missing?
- Is the branch match certain?
- Is the context actually comparable?
- Is friend evidence authorized and relevant?
- Is the external fact current?
- Is the model overfitting to a small number of visits?
- What would a skeptical user say?

A recommendation without an anti-thesis is vulnerable to confident but weak personalization.

---

## 11. Link prediction to action

A prediction is useful only if it changes a decision.

Possible actions:

- recommend strongly;
- recommend with caveats;
- ask one clarifying question;
- show as a discovery option rather than a trusted recommendation;
- exclude because a hard constraint failed;
- request branch confirmation;
- wait for fresher facts;
- suggest a safer alternative;
- ask the user to confirm or reject an inferred preference.

---

## 12. Review and update

Suggested cadence:

- immediately after recommendation feedback;
- after every direct visit;
- monthly for active preference hypotheses;
- quarterly for category-level trust and calibration;
- on material place updates.

Track:

- original prediction;
- probability at decision time;
- evidence used;
- new evidence;
- updated probability;
- actual outcome;
- error type;
- calibration result;
- whether the model or data was wrong.

Never rewrite the original prediction after the outcome is known.

---

## 13. RCMND prediction object

Conceptual fields:

- `id`;
- `prediction_type`;
- `subject_type`;
- `subject_id`;
- `user_id`;
- `context`;
- `time_horizon`;
- `success_condition`;
- `base_rate`;
- `drivers`;
- `scenarios`;
- `probability`;
- `confidence`;
- `evidence_ids`;
- `anti_thesis`;
- `confirmation_triggers`;
- `invalidation_triggers`;
- `recommended_action`;
- `algorithm_version`;
- `model_version`;
- `created_at`;
- `review_at`;
- `resolved_at`;
- `actual_outcome`;
- `calibration_error`.

This is a future schema direction, not Phase 1 scope.

---

## 14. Preference hypotheses

The former IntelFlow Assumption concept becomes a Preference Hypothesis.

Example:

> The user values private dining and easy parking more than public popularity for business dinners.

Statuses:

- proposed;
- active;
- user-confirmed;
- challenged;
- invalidated;
- retired.

Each hypothesis needs:

- evidence;
- contradictions;
- confidence;
- affected categories and contexts;
- user correction;
- review date.

A user can disable learning for selected fields or categories.

---

## 15. Recommendation calibration

Measure whether probability estimates are honest.

Examples:

- among recommendations given 70% positive-outcome probability, approximately 70% should produce a defined positive outcome over a sufficient sample;
- track calibration separately by category and context;
- separate direct-experience recommendations from friend and external discovery;
- track reasons for failure;
- penalize stale facts and uncertain branches;
- avoid optimizing only for clicks or saves.

The meaningful outcome is whether the user actually enjoyed or valued the experience.

---

## 16. Privacy and authorization

Predictions and preference hypotheses are private user data.

Rules:

- evidence must be authorized;
- friend evidence remains subject to its sharing policy;
- private journal details should be minimized in model inputs;
- predictions shown to another user must be redacted;
- no prediction may expose an inaccessible source;
- user deletion removes or anonymizes predictions according to policy;
- AI artifact provenance remains auditable.

---

## 17. Implementation phase

Prediction and preference-learning work begins only after:

1. private capture is reliable;
2. repeat visits exist;
3. retrieval and evidence authorization are reliable;
4. deterministic recommendation scoring exists;
5. feedback events are collected;
6. evaluation datasets exist.

Do not add an impressive prediction dashboard before enough real evidence exists.

---

## 18. One-page template

### Prediction title

**Question:**  
**Context:**  
**Time horizon:**  
**Success condition:**  
**Base rate:**  
**Key drivers:**  
**Positive case:**  
**Base case:**  
**Negative case:**  
**Current probability:**  
**Confidence:**  
**Evidence:**  
**Leading indicators:**  
**Confirmation triggers:**  
**Invalidation triggers:**  
**Main hidden assumption:**  
**Strongest counterargument:**  
**Decision implication:**  
**Next review:**  
**Actual outcome:**  
**Calibration note:**

---

## 19. Final rule

The purpose of prediction inside RCMND is not to appear certain.

It is to become:

- earlier in recognizing real preference patterns;
- clearer about uncertainty;
- faster to update after real experience;
- more honest about evidence;
- more useful in deciding what to recommend.

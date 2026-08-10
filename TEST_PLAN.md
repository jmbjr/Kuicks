# Kuicks Test Plan

Status: **Draft for review**  
Document version: **0.1-draft**  
Last updated: **2026-08-10**

This plan defines how Kuicks will be verified from pure rules through staged Android-browser releases. The first implementation target is the approved **Single-Device CPU Alpha**: one human versus two deterministic CPU players, published through GitHub Pages.

## 1. Test objectives

Testing must demonstrate that Kuicks:

- implements the approved Alpha v1 rules exactly;
- produces deterministic results for a known seed and command sequence;
- prevents illegal, duplicate, or out-of-phase actions;
- survives refresh without rerolling dice or repeating CPU actions;
- remains usable at a 320 CSS pixel viewport;
- works from the published GitHub Pages URL in an Android browser;
- communicates trail meaning without relying on color;
- preserves a clean boundary between normal games and future simulations;
- can be diagnosed using game IDs, seeds, revisions, and build versions.

## 2. Sources of truth

Tests derive expected behavior from:

1. `GAME_RULES.md`
2. `PRODUCT_REQUIREMENTS.md`
3. `GAME_MODES_AND_OPTIONS.md`
4. `UX_DESIGN.md`
5. `ARCHITECTURE.md`
6. `DATA_MODEL.md`
7. `USER_GUIDE.md`

If documents disagree, implementation pauses until the conflict is resolved and recorded. Tests must not silently choose a new rule.

## 3. Test levels

### 3.1 Pure unit tests

Unit tests cover deterministic functions without DOM, storage, timers, Firebase, or network access.

Required areas:

- seeded die generation;
- legal Table destinations;
- legal Kick combinations and destinations;
- trail progression in both directions;
- closure eligibility after five prior marks;
- seals and global trail closure;
- strike assignment;
- end-condition detection;
- triangular trail scoring;
- final totals and shared winners;
- command validation;
- schema validation and migration;
- deterministic CPU choice;
- settings and snapshot immutability.

Every rule boundary needs tests immediately below, at, and above the boundary.

### 3.2 Engine sequence tests

Sequence tests apply commands to complete or partial games and verify:

- phase order;
- active-player rotation;
- simultaneous Table resolution;
- no Kick stage after an end condition during Table resolution;
- exactly one strike when the active player makes no mark;
- revision increments;
- accepted command IDs prevent duplicate application;
- replaying the same seed and commands gives the same state;
- legal command sequences never violate engine invariants.

### 3.3 CPU tests

CPU behavior must be testable without real-time delays.

Verify that each CPU:

- chooses only legal actions;
- returns the same decision for the same state, policy, and seed;
- handles no-legal-move states;
- may decline only as its approved policy permits;
- cannot close an ineligible trail;
- does not act twice after refresh or repeated scheduling;
- completes large seeded batches without invalid state.

Action delay is a presentation setting and must not change the selected move.

### 3.4 Persistence tests

Persistence tests verify:

- round-trip save and restore;
- exact restoration of roll, phase, active player, sheets, strikes, random state, revision, and accepted commands;
- refresh before and after each accepted action;
- recovery while a CPU action is pending;
- rejection of corrupt or unsupported data with a safe message;
- sequential migration of supported older schemas;
- confirmation before replacing an unfinished game;
- isolation between preferences, profiles, active-game pointer, and game snapshots.

### 3.5 UI and accessibility tests

Test the full human flow with touch and keyboard.

Verify:

- legal cells and combinations are clear;
- disabled controls cannot dispatch commands;
- Table and Kick stages are visually and textually distinct;
- trail names, icons, directions, and patterns carry meaning without color;
- current player, CPU activity, closures, strikes, and end state are announced clearly;
- focus remains sensible after actions and dialogs;
- repeated taps do not duplicate actions;
- reduced-motion preferences are respected;
- text enlargement does not hide essential actions;
- no primary flow requires horizontal page scrolling at 320 CSS pixels.

Automated accessibility checks supplement, but do not replace, manual keyboard, screen-reader, contrast, and touch testing.

### 3.6 PWA and deployment tests

For each approved playable build:

- publish through GitHub Pages;
- load it from a clean Android browser session;
- verify manifest and icons;
- install as a PWA when supported;
- confirm the displayed build version matches the tested commit;
- refresh and reopen without losing a compatible active game;
- verify cached single-device play after an initial online load;
- publish a newer build and verify cache update behavior;
- confirm offline status does not block a valid cached game.

Firebase and separate-phone tests are deferred until their implementation issues begin.

## 4. Required rule cases

At minimum, automated cases must cover:

| Area | Required cases |
|---|---|
| Dice | values stay within 1–6; same seed repeats; continued random state survives restore |
| Progression | first mark; legal later mark; same/earlier value rejected; skipped cells remain unavailable |
| Closure | 4, 5, and 6 prior marks; final value; seal awarded once; globally closed trail rejects later marks |
| Table | accept, decline, multiple participants, simultaneous same-trail closure |
| Kick | either neutral die, matching colored die, duplicate totals, non-active player rejected |
| Strike | neither action; Table only; Kick only; both actions; fourth strike ends game |
| End | first closure; second closure; fourth strike; end during Table; no later Kick |
| Score | 0–11 effective marks; seal contribution; strike deductions; negative totals; tied winners |
| Commands | stale revision; duplicate command ID; invalid phase; invalid participant; post-game command |
| Resume | every phase boundary; pending CPU; completed game; corrupt snapshot |

## 5. Deterministic fixtures

Maintain small, readable fixtures for important states rather than depending only on random play:

- fresh game;
- rising and falling trail progression;
- closure ineligible and eligible;
- one trail already closed;
- game one action from a second closure;
- player on three strikes;
- no legal Table action;
- no legal Kick action;
- tied final scores;
- pending CPU action;
- migrated historical snapshot.

Each fixture records its schema version and must pass validation before use.

## 6. Simulation-assisted testing

A fast in-memory harness may run thousands of seeded CPU games to detect:

- illegal states;
- nontermination;
- impossible scores;
- revision or phase anomalies;
- nondeterministic replays;
- CPU policy regressions.

These are test or experiment records, not ordinary family games. High-speed runs must not write each game to Firestore or permanent family statistics.

Simulation success does not replace targeted rule assertions or phone testing.

## 7. Alpha test matrix

The minimum release matrix is:

| Surface | Minimum coverage |
|---|---|
| Automated | Current project-supported test runtime |
| Desktop sanity | Current Chrome or Chromium |
| Android browser | Current Chrome on the primary test phone |
| Narrow viewport | 320 CSS px portrait |
| Orientation | Portrait required; landscape sanity check |
| Input | Touch required; keyboard sanity check |
| Network | Online first load; cached offline continuation |
| Lifecycle | Refresh, browser close/reopen, installed-PWA reopen |
| Players | One human plus 1, 2, and 4 CPUs; two CPUs is the main path |

Additional devices and browsers are useful evidence but do not replace the minimum matrix.

## 8. Staged implementation gates

### Gate A: Shell

- GitHub Pages loads on Android.
- Layout works at 320 CSS pixels.
- Build version is visible.
- PWA metadata is valid.
- No gameplay correctness claim is made.

### Gate B: Pure engine

- Required rule unit and sequence tests pass.
- Seeded replays are deterministic.
- No rendering or storage is required to run the tests.

### Gate C: CPU and setup

- One human and configurable CPU participants can be created.
- CPUs choose legal deterministic actions without UI timers in tests.
- Profile IDs are distinct from display names.

### Gate D: Playable game

- A complete one-human-versus-two-CPU game can finish.
- All scoring and end conditions match the engine.
- Android touch flow is usable.

### Gate E: Recovery

- Refresh at every phase restores exact state.
- Pending CPU work resumes once.
- Duplicate taps and commands do not duplicate effects.

### Gate F: Alpha refinement

- Accessibility, offline, install, cache update, error states, and phone-test checklist pass.
- User approval is recorded before the implementation issue closes.

## 9. Issue-level test requirements

Every implementation issue must include:

- behavior under test;
- relevant edge cases;
- automated acceptance tests;
- manual Android phone steps;
- expected results;
- dependencies;
- build or commit identifier;
- evidence needed for approval.

An issue remains open while the user tests the published build. It closes only after explicit approval.

## 10. Defect reporting

A useful defect report includes:

- issue number;
- GitHub Pages URL;
- commit/build version;
- phone, Android, browser, and installation mode;
- viewport/orientation and display scaling when relevant;
- game ID, seed, revision, phase, and active participant;
- exact steps;
- expected and actual result;
- screenshot or recording when useful;
- whether refresh reproduces or changes the problem.

For duplicate CPU actions or divergent replay, preserve the saved snapshot and recent command history when possible.

## 11. Release-blocking failures

The Alpha build must not be approved with any known defect that:

- permits an illegal mark;
- produces incorrect scoring, closure, strike, or winner results;
- changes a deterministic replay;
- loses or duplicates an accepted action;
- rerolls or double-runs a CPU after refresh;
- prevents completion of the main one-human-versus-two-CPU flow;
- makes essential controls unusable at 320 CSS pixels;
- depends on color alone;
- silently discards an active game;
- serves an old build without a recoverable update path.

Lower-severity cosmetic defects may be deferred only when recorded in an issue and explicitly accepted.

## 12. Completion criteria

The Single-Device CPU Alpha is test-complete when:

1. All required automated tests pass from a clean checkout.
2. The published GitHub Pages commit matches the reviewed build.
3. One-human-versus-two-CPU play completes on the Android test phone.
4. At least one full game has been tested across refresh/reopen boundaries.
5. Seeded replay and duplicate-command protections are verified.
6. 320 px, color-independent, touch, keyboard, and reduced-motion checks pass.
7. Offline continuation works after a successful initial load.
8. Known limitations are documented.
9. The user explicitly approves the staged build.

## 13. Approval gate

This document is a **draft for review**. After explicit approval, update its status to **Approved alpha baseline**, set its version to **1.0-alpha**, and commit the approval checkpoint before implementation relies on it.

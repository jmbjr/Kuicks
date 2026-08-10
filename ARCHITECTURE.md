# Kuicks Architecture

Status: **Approved alpha baseline**  
Document version: **1.0-alpha**  
Rules dependency: **GAME_RULES.md 1.0-alpha (approved)**  
Requirements dependency: **PRODUCT_REQUIREMENTS.md 1.0-alpha (approved)**  
Modes dependency: **GAME_MODES_AND_OPTIONS.md 1.0-alpha (approved)**  
UX dependency: **UX_DESIGN.md 1.0-alpha (approved)**  
Last updated: **2026-08-10**

## 1. Purpose

This document defines the technical architecture for Kuicks. It preserves the low-complexity, GitHub Pages-friendly delivery model proven by the reference horse-racing project while establishing clearer boundaries between rules, game orchestration, presentation, persistence, CPU behavior, and future online synchronization.

The first implementation target is the **Single-Device CPU Alpha**: one human and one to four CPU participants on one Android phone, delivered through GitHub Pages and usable in a browser or as an installed PWA. Firebase, separate-phone play, shared statistics, and high-speed experiments are later phases, but the initial boundaries must allow those capabilities without rewriting the rules engine.

## 2. Architectural principles

1. **Rules are pure.** Legal moves, state transitions, trail closure, strikes, end conditions, and scores are deterministic functions of explicit inputs.
2. **State is authoritative.** The rendered interface is a projection of game state and UI state; the DOM is never the source of truth.
3. **Randomness is injected.** Dice rolls and CPU tie-breaking consume a recorded deterministic random source.
4. **Identity uses stable IDs.** Names are display data, never database keys or seat identity.
5. **Durable actions are idempotent.** Refresh, retries, listeners, and reconnects cannot apply the same logical action twice.
6. **Mode adapters do not redefine rules.** Local, pass-the-phone, online, CPU, and simulation modes share one rule engine.
7. **The alpha stays small.** Use browser-native modules and static assets; avoid a framework or backend build pipeline until demonstrated complexity justifies one.
8. **Historical data is interpreted defensively.** Every durable record has a schema version and safe defaults for missing fields.
9. **Experiments are isolated.** Fast simulations do not emit normal game writes or pollute family statistics.
10. **Phone behavior is the release authority.** Automated checks support, but do not replace, staged Android-browser testing.

## 3. System context

| Boundary | Alpha responsibility | Future responsibility |
|---|---|---|
| GitHub Pages | Serve versioned static application assets | Continue as the production web host |
| Browser/PWA | Render UI, run rules and CPU logic, persist active local game | Offline shell, installability, background-safe recovery |
| Local storage adapter | Profiles, settings, active game, recovery metadata | Pass-the-phone state and online seat-reclaim hints |
| Firebase boundary | Not required for alpha | Anonymous auth, rooms, synchronized actions, profiles, history, statistics |
| Rule engine | All legal game behavior | Same engine for every mode and simulation |
| CPU engine | Deterministic legal action selection | Multiple policies, evaluation, and experiments |

No server process is required for the alpha. The browser downloads static files from GitHub Pages and performs all game computation locally.

## 4. Repository and application structure

Use a small native JavaScript module structure rather than concentrating the application in one large HTML file.

```text
/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── assets/
│   ├── icons/
│   └── patterns/
├── css/
│   ├── tokens.css
│   └── app.css
├── js/
│   ├── app.js
│   ├── config.js
│   ├── rules/
│   │   ├── model.js
│   │   ├── legal-actions.js
│   │   ├── transition.js
│   │   └── scoring.js
│   ├── game/
│   │   ├── controller.js
│   │   ├── commands.js
│   │   └── random.js
│   ├── cpu/
│   │   ├── policies.js
│   │   └── choose-action.js
│   ├── persistence/
│   │   ├── local-store.js
│   │   └── migrations.js
│   ├── ui/
│   │   ├── render.js
│   │   ├── views.js
│   │   ├── dialogs.js
│   │   └── accessibility.js
│   └── online/                 # Added only with separate-phone work
│       ├── firebase.js
│       ├── room-store.js
│       └── sync.js
└── tests/
    ├── rules/
    ├── cpu/
    ├── persistence/
    └── fixtures/
```

Exact file splitting may evolve issue by issue. The required boundary is more important than the exact filenames. The first shell may contain fewer modules, but rule code must not be embedded in rendering handlers.

## 5. Application layers

### 5.1 Pure domain layer

The domain layer contains no DOM, browser storage, timers, Firebase calls, network access, or unrecorded randomness. It accepts serializable values and returns serializable values.

Required responsibilities:

- create a valid initial game state from a configuration and participant list;
- enumerate legal Table and Kick actions;
- validate a proposed command against state and phase;
- apply one accepted command to produce a new state;
- close trails and propagate global closure;
- assess strikes and end triggers;
- compute scores, ranks, winners, and ties;
- expose invariant checks useful in tests and development diagnostics.

### 5.2 Game orchestration layer

The controller coordinates turns and effects without owning rule truth. It:

- requests and records dice results;
- asks the rule engine for legal actions;
- requests a human choice or CPU decision;
- submits commands through the same validation path;
- schedules cancellable presentation delays;
- persists after every authoritative transition;
- emits render-ready state changes;
- resumes safely from any persisted phase.

### 5.3 Adapter layer

Adapters connect domain behavior to local storage, Firebase, clocks, random generators, and future workers. Each adapter must have a narrow interface so tests can substitute an in-memory implementation.

### 5.4 Presentation layer

The presentation layer renders semantic HTML from state and dispatches user intent as commands. It may hold ephemeral UI state but cannot directly mark cells, advance turns, assess strikes, or calculate scores.

## 6. Game state versus UI state

### 6.1 Authoritative game state

Authoritative state is sufficient to reconstruct the game after a refresh. At minimum it contains:

- schema and rules versions;
- unique game ID and mode;
- immutable settings snapshot;
- participant IDs, types, seat order, and profile snapshots;
- active seat, round/turn number, and explicit phase;
- current roll and deterministic random state or roll history;
- each participant's trail marks and strikes;
- globally closed trails and closure metadata;
- accepted command/action IDs and recent authoritative events;
- start, update, pause, and completion metadata;
- completion result when ended.

### 6.2 Ephemeral UI state

UI state may include:

- open accordion or dialog;
- selected but unconfirmed action;
- transient announcement text;
- scroll/focus target;
- whether CPU animation is currently displayed;
- reduced-motion and display preferences.

Ephemeral UI state must not determine legality. A refresh may discard most UI state without changing the game.

### 6.3 Derived state

Legal targets, running scores, closure eligibility, progress counts, status messages, and end-condition warnings should be derived from authoritative state. Persist a derived value only when needed for an immutable historical snapshot or query efficiency, and verify it against the engine at write time.

## 7. Domain model and commands

Use plain serializable objects and explicit discriminated command types. Representative commands include:

- `START_GAME`
- `ROLL_DICE`
- `MARK_TABLE_VALUE`
- `PASS_TABLE_ACTION`
- `MARK_KICK_VALUE`
- `PASS_KICK_ACTION`
- `ASSESS_STRIKE`
- `ADVANCE_TURN`
- `PAUSE_GAME`
- `RESUME_GAME`

A single user tap need not map one-to-one to a persisted command; orchestration may translate intent into the smallest authoritative transition. Commands that can be retried carry a unique `commandId`, expected game revision, actor/seat ID, and issued timestamp where relevant.

The transition result should use a consistent shape:

```js
{
  accepted: true,
  state: nextState,
  events: [{ type: "TRAIL_MARKED", ... }],
  effects: [{ type: "PERSIST_STATE" }]
}
```

Rejected commands return a stable reason code and leave the input state unchanged.

## 8. Turn state machine

The game phase must be explicit and persistable. The baseline states are:

1. `AWAITING_ROLL`
2. `TABLE_ACTIONS`
3. `KICK_ACTION`
4. `RESOLVING_TURN`
5. `COMPLETED`

Future modes may add `PAUSED` or room/lobby states outside the active-game machine. Shared Table choices are collected for all eligible participants before the active participant's Kick action. If Table resolution ends the game, the Kick phase is not entered, matching the approved rules.

Transitions are engine-controlled. UI code cannot skip directly to another phase. A persisted game may resume in any phase without rerolling or replaying an accepted action.

## 9. Deterministic randomness

All game creation includes a seed. A small documented pseudo-random generator supplies die values and any permitted CPU tie-breaking.

Requirements:

- identical seed, settings, participants, and commands reproduce identical results;
- current generator algorithm and generator state are versioned;
- a roll is recorded before any animation begins;
- refresh never requests a replacement roll;
- tests may supply fixed rolls directly;
- simulation loops can create independent derived seeds without browser storage writes.

Cryptographic randomness is not required for local alpha play. Future online play must make the room-authoritative roll auditable and prevent clients from independently choosing results.

## 10. CPU action engine

CPU participants use the same legal-action enumeration and command validation as humans. CPU code may choose among legal actions but may not mutate the score sheet directly.

The CPU interface accepts:

- an immutable game-state snapshot;
- the acting participant ID;
- available legal actions;
- a policy configuration;
- deterministic random input when a policy permits tie-breaking.

It returns either one legal action descriptor or an explicit pass. The initial policy should be deterministic and explainable, favoring useful progress while accounting for skipped cells, closure opportunities, strikes, and game-end risk. Visual delay belongs to orchestration/UI and must not affect the choice. Tests run with zero delay.

Longer simulations should execute in batches with cooperative yielding or a Web Worker so the interface remains responsive. Worker introduction is deferred until simulation work begins.

## 11. Local persistence

### 11.1 Storage choice

Use `localStorage` for the small alpha state unless measured state size or transactional needs justify IndexedDB. Access must be isolated behind `local-store.js`; no UI or rule module reads storage directly.

### 11.2 Stored namespaces

Use distinct, versioned keys for:

- application preferences;
- family/local player profiles;
- active game pointer;
- active game snapshot;
- optional completed local summaries;
- last known application/schema version.

### 11.3 Safe writes

Persist a complete validated snapshot after every authoritative transition. Serialize first, then replace the stored value. Include `gameId`, `revision`, `schemaVersion`, and `updatedAt`. On load:

1. parse defensively;
2. validate required shape;
3. migrate supported older versions;
4. re-check domain invariants;
5. resume the recorded phase or offer a safe recovery choice.

Corrupt or unsupported data must never crash the home screen. Preserve diagnostic context where practical and offer to start a new game only after a clear warning.

## 12. Firebase integration boundary

Firebase is not loaded or required in the Single-Device CPU Alpha. When separate-phone work begins, add it behind online adapters rather than importing Firestore into rule, CPU, or rendering modules.

The future boundary provides operations such as:

- authenticate anonymously;
- create/join/watch a room;
- claim or reclaim a seat using stable IDs and a private reclaim credential;
- submit an idempotent command at an expected revision;
- observe authoritative snapshots/events;
- finalize a completed game once;
- update derived statistics through idempotent records.

Firestore transactions or equivalent compare-and-set behavior must validate room revision, phase, actor, and command ID. Security rules enforce identity and shape constraints but do not replace domain validation in application code.

Firebase configuration is public client configuration and may live in a dedicated config module. Secrets, admin credentials, and service-account keys must never ship in the repository or browser bundle.

## 13. Online synchronization model

For separate phones, use a single room-authoritative state with a monotonically increasing revision. Clients submit commands; one accepted transaction advances the revision. Listeners render the resulting state.

Core guarantees:

- at most one accepted transition for a command ID;
- stale expected revisions are rejected and refreshed;
- only the eligible seat may submit seat-specific choices;
- shared-phase submissions are recorded independently and resolved once;
- refresh/reconnect can reclaim the same seat without creating a duplicate participant;
- completion creates one stable completed-game record keyed by game ID;
- clients tolerate duplicate listener snapshots and out-of-order local callbacks.

The exact Firestore documents, indexes, and rules belong in `DATA_MODEL.md` and `FIREBASE_SETUP.md`.

## 14. Rendering architecture

Use semantic HTML and event delegation rooted in the current view. Rendering may initially replace bounded view regions instead of implementing a virtual DOM. Preserve focus and announcements deliberately after replacement.

Rendering responsibilities:

- project game and UI state into the screen inventory defined in `UX_DESIGN.md`;
- show legal actions without independently computing them;
- attach stable `data-action` and entity-ID attributes;
- prevent double submission while a command is pending;
- make trail name, symbol, pattern, direction, and state available without color;
- update a polite or assertive live region only for meaningful state changes;
- honor reduced motion and usable touch targets.

Avoid inline event handlers and game logic in HTML templates. Content inserted from player names or remote records must be rendered as text, not trusted HTML.

## 15. Effects, timing, and concurrency

Rules transitions are synchronous. Storage, Firebase writes, animations, timers, and worker messages are effects coordinated outside the engine.

Every asynchronous task that can become stale should carry the game ID and revision that initiated it. Before applying its result, confirm that the active game still matches. CPU delays must be cancellable on refresh, new game, completion, or mode exit. Disable or deduplicate repeated taps at the command boundary, not merely with visual styling.

Use the browser clock only for timestamps and presentation. Game legality must not depend on elapsed wall-clock time in the alpha.

## 16. Statistics and completed-game pipeline

Normal games emit one canonical completed-game summary after the engine reaches `COMPLETED`. The summary snapshots:

- game and schema IDs/versions;
- mode and settings;
- participant profile IDs and display snapshots;
- final sheets, scores, ranks, winners, and tie state;
- timing and completion reason;
- seed/random algorithm version where retention is appropriate.

The completed game is the durable source for statistics. Aggregates are derived and rebuildable. The finalization operation is idempotent by game ID, and per-player aggregate updates use stable contribution IDs so retrying cannot double-count.

Simulation and Experiment Lab runs bypass this pipeline unless the user explicitly saves an aggregate experiment summary. They never create normal completed-game or family-statistic records.

## 17. Service worker and cache strategy

The app shell uses an explicit cache version, for example `kuicks-shell-v1`. Each approved published build that changes cached assets increments the cache version as required by the iteration workflow.

Recommended strategy:

- precache the minimal shell and local assets;
- serve hashed or versioned static resources cache-first;
- use network-first behavior for navigation with a cached shell fallback;
- never cache Firebase writes or treat service-worker cache as game persistence;
- delete obsolete Kuicks-owned caches during activation;
- display build/version information for phone-test diagnosis;
- notify the user when a new build is ready rather than replacing an active game mid-turn.

The first deployable shell must be tested for first load, refresh, installed-PWA launch, offline relaunch after one successful visit, and upgrade from the previous cache version.

## 18. Versioning and backward compatibility

Track these versions independently:

| Version | Purpose |
|---|---|
| App/build version | Identifies deployed code and phone-test build |
| Cache version | Controls service-worker asset replacement |
| Game schema version | Interprets active and completed game records |
| Rules version | Identifies behavioral rule baseline |
| Settings schema version | Interprets saved options |
| Random algorithm version | Reproduces seeded games |

Migrations are explicit pure functions where possible: `v1 -> v2`, then `v2 -> v3`. Do not overwrite a stored record until migration and invariant validation succeed. Missing optional historical fields receive documented safe defaults. Unsupported future versions are read-only/rejected with a clear recovery message rather than guessed.

Rules changes that affect legal play do not silently alter an active game. Each game snapshots its rules version and settings at creation.

## 19. Error handling and observability

Use stable error codes internally and concise human messages in the UI. Development diagnostics may include build version, game ID, revision, phase, schema version, last command type, and adapter error code, but must exclude reclaim tokens or other sensitive values.

Expected categories include:

- invalid or stale command;
- corrupt/unsupported local snapshot;
- storage quota or write failure;
- stale application cache;
- offline/network unavailable;
- authentication or Firestore permission failure;
- room missing, expired, or seat unavailable.

Errors must preserve the last known valid state. A recoverable adapter failure must not partially advance the domain state.

## 20. Security and privacy

- Treat all names and remote fields as untrusted text.
- Never use display names as identity or document paths.
- Store only data needed for play, recovery, and approved history/statistics.
- Do not put secrets, service-account credentials, or private tokens in the client repository.
- Keep seat-reclaim credentials out of logs and public room documents.
- Validate all online commands by authenticated user/seat, expected revision, phase, and shape.
- Keep experimental runs local by default.
- Provide a future path to rename or retire family profiles without rewriting historical identity.

## 21. Testing architecture

Tests should be runnable without a browser wherever practical.

### 21.1 Pure unit tests

Cover initialization, legal actions, progressive marking, closures, strikes, turn transitions, end conditions, scoring, ties, invariants, migrations, seeded rolls, and CPU decisions.

### 21.2 Adapter tests

Use in-memory storage and fake online adapters to verify save/resume, revision conflicts, duplicate commands, completion idempotency, and migration failure behavior.

### 21.3 Browser tests

Verify rendering, focus, keyboard/touch interaction, live announcements, 320 px layout, refresh recovery, CPU timing cancellation, and service-worker upgrades.

### 21.4 Physical-phone tests

Each staged issue includes a focused Android checklist and remains open until the user approves the deployed build. The authoritative end-to-end environment is the GitHub Pages URL on an Android browser.

Detailed test cases and compatibility matrices belong in `TEST_PLAN.md`.

## 22. Performance budgets

The alpha should remain small enough for fast mobile loading and immediate interaction. Initial targets:

- no application framework runtime;
- no Firebase download in modes that do not use it;
- rules and CPU decisions complete within one animation frame for normal play on the target phone class;
- persistence does not visibly block interaction;
- no horizontal page scrolling at 320 CSS pixels;
- simulation batches yield often enough to keep cancel/progress controls responsive;
- cache/app version visible for diagnosing stale builds.

Exact asset-size and timing budgets may be tightened after the minimal shell is measured on the target Android device.

## 23. Deployment architecture

GitHub `main` is the approved source baseline. GitHub Pages serves the static application from the repository's configured Pages source. Deployment must require no server-side rendering, secret injection, or proprietary build service.

For each approved playable issue:

1. preserve unrelated user changes;
2. validate syntax and relevant automated behavior;
3. increment the service-worker cache version when cached assets change;
4. publish to `main` under the approved project workflow;
5. verify the public Pages build/version;
6. record implementation notes and focused Android test steps on the issue;
7. leave the issue open while the user tests;
8. close only after explicit approval.

Documentation approvals may publish directly without a playable deployment change. Gameplay implementation remains gated until the documentation phase is approved.

## 24. Evolution and modularization triggers

Do not add infrastructure solely for hypothetical scale. Revisit the architecture when evidence shows one of these triggers:

- repeated manual DOM updates make focus/state correctness unreliable;
- simulations block the UI despite cooperative batching;
- local records exceed comfortable `localStorage` size or transactional needs;
- Firebase adapters need shared validation generated from schemas;
- multiple pages/routes become genuine navigation concepts;
- module count or tests justify a lightweight bundler;
- offline update behavior requires more sophisticated asset revisioning.

Likely future changes include a Web Worker for simulation, IndexedDB for larger local histories, runtime schema validation at online boundaries, and a build step for asset hashing. None is required for the first playable milestone.

## 25. Architectural acceptance criteria

The architecture is ready for implementation planning when:

1. all approved rules can be expressed as pure deterministic transitions;
2. human and CPU actions use the same legal-action and validation path;
3. game state is sufficient to recover any active phase without rerolling;
4. UI state and game state are explicitly separated;
5. Firebase is absent from the alpha execution path and isolated for later use;
6. stable IDs, schema versions, rules versions, settings snapshots, and idempotent command concepts exist from the beginning;
7. normal games, simulations, and experiments have distinct persistence pipelines;
8. GitHub Pages/PWA deployment and cache upgrades are specified;
9. Android phone testing remains an explicit release gate;
10. the proposed file structure can begin small without collapsing layer boundaries;
11. no requirement depends on a proprietary server or secret in the browser;
12. future data-model and Firebase documents can refine storage without changing domain rules.

## 26. Decisions deferred to implementation issues

The following choices do not materially change the product requirements and may be validated in focused implementation issues:

- exact native test runner and optional bundler, if any;
- `localStorage` key names;
- specific seeded PRNG algorithm;
- full-snapshot versus event-assisted rendering granularity;
- whether initial CPU scheduling uses microtasks, timers, or an async queue;
- exact service-worker navigation fallback implementation;
- asset hashing before a build pipeline exists.

Each selection should favor the smallest browser-compatible approach, be recorded in `DECISIONS.md`, and remain replaceable behind the boundaries in this document.

## 27. Approval gate

Approved by the product owner as the Alpha v1 architecture baseline on **2026-08-10**. This approval does not by itself authorize gameplay implementation. Material architectural changes after approval require a dated decision entry, compatible document updates, and approval before implementation.

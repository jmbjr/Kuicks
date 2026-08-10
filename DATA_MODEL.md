# Kuicks Data Model

Status: **Approved alpha baseline**  
Document version: **1.0-alpha**  
Last updated: **2026-08-10**

This document defines Kuicks data ownership, identity, persistence, synchronization, history, and migration requirements. It implements the boundaries established by the approved Alpha v1 rules, product requirements, modes/options, UX, and architecture documents.

The first playable milestone is the **Single-Device CPU Alpha**. Its authoritative state is stored in the browser and tested from the GitHub Pages build on Android. Firestore structures are specified for compatibility with later separate-phone play but are not required by the alpha.

## 1. Design principles

1. Use stable IDs for identity; never use display names as keys.
2. Snapshot game settings and participant labels when a game begins.
3. Store enough authoritative state to resume any phase without rerolling or replaying accepted actions.
4. Keep UI-only state outside authoritative game records.
5. Make retried commands and completed-game writes idempotent.
6. Version every durable schema from the beginning.
7. Treat missing historical fields defensively.
8. Keep normal games, simulations, and experiments in separate persistence pipelines.
9. Derive statistics from canonical completed-game records.
10. Never write each high-speed simulation turn to Firestore.

## 2. Identifier types

| ID | Purpose | Stability |
|---|---|---|
| `profileId` | Permanent family/local player identity | Permanent |
| `gameId` | Active and completed game identity | Permanent |
| `participantId` | Seat identity within one game | Permanent for that game |
| `commandId` | Deduplicates a requested transition | Permanent |
| `roomId` | Online room document identity | Permanent |
| `seatId` | Online room seat identity | Permanent for that room |
| `experimentId` | Saved experiment summary identity | Permanent |
| `contributionId` | Deduplicates one game/player statistics contribution | Permanent |

IDs should be UUIDs or equivalently collision-resistant opaque values. Display names may change and must never be document IDs, object keys, authorization claims, or join credentials.

## 3. Schema/version fields

Durable records include the versions needed to interpret them:

```js
{
  schemaVersion: 1,
  rulesVersion: "1.0-alpha",
  settingsSchemaVersion: 1,
  randomAlgorithmVersion: 1,
  appBuildVersion: "..."
}
```

Not every record needs every field, but every authoritative game and completed-game record does. Version numbers are integers unless the referenced artifact uses a semantic version string.

## 4. Local-storage namespaces

Alpha v1 uses these logical namespaces:

```text
kuicks.preferences.v1
kuicks.profiles.v1
kuicks.activeGame.v1
kuicks.game.{gameId}.v1
```

Optional later local records may use:

```text
kuicks.completedGames.v1
kuicks.experiments.v1
```

Each value is wrapped in an envelope:

```js
{
  schemaVersion: 1,
  recordType: "game",
  recordId: "game-uuid",
  revision: 17,
  updatedAt: "2026-08-10T12:00:00.000Z",
  payload: {}
}
```

`kuicks.activeGame.v1` is a pointer containing the active `gameId`, not a second independently editable copy of the game.

## 5. Player profiles

A family/local profile is independent of any one game:

```js
{
  schemaVersion: 1,
  profileId: "profile-uuid",
  displayName: "Player",
  profileType: "human", // human | cpu
  status: "active",     // active | retired
  avatarKey: null,
  accessibilityPreferences: {},
  cpuDefaults: null,
  createdAt: "...",
  updatedAt: "..."
}
```

Rules:

- Renaming a profile does not rewrite historical games.
- Retiring a profile hides it from normal setup but preserves history.
- CPU profiles use the same stable identity model as humans.
- A profile may appear at most once in a normal game unless a future option explicitly permits otherwise.
- CPU policy and difficulty are snapshotted into the participant, not read live from the mutable profile after game start.

## 6. Game settings snapshot

Settings become immutable when the game starts:

```js
{
  mode: "singleDeviceCpu",
  participantCount: 3,
  startingSeatMethod: "seededRandom",
  cpuActionDelayMs: 600,
  cpuPolicyId: "baseline",
  cpuPolicyVersion: 1,
  minimumMarksBeforeClose: 5,
  strikeValue: -5,
  strikeEndCount: 4,
  closedTrailEndCount: 2
}
```

The alpha uses approved defaults. Future configurable values must record whether they affect balance, and settings locked after start cannot be changed in an active record.

## 7. Authoritative game record

```js
{
  schemaVersion: 1,
  gameId: "game-uuid",
  gameKind: "normal", // normal | simulation | experiment
  status: "active",   // setup | active | paused | completed | abandoned
  revision: 17,

  rulesVersion: "1.0-alpha",
  settingsSchemaVersion: 1,
  randomAlgorithmVersion: 1,
  appBuildVersion: "...",
  settings: {},

  participants: [],
  currentSeatIndex: 0,
  turnNumber: 4,
  phase: "tableChoices",

  roll: {},
  tablePhase: {},
  closedTrails: {},
  acceptedCommandIds: [],

  randomState: {},
  createdAt: "...",
  startedAt: "...",
  updatedAt: "...",
  completedAt: null,
  completion: null
}
```

Authoritative phases align with the approved state machine:

- `awaitingRoll`
- `tableChoices`
- `kickChoice`
- `turnEnd`
- `completed`

Equivalent internal capitalization is acceptable if serialization is stable and documented.

## 8. Participant snapshot

```js
{
  participantId: "participant-uuid",
  profileId: "profile-uuid",
  seatIndex: 0,
  participantType: "human",
  displayNameSnapshot: "Player",
  cpuPolicySnapshot: null,
  sheet: {},
  strikes: 0,
  tableChoiceStatus: "pending"
}
```

The display-name snapshot preserves how the player was identified when the game occurred. The stable `profileId` supports longitudinal statistics.

## 9. Score sheet and trail state

```js
{
  trails: {
    sun: {
      markedIndices: [0, 2, 5],
      hasSeal: false
    },
    spark: {
      markedIndices: [],
      hasSeal: false
    },
    wave: {
      markedIndices: [0, 3],
      hasSeal: false
    },
    leaf: {
      markedIndices: [],
      hasSeal: false
    }
  }
}
```

Rules:

- Store ordered trail indices, not only printed values, so direction is unambiguous.
- Indices are unique and strictly increasing.
- Running scores and legal cells are derived, not authoritative.
- `hasSeal` is true only if that participant marked the close index.
- Strikes are participant state, outside individual trails.

## 10. Closed-trail state

```js
{
  sun: {
    closed: true,
    closedOnTurn: 8,
    closedInPhase: "tableChoices",
    closedByParticipantIds: ["participant-a", "participant-b"],
    commandIds: ["command-a", "command-b"]
  }
}
```

Multiple closers are permitted during simultaneous Table resolution. A trail closes once globally while each qualifying participant receives a seal.

## 11. Roll and phase state

A persisted roll contains the fixed dice result:

```js
{
  turnNumber: 4,
  tableDice: [3, 5],
  trailDice: {
    sun: 2,
    spark: 6,
    wave: 1,
    leaf: 4
  },
  rolledByCommandId: "command-uuid"
}
```

Closed trails omit their trail die or explicitly store it as unavailable. Refreshing must display this record and must not generate another roll.

The Table phase records one pending/submitted/resolved choice per participant. Submitted choices are evaluated against the phase-opening eligibility snapshot so simultaneous closures remain deterministic.

## 12. Commands and idempotency

A retryable command has this logical shape:

```js
{
  commandId: "command-uuid",
  gameId: "game-uuid",
  expectedRevision: 17,
  actorParticipantId: "participant-uuid",
  type: "MARK_TABLE_VALUE",
  payload: {},
  issuedAt: "..."
}
```

Acceptance rules:

- A `commandId` changes state at most once.
- A stale `expectedRevision` is rejected without mutation.
- Duplicate accepted commands return the established outcome or a no-op.
- UI taps, CPU choices, refresh recovery, and future online clients use the same command boundary.
- Implementations may retain a bounded recent command ledger during active play, but completed records must preserve enough information to prevent duplicate finalization.

## 13. Random state

```js
{
  seed: "opaque-seed",
  algorithm: "documented-prng",
  algorithmVersion: 1,
  state: "...",
  drawsConsumed: 26
}
```

The seed, algorithm version, settings, participant order, and accepted command sequence must reproduce the game. CPU tie-breaking that uses randomness consumes the same documented deterministic source or a clearly derived substream.

## 14. Completion record

When the engine enters `completed`, it freezes:

```js
{
  reason: "twoTrailsClosed", // twoTrailsClosed | fourthStrike
  finalRevision: 42,
  winningParticipantIds: ["participant-a"],
  isTie: false,
  results: [
    {
      participantId: "participant-a",
      profileId: "profile-uuid",
      rank: 1,
      finalScore: 63,
      trailScores: { sun: 28, spark: 10, wave: 21, leaf: 9 },
      strikeCount: 1,
      strikePoints: -5
    }
  ]
}
```

A completed game is immutable except for migration into a semantically equivalent newer schema.

## 15. Completed-game history

Future local or Firestore history uses `gameId` as the document ID:

```text
completedGames/{gameId}
```

The record contains:

- version fields and immutable settings snapshot;
- mode and game kind;
- participant/profile/display-name snapshots;
- final sheets and score breakdowns;
- winners, ranks, ties, and completion reason;
- timestamps and duration where available;
- deterministic seed metadata where retention is appropriate;
- one stable finalization ID.

Writing the same completed game again replaces nothing and adds no duplicate statistics.

## 16. Statistics model

Completed games are canonical; aggregates are rebuildable.

Recommended future paths:

```text
playerStats/{profileId}
playerStats/{profileId}/contributions/{gameId}
```

A contribution is uniquely identified by `profileId + gameId` and records the participant's result. Aggregate counters may include games, wins, joint wins, total score, highest score, strikes, trail closures, and mode-specific breakdowns.

Requirements:

- Retried finalization cannot count a game twice.
- Simulations and experiments do not contribute to family statistics.
- Deleted/retired display names do not destroy historical attribution.
- If an aggregate is suspect, rebuild it from completed games or contribution records.

## 17. Simulation and experiment records

High-speed runs execute in memory. They do not create normal active-game, completed-game, or statistics records.

An optional saved summary may contain:

```js
{
  schemaVersion: 1,
  experimentId: "experiment-uuid",
  experimentType: "cpuComparison",
  modelVersion: 1,
  seed: "...",
  runCount: 10000,
  settings: {},
  policySnapshots: [],
  aggregateResults: {},
  createdAt: "..."
}
```

Do not store every turn or every simulated game unless a focused debugging export is explicitly requested. Debug exports are not permanent family history.

## 18. Future Firestore collections

Proposed structure:

```text
families/{familyId}
families/{familyId}/profiles/{profileId}
rooms/{roomId}
rooms/{roomId}/seats/{seatId}
rooms/{roomId}/commands/{commandId}
completedGames/{gameId}
playerStats/{profileId}
playerStats/{profileId}/contributions/{gameId}
experiments/{experimentId}
```

Exact ownership scoping may change during Firebase setup, but stable IDs and idempotency requirements may not.

### Room record

A room contains:

- schema/rules/settings versions;
- public room code or separately indexed join code;
- room status and expiry metadata;
- immutable game settings after start;
- authoritative game state or a reference to it;
- monotonically increasing revision;
- host/creator identity;
- seat summary;
- last accepted command metadata.

### Seat record

A seat contains stable `seatId`, participant/profile snapshot, authenticated user binding where applicable, status, and last-seen metadata.

Private reclaim credentials must be stored only on the reclaiming device and in a protected representation suitable for server-side comparison. They must not appear in public room state, logs, screenshots, or completed-game history.

## 19. Online concurrency

A future online transition must atomically validate:

1. authenticated identity and claimed seat;
2. room status and game ID;
3. expected revision;
4. current phase and actor eligibility;
5. command shape and command-ID uniqueness;
6. rule-engine legality.

The transaction writes the next authoritative state and increments revision exactly once. Listener duplicates and reconnects are normal and must be harmless.

Shared Table submissions are stored independently until all eligible participants submit or the future timeout policy resolves. One idempotent resolver applies the batch.

## 20. Migration behavior

Migrations are sequential, explicit, and testable:

```text
v1 -> v2 -> v3
```

Loading procedure:

1. Parse without mutating stored bytes.
2. Reject unsupported future versions safely.
3. Copy the record.
4. Apply each required migration.
5. Validate domain invariants.
6. Persist the migrated record only after full success.
7. Preserve diagnostic/recovery information if migration fails.

Missing optional historical fields receive documented defaults. Missing fields that affect rules, identity, or score must not be guessed. Active games retain their snapshotted rules version and are never silently converted to new gameplay behavior.

## 21. Validation invariants

At minimum:

- IDs are non-empty, stable, and unique in their scope.
- Seat indices are contiguous and unique.
- Exactly one current participant exists while active.
- Marked trail indices are valid, unique, and progressive.
- A seal requires that participant's close-space mark.
- Closed trails never reopen.
- Strike counts are integers from 0 through 4.
- Current roll matches the turn and open trails.
- Phase-specific pending/submitted choices are internally consistent.
- Revision increases monotonically.
- Accepted command IDs have no duplicates.
- Completed games cannot accept commands.
- Settings and version snapshots exist on every game.
- Normal, simulation, and experiment records cannot cross persistence pipelines.

## 22. Corruption and recovery

A corrupt or unsupported record must not crash the home screen.

The app should:

- preserve the last parseable valid snapshot where practical;
- show a concise recovery message;
- identify the build, schema version, game ID, revision, and phase in diagnostics;
- exclude reclaim tokens and sensitive identifiers from copied diagnostics;
- offer safe export/reset actions only with clear confirmation;
- never overwrite the only recoverable snapshot before validating its replacement.

## 23. Privacy and retention

Kuicks stores only data necessary for play, recovery, history, and approved statistics. Names are treated as untrusted text. Browser code contains no service-account credentials or secrets.

Alpha data remains on the single device. Clearing browser site data removes local profiles and games unless a future export/online backup feature exists. The UI must explain this before destructive resets.

## 24. Alpha v1 acceptance criteria

The data model is ready for implementation when:

1. A game can resume from every persisted phase without rerolling.
2. One human and 1–4 CPUs have stable participant/profile identities.
3. All settings and versions are snapshotted at game creation.
4. Trail progression, seals, closures, strikes, and scores are lossless.
5. Repeated taps and refresh retries cannot duplicate actions.
6. The deterministic seed/random state survives refresh.
7. Corrupt or unsupported data fails safely.
8. The active-game pointer cannot select the wrong game silently.
9. Completed state is immutable.
10. The model supports later pass-the-phone and separate-phone modes without changing rule-engine entities.
11. Future completed-game and statistics writes are idempotent by stable IDs.
12. Simulations remain isolated from normal history and statistics.
13. The deployed GitHub Pages build can be tested from Android browser storage across refresh and relaunch.

## 25. Decisions deferred

These choices may be finalized during focused implementation/Firebase issues without changing this baseline:

- exact UUID library or browser-native generator;
- exact seeded PRNG algorithm;
- bounded command-ledger retention strategy;
- local completed-history retention limits;
- Firestore family/ownership nesting;
- room-code lookup/index structure;
- reclaim-token hashing design;
- IndexedDB migration threshold;
- timestamp source and clock-skew presentation.

Each choice must be recorded in `DECISIONS.md`, tested, and kept behind the approved architecture boundaries.

## 26. Approval gate

This document is the **approved Alpha v1 data-model baseline**. Changes that materially affect identity, persistence, synchronization, scoring history, or migration behavior require a recorded decision and product-owner approval.

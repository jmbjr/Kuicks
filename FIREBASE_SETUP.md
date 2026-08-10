# Kuicks Firebase Setup

Status: **Draft for review**  
Document version: **0.1-draft**  
Last updated: **2026-08-10**

This document defines the planned Firebase boundary for Kuicks separate-phone multiplayer, persistence, completed-game history, and statistics. Firebase is **not required** for the approved Single-Device CPU Alpha. Do not add Firebase to the first playable build merely because this setup is documented.

## 1. Scope

When the online phase is approved, Kuicks will use:

- Firebase Authentication with anonymous sign-in;
- Cloud Firestore for rooms, synchronized game state, profiles, completed games, and statistics;
- Firestore Security Rules;
- the existing static GitHub Pages deployment;
- the browser Firebase JavaScript SDK, with no trusted secrets in client code.

Cloud Functions, Firebase Hosting, Realtime Database, App Check, and paid services are deferred unless a focused issue demonstrates a need.

## 2. Project boundary

Prefer the existing family Firebase project used by related games only if its ownership, quotas, and rules can remain safely separated. Otherwise create a dedicated Kuicks Firebase project.

Before changing a shared project:

1. Export or copy the current Firestore rules.
2. Record the project ID and current deployed rules version.
3. Confirm which collections belong to other applications.
4. Append Kuicks-specific rules without weakening or deleting unrelated rules.
5. Test all affected applications before considering the change complete.

Never paste a replacement ruleset that contains only Kuicks rules into a shared project.

## 3. Required console setup

When online work begins:

1. Open the Firebase console and select the approved project.
2. Register a Web app named **Kuicks Web**.
3. Record the public web configuration values.
4. Enable **Authentication → Sign-in method → Anonymous**.
5. Create the default Cloud Firestore database in the approved production location.
6. Start with deny-by-default rules, then add only the Kuicks paths required by the staged issue.
7. Add the deployed GitHub Pages hostname to Authentication authorized domains if it is not already present.
8. Verify the exact Pages origin from the deployed app rather than guessing it.
9. Record setup decisions in `DECISIONS.md`.

Firebase web configuration values identify the project; they are not service-account secrets. Service-account keys, admin credentials, private reclaim tokens, and unrestricted API keys must never be committed.

## 4. GitHub Pages origin

The expected production origin is based on the repository owner and Pages configuration, typically:

```text
https://jmbjr.github.io/Kuicks/
```

Repository and Pages settings determine the exact hostname and path. Authentication authorized domains use the hostname, not the URL path. Preview or alternate domains must be added only when actually used.

## 5. Client initialization boundary

Firebase initialization belongs in an adapter module, not in the rule engine or rendering code.

The adapter exposes narrow operations such as:

- establish or restore anonymous authentication;
- create, join, observe, and leave a room;
- submit an idempotent command;
- reclaim an authorized seat;
- finalize a completed game once;
- read/write permitted profiles and history.

The pure game engine accepts ordinary data and returns ordinary data. It must run fully without Firebase for tests, CPU games, and simulations.

## 6. Authentication

Anonymous authentication provides a stable Firebase `uid` for the browser session and allows Firestore rules to distinguish authenticated clients from public traffic.

Requirements:

- Create or restore authentication before any protected Firestore access.
- Do not treat a display name, family profile ID, room code, or local-storage value as authentication.
- Bind room seats to authenticated users through protected state.
- Store reclaim credentials separately from public room documents.
- Handle anonymous-account replacement or loss as an explicit recovery case.
- Never log authentication tokens or reclaim secrets.
- Account linking and permanent login providers are deferred.

## 7. Planned collections

The approved data-model baseline proposes:

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

Exact ownership nesting remains a focused online-phase decision. Stable IDs, schema versions, immutable settings snapshots, and idempotent writes are mandatory.

Collections do not need to be manually pre-created. Firestore creates them when the first authorized document is written.

## 8. Security model

Rules must enforce, at minimum:

- deny access when unauthenticated unless a narrowly documented join lookup requires otherwise;
- validate allowed fields, types, schema versions, and size bounds;
- restrict room reads and writes to authorized participants;
- prevent clients from claiming another user's seat;
- prevent immutable settings from changing after start;
- reject stale revisions and duplicate command effects;
- prevent completed games from being rewritten;
- isolate simulations and experiments from normal history/statistics;
- deny all unspecified paths.

Security Rules are an authorization and validation boundary, not the complete game engine. Server-authoritative validation may eventually require a trusted backend; until approved, transactions and rules must constrain all client writes that could affect shared state.

## 9. Append-only rules procedure

Use this procedure every time Kuicks rules are added to an existing project:

1. In **Firestore → Rules**, copy the entire currently deployed ruleset into a dated backup.
2. Locate the existing outer `service cloud.firestore` and `match /databases/{database}/documents` blocks.
3. Add Kuicks helper functions and `match` blocks **inside the existing documents block**.
4. Preserve every unrelated helper and `match` block byte-for-byte where practical.
5. Do not add a broad `allow read, write: if true`.
6. Publish only after reviewing the complete merged ruleset.
7. Run emulator/rules tests for both Kuicks and any shared applications.
8. Record the resulting rules change and focused rollback instructions.

Do **not** append a second complete `service cloud.firestore` wrapper. Merge Kuicks paths into the existing wrapper.

## 10. Illustrative rules skeleton

This is a design skeleton, not production-ready authorization:

```rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Existing application helpers and match blocks remain here.

    function kuicksSignedIn() {
      return request.auth != null;
    }

    match /rooms/{roomId} {
      allow read: if kuicksSignedIn() && false;
      allow create, update, delete: if false;

      match /seats/{seatId} {
        allow read, write: if false;
      }

      match /commands/{commandId} {
        allow read, write: if false;
      }
    }

    match /completedGames/{gameId} {
      allow read, write: if false;
    }

    // Existing application rules continue unchanged.
  }
}
```

The explicit `false` conditions prevent this example from accidentally granting access. Each staged online issue must replace only the relevant denial with tested ownership and validation predicates.

## 11. Transactions and idempotency

A shared-state mutation must use a Firestore transaction or an equivalently safe trusted operation that verifies:

1. authenticated identity and seat ownership;
2. room and game status;
3. expected game revision;
4. phase and actor eligibility;
5. command ID uniqueness;
6. legal transition inputs;
7. next-state schema validity.

One accepted command increments the authoritative revision once. Retried writes, duplicated listeners, refreshes, and reconnects must not duplicate actions.

Completed games use `gameId` as the stable document ID. Statistics contributions use one `profileId + gameId` identity so retrying finalization cannot count a result twice.

## 12. Offline and reconnect behavior

Firestore listeners may repeat snapshots and may surface cached data. The UI must display connection state without treating network availability as game authority.

Requirements:

- distinguish cached/offline state from confirmed server state;
- do not invent a new roll or phase after reconnect;
- retain pending command IDs until confirmed or safely rejected;
- reconcile by revision;
- allow an authenticated player to reclaim only their authorized seat;
- prevent a stale client from overwriting newer state;
- expose a recoverable disconnected state rather than a blank or corrupted board.

## 13. Indexes

Do not create speculative indexes. Add a composite index only when an approved query requires one and Firestore identifies or tests demonstrate the need.

Record each index's:

- query and feature;
- collection scope;
- fields and sort directions;
- deployment instructions;
- removal impact.

Room lookup by a short public code must avoid exposing unrestricted room enumeration.

## 14. Local development and rules testing

Before production writes:

1. Use the Firebase Local Emulator Suite for Authentication and Firestore where practical.
2. Test allowed and denied reads/writes with representative authenticated identities.
3. Test wrong-seat, stale-revision, duplicate-command, malformed-field, oversize, completed-game, and unauthenticated cases.
4. Confirm unrelated shared-project paths retain their previous behavior.
5. Point production builds only at the approved production configuration.

Never weaken production rules as a substitute for emulator setup.

## 15. Deployment sequence

For each staged online feature:

1. Approve its issue and data/rules change.
2. Implement and test pure transition behavior.
3. Add emulator/rules tests.
4. Merge rules with the existing project rules.
5. Deploy rules.
6. Deploy the versioned GitHub Pages build.
7. Increment the service-worker cache version.
8. Test on two Android browsers/devices.
9. Test refresh, disconnect, reconnect, and duplicate taps.
10. Leave the issue open until the product owner approves the phone-tested build.

If rules deployment succeeds but the web build fails, use the documented rollback or keep the rules safely backward compatible.

## 16. Troubleshooting

### Permission denied

Check:

- anonymous authentication is enabled and completed;
- the request has a non-null `request.auth`;
- the user owns or is authorized for the referenced seat;
- the document shape and immutable fields satisfy rules;
- the expected revision is current;
- the deployed rules are the intended merged version;
- the app points to the intended Firebase project.

Do not solve permission errors by temporarily allowing all reads/writes in production.

### App works locally but not on GitHub Pages

Check:

- the exact Pages hostname is authorized where required;
- Firebase configuration matches the intended project;
- the browser console for origin, CSP, module, and service-worker errors;
- the service worker is not serving an older cached build;
- the Pages site uses HTTPS.

### Players stop synchronizing

Check:

- each client is observing the same `roomId` and `gameId`;
- revisions increase monotonically;
- pending commands have stable IDs;
- transactions reject stale state instead of overwriting it;
- cached snapshots are not displayed as server-confirmed;
- the room has not expired or completed.

### Unexpected usage

Check Firestore usage and query behavior. Avoid polling, unbounded collection listeners, repeated finalization writes, and all per-turn writes from simulations.

## 17. Cost and operational safeguards

- Keep high-speed simulations entirely in memory.
- Subscribe only to the active room/documents needed by the screen.
- Unsubscribe listeners when leaving a room.
- Avoid unbounded queries and collection scans.
- Monitor Firestore usage and billing alerts when online play is enabled.
- Do not assume free-tier limits are permanent or sufficient.
- Document cleanup and retention before accumulating online history.

## 18. Acceptance criteria

The Firebase setup specification is implementation-ready when:

1. The approved project and production Pages origin are recorded.
2. Anonymous authentication is enabled and tested.
3. Firestore exists in the chosen location.
4. Current rules are backed up before Kuicks changes.
5. Kuicks rules are merged without deleting or weakening unrelated rules.
6. Rules tests cover permitted and denied access.
7. Room actions use stable identities, revisions, and command IDs.
8. Seat reclaim does not expose private credentials.
9. Completed-game/statistics writes are idempotent.
10. Two Android clients can join, play, refresh, disconnect, and rejoin safely.
11. Simulations generate no normal Firestore history or statistics writes.
12. Troubleshooting and rollback steps are recorded on the implementation issue.

## 19. Deferred decisions

Record these in `DECISIONS.md` when their implementation issue begins:

- shared versus dedicated Firebase project;
- final family/ownership nesting;
- room-code lookup design;
- reclaim-token hashing and rotation;
- whether a trusted backend is required for authoritative transitions;
- App Check adoption;
- anonymous-account cleanup policy;
- retention/expiry jobs and any billing requirement;
- exact indexes and usage alerts.

## 20. Approval gate

This document is a **draft for review**. It does not authorize Firebase configuration changes, rule deployment, or online implementation. After explicit approval, update its status/version and commit that approval checkpoint.

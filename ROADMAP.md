# Kuicks Roadmap

Status: **Draft for review**  
Document version: **0.1-draft**  
Last updated: **2026-08-11**

This roadmap prioritizes the shortest dependable path to a playable Kuicks game: one human versus two computer players, deployed through GitHub Pages and tested in an Android browser.

## Guiding target

**First playable milestone:** complete one full, rules-correct game against two CPU opponents on one Android phone.

The alpha should be understandable, recoverable after a refresh, and easy to deploy. Online multiplayer, statistics, and experimental tools must not delay this milestone.

## Phase 0 — Approved foundations

Completed baselines:

- Game rules
- Product requirements
- Game modes and options
- UX design
- Architecture
- Data model
- Firebase setup guidance
- User guide
- Test plan
- Iteration workflow

Remaining project record:

- Decision log

## Phase 1 — Runnable shell

**Complexity: Low**

1. Create the minimal browser application.
2. Configure GitHub Pages deployment.
3. Add the basic PWA manifest and icons.
4. Show a visible build identifier.
5. Verify the public page opens in Android Chrome.

**Milestone:** a blank-but-branded Kuicks shell can be deployed and opened on the phone.

## Phase 2 — Rules engine

**Complexity: High**

1. Represent trails, marks, seals, strikes, turns, and end conditions.
2. Generate legal Table and Kick actions.
3. Apply actions through pure state transitions.
4. Calculate final scores and ties.
5. Add a small focused set of rule tests.

**Milestone:** complete games can be driven through code without the visual interface.

## Phase 3 — CPU players

**Complexity: Medium**

1. Define a simple deterministic CPU policy.
2. Let CPUs choose legal Table and Kick actions.
3. Let CPUs accept strikes when no action is used.
4. Preserve seeded behavior across refreshes.

**Milestone:** automated games can reach a valid ending without getting stuck.

## Phase 4 — Human game setup and play surface

**Complexity: High**

1. Add player name and CPU-count setup.
2. Build the mobile dice and turn-status area.
3. Build the human score sheet and legal-action controls.
4. Show compact CPU sheets and recent actions.
5. Make Table and Kick phases visually distinct.

**Milestone:** a human can make legal choices comfortably on a narrow phone.

## Phase 5 — Complete Single-Device CPU game

**Complexity: High**

1. Connect the UI, rules engine, and CPU turns.
2. Handle skipped actions and strikes.
3. Handle trail closure and end-of-game flow.
4. Show final scores and winners.
5. Support starting another game.

**Milestone:** one human can complete a full game against two CPUs.

## Phase 6 — Save, deploy, and phone-test

**Complexity: Medium**

1. Save the current game locally.
2. Restore safely after refresh or browser restart.
3. Deploy the checkpoint to GitHub Pages.
4. Complete the simplified desktop smoke test.
5. Complete a real Android playthrough.
6. Fix blocking defects on the same implementation issue.

**Alpha 0 exit:** the user explicitly accepts a complete phone playthrough.

## Phase 7 — Alpha refinement

**Complexity: Medium**

Only after Alpha 0 is playable:

- Improve readability, touch sizing, and feedback.
- Improve offline and install behavior.
- Add focused accessibility fixes.
- Expand regression coverage where real defects justify it.
- Tune CPU choices if play feels obviously poor.

**Alpha v1 exit:** stable enough for repeated family play on one device.

## Deferred roadmap

These are later phases, not prerequisites for the Single-Device CPU Alpha:

1. Pass-the-phone multiplayer.
2. Firebase rooms and separate-device play.
3. Rejoin and seat recovery.
4. Completed-game history and statistics.
5. Simulation and Experiment Lab.
6. Additional CPU strategies or difficulty levels.

Each deferred phase should begin only when the previous playable milestone is accepted.

## Complexity summary

| Work item | Complexity | Depends on |
|---|---|---|
| Browser/PWA shell | Low | Approved foundations |
| Rules engine | High | Rules and data model |
| CPU policy | Medium | Rules engine |
| Setup and mobile UI | High | UX and rules engine |
| Complete game orchestration | High | CPU and UI |
| Save/resume | Medium | Complete state model |
| Alpha refinement | Medium | Android playtest feedback |
| Online multiplayer | High | Accepted single-device alpha |

## Roadmap change rule

The roadmap may change when implementation reveals a better dependency order. Material changes should be recorded in the decision log. The current implementation issue remains the focus until it is phone-tested and explicitly accepted.

## Approval gate

This document is a **draft for review**. After explicit approval, update its status to **Approved alpha baseline**, set its version to **1.0-alpha**, and commit the approval checkpoint.

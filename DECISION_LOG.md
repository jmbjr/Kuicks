# Kuicks Decision Log

Status: **Approved alpha baseline**  
Document version: **1.0-alpha**  
Last updated: **2026-08-11**

This log records decisions that materially shape Kuicks. It is a short index of why the project follows its current path; approved specifications remain the authoritative source for details.

## Decision format

Each entry records the decision, its reason, and its current status. New entries are appended when a choice changes product scope, rules, architecture, or implementation order. Routine implementation details do not need an entry.

## Alpha decisions

### D-001 — Use Kuicks as the product name

- **Decision:** The game and repository-facing product name is **Kuicks**.
- **Reason:** Establish a distinct identity and avoid the earlier “Kicks” ambiguity.
- **Status:** Accepted.

### D-002 — Freeze the Alpha v1 rules baseline before implementation

- **Decision:** Treat `GAME_RULES.md` version `1.0-alpha` as the authoritative rules baseline.
- **Reason:** The engine, CPU players, UI, and tests need one deterministic interpretation.
- **Status:** Accepted.

### D-003 — Build Single-Device CPU play first

- **Decision:** The first playable milestone is one human versus two CPU opponents on one device, with support for one to four CPUs.
- **Reason:** This is the shortest path to a complete, useful game and avoids premature networking work.
- **Status:** Accepted.

### D-004 — Deploy playable checkpoints through GitHub Pages

- **Decision:** Approved playable builds are published to GitHub Pages and tested in an Android browser.
- **Reason:** Phone testing is the real acceptance environment even though game state remains on one device.
- **Status:** Accepted.

### D-005 — Defer Firebase and separate-device multiplayer

- **Decision:** Firebase rooms, synchronization, rejoining, online history, and statistics do not block the first playable alpha.
- **Reason:** They add substantial complexity without proving the core game loop.
- **Status:** Accepted.

### D-006 — Keep the rules engine pure and deterministic

- **Decision:** Legal-action generation, state transitions, scoring, and end conditions are isolated from the UI and persistence.
- **Reason:** This keeps gameplay explainable, testable, and reusable for CPUs and later online play.
- **Status:** Accepted.

### D-007 — Preserve seeded CPU and game state across refreshes

- **Decision:** Random state and complete active-game state are saved so refreshes do not silently change outcomes or duplicate actions.
- **Reason:** A browser game must resume predictably on a phone.
- **Status:** Accepted.

### D-008 — Use Table and Kick as distinct turn stages

- **Decision:** Shared player choices are presented as the **Table** stage; the active player's private choice is the **Kick** stage.
- **Reason:** Distinct language and visual hierarchy make simultaneous and active-player actions easier to understand.
- **Status:** Accepted.

### D-009 — Keep pre-alpha testing lightweight

- **Decision:** Before Alpha 0, require focused rule checks, a desktop smoke test, one complete human-versus-two-CPU game, GitHub Pages deployment, and an Android playthrough.
- **Reason:** Exhaustive regression, migration, accessibility, and multi-device suites are more valuable after a playable game exists.
- **Status:** Accepted.

### D-010 — Approve documents before treating them as baselines

- **Decision:** Draft specifications may live on `main` for review, but their headers and approval gates change only after explicit approval.
- **Reason:** Repository history should distinguish proposals from preserved project decisions.
- **Status:** Accepted.

## Deferred decisions

The following choices should be made only when their roadmap phase begins:

- CPU difficulty levels and alternate strategies.
- Pass-the-phone privacy and handoff details beyond the approved mode specification.
- Firebase project configuration and production security rules.
- Separate-device room lifecycle and recovery policy.
- Completed-game retention and statistics presentation.
- Experiment Lab controls and reporting.

## Superseding a decision

Do not rewrite history when a material decision changes. Add a new entry that names the superseded decision, explains why it changed, and links to the updated specification or implementation issue.

## Approval gate

This document is the **approved Alpha v1 baseline**. Future material changes require explicit approval and a new decision entry when they supersede an accepted decision.

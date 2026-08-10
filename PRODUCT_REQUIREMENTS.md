# Kuicks Product Requirements

Status: **Draft for product-owner review**  
Product version: **Alpha v1**  
Requirements version: **0.1-draft**  
Rules dependency: **GAME_RULES.md 1.0-alpha (approved)**  
Last updated: **2026-08-10**

## 1. Purpose

This document defines the product requirements and alpha boundary for Kuicks. Together with the approved `GAME_RULES.md`, it must give a developer enough information to build and evaluate the intended product without access to the originating conversation.

Kuicks is an original mobile-first browser game built around shared dice, progressive score trails, tactical risk, and quick turns. It may use familiar roll-and-record mechanics, but it must not reproduce another game's branding, prose, artwork, proprietary assets, visual trade dress, or exact commercial presentation.

The smallest useful playable milestone is **one human playing against two CPU participants on one Android phone**, with all game state stored on that device. This milestone is called the **Single-Device CPU Alpha**.

## 2. Product vision

Kuicks should feel like a compact handcrafted tabletop game that is always ready on a phone: quick to begin, easy to read at a glance, satisfying to touch, and trustworthy when interrupted or refreshed.

The product should eventually support family profiles, pass-the-phone play, separate-phone rooms, rejoining, statistics, and experiments. The alpha must establish clean foundations for those capabilities without implementing a large framework prematurely.

### 2.1 Alpha outcome

A player can open Kuicks on a typical Android phone, start a default game with minimal setup, play a complete rules-correct match against two deterministic CPU opponents, understand why actions are or are not legal, refresh without losing the match, and view an accurate final result.

### 2.2 Product goals

- Deliver a complete, enjoyable local game before introducing Firebase complexity.
- Make the current turn, dice, legal actions, score-sheet progress, closures, and strikes understandable without instruction from another person.
- Preserve the low-dependency deployment and staged phone-testing workflow proven by the reference horse-racing project.
- Keep rules, CPU policy, presentation, persistence, and future synchronization as separate concerns.
- Establish stable identities, versioned state, deterministic randomness, and idempotent actions from the beginning.
- Create an original Kuicks identity suited to dice and score trails.

### 2.3 Non-goals for the Single-Device CPU Alpha

- Reproducing another game's branded experience or exact score-sheet layout.
- Separate-phone or networked multiplayer.
- Firebase authentication, Firestore, or shared family records.
- Competitive CPU difficulty tiers or machine-learning opponents.
- Permanent cross-device statistics.
- High-volume simulation tools.
- A generalized game framework or plugin system.

## 3. Intended audience

### 3.1 Primary audience

- Family and casual-game players using Android phones.
- Players who enjoy short tactical dice games with low setup cost.
- The product owner and family, who will test frequent staged builds on physical phones.

### 3.2 Secondary audience

- Players using modern iPhones, tablets, laptops, and desktop browsers.
- Developers and testers evaluating the deterministic rule engine and CPU policies.
- Future family groups using shared profiles and separate devices.

### 3.3 Expected player knowledge

No familiarity with any other roll-and-record game is assumed. The interface and concise in-app help must explain Kuicks in original language.

## 4. Design principles

1. **Phone first.** Every normal game action must be comfortable on a narrow portrait phone without requiring precision tapping.
2. **State at a glance.** Players should immediately see whose turn it is, what was rolled, which choice is being made, what is legal, and what will end the game.
3. **Simple first contact.** The default game should require only a player name and one start action; advanced controls remain collapsed until requested.
4. **Rules are authoritative.** Rendering and CPU logic consume legal actions from the pure rule engine rather than reimplementing rules.
5. **Safe interruption.** Refresh, accidental closure, or PWA relaunch must not reroll dice or lose a game in progress.
6. **Deterministic and testable.** Seeded randomness, pure transitions, and independently validated CPU choices make failures reproducible.
7. **Color assists; it never carries meaning alone.** Trail name, icon, pattern, position, and accessible text accompany color.
8. **Original identity.** Kuicks uses its own terminology, layout, artwork, logo treatment, and visual hierarchy.
9. **Progressive complexity.** Local play is completed before online systems; working code is modularized only where a real boundary requires it.
10. **Visible consequences.** Scoring, strikes, closures, passes, and CPU actions receive clear feedback.

## 5. Supported environment

### 5.1 Primary target

- Android phones in portrait orientation.
- Current stable Google Chrome and installed standalone PWA mode.
- Functional viewport width from **320 CSS pixels** upward.
- Touch input as the primary interaction method.

### 5.2 Secondary targets

- Current stable Safari on iPhone.
- Current stable Chrome, Edge, Firefox, and Safari on tablets and desktop computers.
- Landscape orientation, without loss of function or inaccessible controls.
- Mouse and keyboard input.

### 5.3 Support policy

The alpha targets current stable browser releases rather than older or embedded browsers. Unsupported-browser failures must be understandable and must not corrupt stored games.

## 6. Game modes and milestone scope

Rules remain identical across modes unless a future pre-game rules variant is explicitly documented and versioned.

| Mode | Product intent | Single-Device CPU Alpha status |
|---|---|---|
| Human vs CPU | One local human with CPU opponents | **Required** |
| Pass the phone | Multiple local humans share one device | Deferred to next local-play phase |
| Separate phones | Humans join a synchronized room | Deferred |
| Simulation/Experimental | Seeded high-speed strategy and balance evaluation | Deferred |

### 6.1 Required default game

- One human participant.
- Two CPU participants.
- Rules version `1.0-alpha`.
- Seeded random starting participant.
- Default CPU action delay short enough to show what happened without making the game feel stalled.
- All other rule settings fixed to the approved baseline.

### 6.2 Alpha setup flexibility

The alpha should support one human with **one to four CPU participants**, for a total of 2–5 participants. The default remains one human plus two CPUs. CPU count and action delay are advanced options.

The alpha may ship with a single CPU policy. Difficulty choices must not be displayed unless meaningfully different, tested policies exist.

## 7. Functional requirements

Requirements use stable IDs for issues, tests, and acceptance evidence.

### 7.1 Application shell and navigation

- **FR-APP-001:** Kuicks shall run as a static single-page application suitable for GitHub Pages.
- **FR-APP-002:** The main screen shall provide a prominent path to start or resume a game.
- **FR-APP-003:** Secondary content such as rules, records, and advanced setup shall use expandable sections rather than crowding the primary path.
- **FR-APP-004:** Browser back, refresh, and PWA relaunch shall not create an unintended second game or reroll an active turn.
- **FR-APP-005:** The application shall display its product version, rules version, and build identifier in a compact diagnostic/about area.

### 7.2 Local player and game setup

- **FR-SET-001:** A human shall be able to enter a non-empty display name and start the default game.
- **FR-SET-002:** The most recently used local human name may be remembered on that device.
- **FR-SET-003:** CPU participants shall have stable IDs and distinct display names; names shall not be used as data keys.
- **FR-SET-004:** Advanced setup shall allow 1–4 CPU opponents and a configurable visual action delay within documented safe bounds.
- **FR-SET-005:** Setup shall prevent a participant count outside the approved 2–5 range.
- **FR-SET-006:** Starting a game shall snapshot settings, participant IDs, seat order, seed, schema version, rules version, engine version, game ID, and creation time.
- **FR-SET-007:** Attempting to replace an unfinished game shall require an explicit confirmation describing the consequence.

### 7.3 Game creation and dice

- **FR-GAME-001:** The application shall create a valid blank game according to `GAME_RULES.md`.
- **FR-GAME-002:** A roll shall include both table dice and only the trail dice for open trails.
- **FR-GAME-003:** Random outcomes and starting seat shall be generated from stored deterministic random state.
- **FR-GAME-004:** A completed roll shall persist before the player can act and shall survive refresh unchanged.
- **FR-GAME-005:** The interface shall visually and textually distinguish table dice from trail dice.

### 7.4 Human turn actions

- **FR-HUM-001:** The interface shall present the human only actions returned as legal by the rule engine for the current phase.
- **FR-HUM-002:** During a table-choice phase, the human shall be able to choose one legal trail target or pass.
- **FR-HUM-003:** During the human's kick-choice phase, the human shall be able to choose a legal table-die/trail-die combination or pass.
- **FR-HUM-004:** When multiple dice combinations lead to the same mark, the action model shall retain the actual dice used even if the UI groups equivalent outcomes.
- **FR-HUM-005:** The interface shall require confirmation before a human takes an avoidable strike by passing their final available scoring phase. This confirmation may be omitted when no legal mark exists, provided the result is clearly stated.
- **FR-HUM-006:** Accepted actions shall show immediate feedback and become unavailable for duplicate submission.
- **FR-HUM-007:** Illegal or stale actions shall leave state unchanged and display a recoverable explanation.

### 7.5 CPU behavior

- **FR-CPU-001:** A CPU shall choose only from candidates supplied by the rule engine, including pass where permitted.
- **FR-CPU-002:** The rule engine shall independently validate every CPU action.
- **FR-CPU-003:** Given identical state, policy version, and seed/random state, the CPU shall make the same decision.
- **FR-CPU-004:** CPU policy shall use documented deterministic heuristics and must not receive rule advantages or hidden state unavailable to humans.
- **FR-CPU-005:** CPU turns shall execute without human confirmation while leaving enough visual feedback to understand rolls, marks, passes, closures, and strikes.
- **FR-CPU-006:** CPU delay shall affect presentation only, not rules, random results, or chosen actions.
- **FR-CPU-007:** Reloading during a CPU delay shall resume safely without applying the action twice.
- **FR-CPU-008:** A zero or minimal-delay setting may be available for testing, but CPU work shall yield sufficiently to keep the interface responsive.

### 7.6 Score sheets and shared state

- **FR-SHEET-001:** The board shall display all four trails for the human at readable phone size.
- **FR-SHEET-002:** Each trail shall show its name, icon/pattern cue, direction, printed values, marks, skipped/unavailable cells, close space, seal state, and global closed state.
- **FR-SHEET-003:** Legal candidate cells shall be visibly distinct from unavailable and already marked cells without relying on color alone.
- **FR-SHEET-004:** CPU progress shall remain inspectable without displacing the human's immediate decisions; compact summaries may expand into full sheets.
- **FR-SHEET-005:** The interface shall show each participant's strikes and current provisional score.
- **FR-SHEET-006:** The current participant and phase shall be announced visually and to assistive technology.
- **FR-SHEET-007:** A trail closure shall clearly identify the trail and all participants who received a seal in that phase.

### 7.7 Turn flow and feedback

- **FR-TURN-001:** The application shall implement the exact phase ordering and atomic shared-choice behavior in `GAME_RULES.md`.
- **FR-TURN-002:** The UI shall use concise original terms—Table, Kick, Close, Seal, and Strike—with fuller explanations available.
- **FR-TURN-003:** A persistent status region shall explain the current required or automatic action.
- **FR-TURN-004:** The human shall be able to inspect the most recent roll and action sequence.
- **FR-TURN-005:** Automatic CPU or phase transitions shall not obscure a game-ending event.
- **FR-TURN-006:** Once the game is complete, all gameplay controls shall be disabled.

### 7.8 Scoring and completion

- **FR-END-001:** The application shall end the game only under the approved closure or strike conditions.
- **FR-END-002:** Final trail values, seals, strike deductions, totals, winners, and shared wins shall be calculated by pure rule functions.
- **FR-END-003:** The result screen shall show a participant-by-participant score breakdown rather than only a winner message.
- **FR-END-004:** The game-completion transition shall be idempotent and produce one completed result for a game ID.
- **FR-END-005:** The player shall be able to return to setup and start another game after reviewing results.
- **FR-END-006:** Local alpha results need not contribute to permanent family statistics, but the completed state shall retain enough versioned information for inspection and later migration decisions.

### 7.9 Save, recovery, and reset

- **FR-SAVE-001:** The active local game shall be saved automatically after every state transition.
- **FR-SAVE-002:** Relaunching shall detect a valid unfinished game and offer a prominent resume path.
- **FR-SAVE-003:** Recovery shall restore the exact phase, dice, sheets, strikes, current participant, command history needed for idempotency, and deterministic random state.
- **FR-SAVE-004:** Malformed, unsupported, or partially written local data shall not crash the app; the user shall receive recovery/reset guidance.
- **FR-SAVE-005:** Destructive reset of an unfinished game shall require confirmation.
- **FR-SAVE-006:** The application shall never silently reinterpret a stored game under incompatible rules.

### 7.10 Help and diagnostics

- **FR-HELP-001:** The app shall include concise original-language instructions sufficient to begin and complete a game.
- **FR-HELP-002:** Contextual help shall explain table choices, kick choices, progression, closures, seals, strikes, ending, and scoring.
- **FR-HELP-003:** An error display shall provide a user-facing message and a compact diagnostic code or copyable detail where useful.
- **FR-HELP-004:** Development/test builds shall provide a nonintrusive way to expose game ID, seed, phase, versions, and state-validation result.

### 7.11 PWA and deployment

- **FR-PWA-001:** The application shall be deployable from the repository through GitHub Pages without a server runtime.
- **FR-PWA-002:** It shall provide a web-app manifest with Kuicks-specific name, icons, theme colors, and standalone display behavior.
- **FR-PWA-003:** After one successful online load, the application shell and required local assets shall be available offline.
- **FR-PWA-004:** Service-worker caches shall use explicit versions incremented with each published build that changes cached assets.
- **FR-PWA-005:** An update shall not destroy or silently mutate a valid saved game.
- **FR-PWA-006:** Firebase libraries and configuration shall not be required for the Single-Device CPU Alpha.
- **FR-PWA-007:** Every approved playable test build shall be deployed to GitHub Pages and made available for testing in an Android browser.

## 8. Nonfunctional requirements

### 8.1 Performance

- **NFR-PERF-001:** On a representative mid-range Android phone, normal taps shall provide visible feedback within 100 ms when no intentional CPU delay applies.
- **NFR-PERF-002:** Rule evaluation and a single CPU decision should complete within 50 ms under normal alpha state sizes on representative hardware.
- **NFR-PERF-003:** Initial cached launch should make the primary interface usable within 2 seconds under typical conditions; first network load should target 3 seconds on a reasonable mobile connection.
- **NFR-PERF-004:** No normal game phase shall cause visible long-task freezing. CPU and future simulation work must yield or move off the main thread when necessary.
- **NFR-PERF-005:** The initial application should remain dependency-light and avoid large assets that do not materially improve play.

Performance timings are product targets, not guarantees across every device or network. Test evidence should record the device and conditions used.

### 8.2 Reliability and integrity

- **NFR-REL-001:** Pure transitions shall not mutate their input state.
- **NFR-REL-002:** Every important command shall carry a stable ID and affect state at most once.
- **NFR-REL-003:** State validation shall detect violations of the invariants in `GAME_RULES.md`.
- **NFR-REL-004:** A refresh at every documented phase boundary shall preserve a valid, playable state.
- **NFR-REL-005:** Persisted state shall use a schema version and tolerate documented missing optional fields safely.
- **NFR-REL-006:** Names shall never be identity keys; game, participant, and command IDs shall be stable and distinct.

### 8.3 Maintainability

- **NFR-MNT-001:** Rule calculations, random generation, and scoring shall be testable without a browser DOM, timer, storage, or network.
- **NFR-MNT-002:** CPU policy shall depend on public game state and rule-engine candidates, not rendered elements.
- **NFR-MNT-003:** UI state such as accordion expansion and animation timing shall not be stored as authoritative game state.
- **NFR-MNT-004:** Local persistence shall sit behind a boundary that can later coexist with an online Firestore adapter.
- **NFR-MNT-005:** Code organization shall remain understandable and low-complexity; modular files are justified for real boundaries rather than speculative extensibility.

### 8.4 Privacy and security

- **NFR-SEC-001:** The Single-Device CPU Alpha shall require no account, personal email, or sensitive personal information.
- **NFR-SEC-002:** Human display names and game state remain on the device unless a later online feature explicitly transmits them.
- **NFR-SEC-003:** User-provided text shall be rendered safely and must not execute as markup or script.
- **NFR-SEC-004:** Diagnostic output shall not expose credentials or secrets.
- **NFR-SEC-005:** No Firebase or other service credential with privileged server access may be embedded in the client.

### 8.5 Compatibility and versioning

- **NFR-VER-001:** Every saved game shall include schema, rules, engine, CPU-policy, and application/build versions as applicable.
- **NFR-VER-002:** Changes that alter legal outcomes or scoring require a rules or engine version review and a decision-log entry.
- **NFR-VER-003:** Unsupported saved versions shall be preserved where practical and handled with an explicit message rather than silently discarded.

## 9. Accessibility requirements

- **A11Y-001:** Normal controls shall meet a target size of at least 44 by 44 CSS pixels, with sufficient spacing to avoid accidental activation.
- **A11Y-002:** Text and meaningful UI elements shall meet WCAG 2.2 AA contrast targets.
- **A11Y-003:** Trail identity and state shall never depend on color alone; names, icons/patterns, shapes, and text states shall supplement it.
- **A11Y-004:** All interactive controls shall have meaningful accessible names, roles, states, and keyboard focus indicators.
- **A11Y-005:** The full game shall be operable with keyboard input on supported desktop browsers.
- **A11Y-006:** Status changes such as phase changes, CPU actions, closures, strikes, errors, and completion shall be announced through an appropriate live region without excessive repetition.
- **A11Y-007:** Score trails shall expose understandable ordered information to screen readers, including marked, unavailable, legal, close, sealed, and closed states.
- **A11Y-008:** The layout shall support browser text zoom to 200% without loss of core function or content.
- **A11Y-009:** Motion shall be brief and nonessential; reduced-motion preferences shall suppress decorative or delayed animation while preserving state feedback.
- **A11Y-010:** No action shall require drag, multi-touch, hover, or a time-limited response.
- **A11Y-011:** Dice values shall have text alternatives and must not rely solely on pip graphics.
- **A11Y-012:** Error and confirmation dialogs shall manage focus predictably and return focus to a logical control when dismissed.

## 10. Visual and interaction direction

Kuicks should inherit the welcoming tabletop character and phone ergonomics of the reference horse-racing project while remaining a distinct product.

### 10.1 Shared design DNA

- Warm paper or cream background.
- Deep green framing.
- Gold and muted red accents.
- Rounded cards, subtle borders, restrained shadows, and tactile hierarchy.
- Georgia-like display typography paired with highly readable system body text.
- Large primary controls and compact advanced settings.
- Expandable records/help sections and strong status messages.

### 10.2 Original Kuicks identity

- A new wordmark/logo treatment centered on motion, dice, or scored trails—not horses.
- Sun, Spark, Wave, and Leaf trail identities with distinct icons/patterns as well as color.
- A score-board composition designed for a narrow screen rather than a copy of a commercial paper sheet.
- Original dice styling, closure/seal symbols, terminology, help text, and interaction sequence.
- No copied brand names, illustrations, rulebook passages, layout trade dress, or proprietary assets.

Detailed layouts, screen states, and content hierarchy belong in `UX_DESIGN.md`.

## 11. Alpha scope

### 11.1 Required for Single-Device CPU Alpha

- Static GitHub Pages SPA and versioned offline-capable PWA shell.
- Responsive Android-first start/setup, game, and result experiences.
- One local human versus 1–4 CPU participants, defaulting to two CPUs.
- Complete approved rules, including simultaneous table-choice resolution.
- Pure deterministic rule engine with automated tests.
- One documented deterministic CPU policy with configurable presentation delay.
- Accurate board state, legal-action guidance, closure/seal behavior, strikes, scoring, ties, and end conditions.
- Automatic local persistence and exact refresh recovery.
- Concise rules/help and actionable error states.
- Baseline WCAG 2.2 AA-oriented accessibility behavior.
- Manual tests on a representative Android phone at 320–430 CSS-pixel widths.

### 11.2 Explicitly deferred

- Multiple local human participants and pass-the-phone handoff.
- Firebase project setup, anonymous authentication, authorized domains, and Firestore rules.
- Room creation/joining, room codes, presence, synchronization, transactions, and seat reclaim.
- Shared family profile roster and cross-device permanent IDs.
- Cross-device rejoin and online duplicate-action handling.
- Shared completed-game history, statistics, charts, and record migration.
- Multiple CPU difficulties, personalities, or adaptive strategy.
- Pause controls for long-running online games.
- High-speed simulations, experimental policies, aggregates, and export.
- Optional rule variants listed in `GAME_RULES.md`.
- Localization and translated rules.
- Sound, music, haptics, achievements, accounts, monetization, and social sharing.
- App-store-native packaging.

Deferred capabilities remain part of the roadmap, not implicit alpha acceptance requirements.

## 12. Acceptance criteria

The Single-Device CPU Alpha is acceptable only when all criteria below are met on a published GitHub Pages build tested through an Android browser.

### 12.1 Start and complete a game

1. From a fresh load at a 360 × 800 CSS-pixel viewport, a player can enter a name and start the default one-human/two-CPU game without opening advanced settings.
2. The game initializes exactly six dice, four open trails, blank sheets, zero strikes, versioned settings, stable IDs, a stored seed, and a seeded starting participant.
3. The player can complete a full match using touch alone; CPUs complete their decisions automatically.
4. Every displayed legal action agrees with the rule engine, and attempted stale/duplicate actions cannot add marks or advance twice.
5. The game ends at exactly two closed trails or a participant's fourth strike and produces the correct score breakdown and winner set.

### 12.2 Rules correctness

6. Automated tests cover trail progression in both directions, table and kick candidates, same-trail double marks, close eligibility, simultaneous closures, trail-die removal, strike assignment, both end conditions, scoring from 0–12 marks, ties, seeded rolls, idempotency, and required invariants.
7. The production UI calls the same tested rule and scoring functions; it does not maintain a second rules implementation.
8. At least one deterministic recorded fixture can replay from a known seed to the same final result.

### 12.3 Recovery and resilience

9. Refresh tests during roll, table choice, kick choice, CPU delay, turn transition, and completed state restore the same authoritative state without rerolling or duplicating an action.
10. A valid unfinished game presents a resume path after browser or PWA relaunch.
11. Replacing or deleting an unfinished game requires confirmation.
12. Invalid stored data produces a usable recovery/reset state rather than a blank screen or endless loading state.

### 12.4 Mobile UX and accessibility

13. At 320, 360, 390, and 430 CSS-pixel portrait widths, no required control or score value is clipped or made unreachable, and the page has no required horizontal scrolling.
14. The interface clearly distinguishes the current participant, current phase, table dice, trail dice, legal candidates, passes, unavailable cells, closures, seals, and strikes.
15. Sun, Spark, Wave, and Leaf remain distinguishable in grayscale and to a user who cannot perceive their colors.
16. Primary touch controls meet the target size, visible keyboard focus is present, screen-reader labels identify dice and trail cell states, and reduced motion does not hide feedback.
17. CPU activity never permanently blocks input or prevents access to the current game state.

### 12.5 Deployment and originality

18. The published app loads from GitHub Pages, can be installed where the browser supports it, and reloads its application shell offline after a successful online visit.
19. The service-worker cache version identifies the published build and is incremented when cached assets change.
20. The repository and shipped interface contain only original Kuicks terminology, presentation, documentation, and authorized assets.
21. No Firebase dependency or network account is required to complete a Single-Device CPU Alpha game.

## 13. Required evidence before alpha approval

- Passing automated rule-engine and CPU-policy test output.
- A focused manual Android phone-test checklist attached to the implementation issue.
- Results for the supported phone-width matrix.
- Refresh/recovery test results at each phase boundary.
- Accessibility spot checks for keyboard, screen-reader naming, contrast, grayscale cues, zoom, and reduced motion.
- A published GitHub Pages URL and recorded build/cache version.
- Product-owner phone testing and explicit approval while the implementation issue remains open.

## 14. Dependencies and document relationships

- `GAME_RULES.md` is normative for mechanics and scoring.
- `GAME_MODES_AND_OPTIONS.md` will define normal and advanced setup values and locking behavior.
- `UX_DESIGN.md` will define screens, layout, states, dialogs, action hierarchy, and accessible presentation.
- `ARCHITECTURE.md` will define code boundaries, state flow, persistence, PWA strategy, and future Firebase integration.
- `DATA_MODEL.md` will define stable IDs, local and future online schemas, versions, migrations, and idempotency records.
- `TEST_PLAN.md` will turn these requirements and rule examples into automated and manual test suites.
- `ITERATION_WORKFLOW.md`, `ROADMAP.md`, and `DECISIONS.md` will govern delivery, sequencing, approval, and revision history.

If documents conflict, the approved rules govern game mechanics; the most recently approved requirement or recorded decision governs product scope. Conflicts must be resolved explicitly rather than inferred in code.

## 15. Approval gate

This draft requires explicit product-owner approval before it is marked as the Alpha v1 requirements baseline or committed to `main`.

Approval of this document authorizes the next documentation stage. It does not by itself authorize gameplay implementation, Firebase changes, deployment, issue closure, or changes to the approved game rules.

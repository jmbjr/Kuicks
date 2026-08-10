# Kuicks UX Design

Status: **Approved alpha baseline**  
Document version: **1.0-alpha**  
Rules dependency: **GAME_RULES.md 1.0-alpha (approved)**  
Requirements dependency: **PRODUCT_REQUIREMENTS.md 1.0-alpha (approved)**  
Modes dependency: **GAME_MODES_AND_OPTIONS.md 1.0-alpha (approved)**  
Last updated: **2026-08-10**

## 1. Purpose

This document defines the user experience for Kuicks from first launch through a completed game. It is the design authority for screen structure, interaction hierarchy, responsive behavior, visual states, accessibility semantics, and the original Kuicks visual identity.

The first implementation target is the **Single-Device CPU Alpha**: one human playing against one to four CPU participants on one Android phone, published through GitHub Pages and usable in a browser or as an installed PWA. Later pass-the-phone and separate-phone behavior is specified where it materially affects the initial design.

This document specifies behavior and intent, not exact pixel-perfect artwork. Implementation may refine measurements after physical-phone testing, but it must preserve the hierarchy, accessibility, and acceptance criteria defined here.

## 2. UX goals

1. A first-time player can start the default game with only a name and one prominent action.
2. During play, the player can identify the current participant, turn phase, dice result, legal choices, closed trails, strikes, and likely end conditions without opening help.
3. A legal human action takes one deliberate tap to select and one deliberate tap to confirm when ambiguity or consequence warrants confirmation.
4. CPU actions are understandable without making the player wait unnecessarily.
5. Refresh, relaunch, interruption, and temporary offline use feel safe and never imply a reroll or duplicate action.
6. The interface works at 320 CSS pixels wide without horizontal page scrolling.
7. Trail identity and state never depend on color alone.
8. Kuicks feels related to the welcoming handcrafted tabletop character of the reference horse-racing project while remaining unmistakably its own dice-and-trails product.

## 3. Experience principles

### 3.1 One obvious next action

At every normal point, one message states what is happening and one visual region contains the next meaningful action. Secondary information stays available but visually subordinate.

### 3.2 Board before controls

The score sheet is the primary game object. Legal marks appear directly on the relevant trail spaces. A detached list of legal actions may supplement accessibility but must not replace the board relationship.

### 3.3 Explain consequences at the point of choice

The UI exposes skipped spaces, close requirements, closure effects, and avoidable strikes when the player is deciding—not only in a rulebook or after the action.

### 3.4 Public information stays visible

Kuicks has no secret score-sheet information. The human can inspect opponent sheets and scores. Collapsing opponents on a narrow phone is a space-saving behavior, not secrecy.

### 3.5 Animation communicates state

Motion may connect a roll to available actions, or an action to a new mark, but never delays authority or hides the final value. Reduced-motion mode replaces movement with immediate state changes and concise emphasis.

### 3.6 Recovery is a normal state

Resume, reconnect, stale-cache detection, and interrupted CPU delay are designed flows. They are not treated as exceptional developer-only cases.

## 4. Navigation model

Kuicks is a single-page application with state-driven views rather than URL-driven multi-page navigation.

| App state | Primary view | Primary action |
|---|---|---|
| No active game | Home/setup | Start game |
| Recoverable game | Home/resume | Resume game |
| Active human decision | Game | Select or pass |
| CPU processing | Game | Observe; optional skip visual delay |
| Paused future game | Paused game | Resume |
| Completed game | Results | Review results / play again |
| Blocking load/error | Recovery state | Retry, reload, or return safely |

The browser Back action must not silently abandon an active game. If navigation would leave the app, the active state remains persisted. Internal overlays and dialogs close before the app attempts navigation.

The application shell contains:

- a compact Kuicks header/logo;
- the current primary view;
- expandable help, records, and diagnostics appropriate to that view; and
- a compact footer containing version/build information.

No persistent bottom navigation is required for alpha. The game flow is shallow enough that tabs would consume scarce phone space without improving orientation.

## 5. Screen inventory

### 5.1 Required for Single-Device CPU Alpha

| Screen or surface | Purpose |
|---|---|
| Launch/loading | Restore cached shell and determine whether an active game exists |
| Home/setup | Enter a name, start the default game, resume, or reveal advanced options |
| New-game replacement confirmation | Protect an unfinished game from accidental replacement |
| Game board | Roll/phase status, dice, human sheet, actions, opponents, and game progress |
| Trail action confirmation | Confirm a selected mark when multiple meanings or consequences exist |
| Strike/pass confirmation | Prevent an avoidable strike caused by accidental passing |
| Rules/help accordion | Explain play in concise original language |
| Completed results | Show winner(s), totals, trail scoring, strikes, and replay options |
| About/diagnostics accordion | Show build, rules, engine, schema, and seed information |
| Offline/update notice | Explain cache/network state without blocking local play unnecessarily |
| Fatal recovery state | Preserve diagnostic information and avoid corrupting saved state |

### 5.2 Deferred screens

| Mode | Additional surfaces |
|---|---|
| Pass the Phone | Roster setup, handoff screen, sequential shared-choice collection |
| Separate Phones | Profile picker, room create/join, lobby, seat claim, waiting/reconnect states |
| Statistics/history | Records list, game detail, player statistics, charts |
| Simulation | Configuration, progress, aggregate results, cancellation |
| Experiment Lab | Scenario builder, seed replay, legal-action and policy inspector |

## 6. Home and setup

### 6.1 First-launch hierarchy

From top to bottom:

1. Kuicks logo and one-sentence description.
2. Human display-name field labeled **Your name**.
3. Large **Start game** button.
4. Collapsed **Advanced options** accordion.
5. Collapsed **How to play** accordion.
6. Compact install/offline availability prompt when relevant.
7. About/build information.

The default setup silently selects two CPU opponents and the documented CPU delay. The player must not configure rules to reach a valid first game.

### 6.2 Existing-game hierarchy

When a recoverable unfinished game exists:

1. A resume card shows participant names, current participant, turn/phase, last saved time, and rules version.
2. **Resume game** is the primary action.
3. **Start a new game** is secondary and opens a destructive confirmation.
4. Setup controls remain below the resume card.

### 6.3 Advanced options

For alpha, the accordion contains:

- CPU opponent count, 1–4, default 2;
- CPU visual delay using named choices such as Instant, Quick, Normal, and Relaxed;
- reduced-motion override only if the system-derived behavior needs an explicit control; and
- a diagnostic seed field only behind an additional clearly labeled developer/testing disclosure.

Advanced options must show their current summary while collapsed, for example **2 CPU opponents · Normal pace**.

### 6.4 Validation

- The name field is visibly labeled and supports browser autofill only where appropriate.
- Blank or whitespace-only names cannot start a game.
- Validation appears beside the field and is announced to assistive technology.
- Text is normalized and safely displayed; a display name never becomes a document or storage key.
- CPU count changes update the setup summary immediately.

## 7. Game-board information architecture

The portrait layout uses this order:

1. Sticky compact turn banner.
2. Dice tray and phase-specific explanation.
3. Human score sheet and directly associated actions.
4. Pass/confirm action area.
5. Compact game-progress strip.
6. Opponent cards.
7. Turn log/help/diagnostics accordions.

The sticky banner may compress while scrolling, but it must retain the current participant, phase, and connection/save state. It must not cover actionable cells.

### 7.1 Turn banner

The banner communicates:

- current participant name and Human/CPU indicator;
- turn phase: Roll, Table choice, Kick choice, resolving, or complete;
- whose input is required;
- brief instruction, such as **Choose one trail for Table total 8, or pass**;
- strike risk when the current human has not scored this turn; and
- save/offline status using icon plus text where material.

Suggested state phrasing:

| State | Status message |
|---|---|
| Human table choice | **Table choice: mark 8 on any legal trail, or pass.** |
| Human current-player kick | **Kick choice: combine one table die with a trail die.** |
| Human already scored table | **You scored this turn. A Kick choice is optional.** |
| Human no mark before ending turn | **Passing now gives you a strike.** |
| CPU table choice | **Mica is considering the shared Table total…** |
| CPU kick choice | **Mica is choosing a Kick…** |
| Resolution | **Applying everyone’s Table choices…** |
| Trail closed | **Sun closed. Its trail die leaves play.** |
| Game complete | **Game complete — final scores are ready.** |

Messages describe facts rather than anthropomorphizing hidden CPU reasoning.

### 7.2 Dice tray

The dice tray visually separates:

- two neutral **Table dice** in one framed group; and
- four named **trail dice**, each paired with its trail icon/pattern.

Each die shows a conventional pip face plus an accessible text value. Trail dice repeat the trail identity in an adjacent label; color alone is insufficient.

During Table choice:

- the two Table dice are emphasized;
- their sum appears as a prominent equation, such as `3 + 5 = 8`;
- trail dice remain visible but subdued.

During Kick choice:

- both Table dice are selectable;
- each open trail die is selectable;
- the UI may show resulting totals after the first die selection;
- closed-trail dice are absent from the active group and represented in a compact **out of play** summary.

Dice values become authoritative as soon as the roll transition is saved. Animation is decorative and may be skipped without changing or concealing the values.

### 7.3 Game-progress strip

A compact strip shows:

- closed trails: `0 / 2`, `1 / 2`, or game-ending `2 / 2`;
- the human’s strikes: `0 / 4` through `4 / 4`;
- current turn number; and
- a concise warning when one more closure or human strike can end the game.

Opponent strike risk appears on their cards and in the turn banner when relevant.

## 8. Score-sheet design

### 8.1 Original layout

Kuicks uses four stacked trail cards rather than reproducing another product’s score-sheet trade dress. Each trail card contains:

- icon, trail name, and direction word (**Rising** or **Falling**);
- pattern strip unique to that trail;
- eleven ordered number spaces;
- a distinct close-space treatment at the forward end;
- mark count and current trail score; and
- open/closed state.

Proposed visual identities:

| Trail | Color role | Icon | Pattern | Direction |
|---|---|---|---|---|
| Sun | Warm gold | Sunburst | Radiating ticks | Rising 2→12 |
| Spark | Muted red | Spark/bolt | Angled zigzag | Rising 2→12 |
| Wave | Dusty blue | Wave | Repeating ripple | Falling 12→2 |
| Leaf | Deep green | Leaf | Branching veins | Falling 12→2 |

The overall application frame uses deep green, but Leaf must remain distinguishable through its label, icon, pattern, and local contrast.

### 8.2 Narrow-phone behavior

- The page itself never scrolls horizontally.
- Each complete eleven-space trail fits within the available card width at 320 CSS pixels.
- Spaces may use compact circular/rounded cells with abbreviated decoration, but printed values remain readable.
- Trail metadata may wrap above the row; the row itself stays in order.
- Touch selection may target the whole legal cell plus surrounding safe hit area without changing visual spacing.
- An optional expanded-sheet view may increase cell size on larger screens, but cannot be required for normal play.

### 8.3 Cell states

Each numbered space has exactly one semantic state for a participant:

| State | Visual treatment | Interaction |
|---|---|---|
| Future unavailable this roll | Normal paper cell | Not actionable |
| Legal Table target | Strong outline plus Table badge | Tappable in Table phase |
| Legal Kick target | Strong outline plus die-combination badge | Tappable in Kick phase |
| Selected candidate | Filled focus treatment plus check indicator | Confirmable/cancellable |
| Marked | Inked check/slash symbol and accessible **marked** label | Not actionable |
| Skipped permanently | Muted hatch and accessible **skipped** label | Not actionable |
| Close locked by progress | Lock icon and `Need N marks` label | Not actionable |
| Close currently legal | Seal outline plus **Close trail** label | Tappable with confirmation |
| Globally closed | Closed banner/pattern over card; existing marks remain readable | Not actionable |

Hover must never be necessary. Keyboard focus and touch selection use the same semantic candidates.

### 8.4 Marks, skipped spaces, and seals

- A mark uses an ink-like symbol, not a color fill alone.
- When a player moves forward, newly skipped spaces change visibly as part of the confirmation preview.
- A close preview states that the trail will close for everyone and the die will leave play.
- The closer’s seal appears in a separate seal position adjacent to the close space; it is not visually confused with another numbered cell.
- Simultaneous Table-phase closers each display their own seal after batch resolution.

### 8.5 Score display

Each trail card shows `marks → points`, for example **6 marks · 21 points**. The sheet summary shows:

- four trail subtotals;
- strike deduction;
- current total; and
- a label that totals are provisional until the game ends.

The game must not imply that a player currently leading has already won.

## 9. Human action hierarchy

### 9.1 Table choice

1. The phase banner explains the Table total.
2. Every legal target is highlighted directly on the human sheet.
3. The player taps a legal target or **Pass Table choice**.
4. If only one unambiguous, non-closing target exists, tapping it may immediately submit after phone testing confirms accidental taps are unlikely; otherwise a compact confirmation appears.
5. A close choice always requires confirmation.
6. Submission is disabled while the authoritative transition is being saved/applied.

In future multi-human modes, submission records the choice without revealing later participants’ pending choices. Phase resolution occurs only after all required Table choices are present.

### 9.2 Kick choice

The preferred interaction is board-led:

- legal destination cells show one or two small combination labels, such as **Table 3 + Sun 5**;
- tapping a destination with one combination selects it;
- tapping a destination with two combinations asks which Table die to use only if the distinction matters to the stored action record;
- alternatively, a player may select one Table die and then see compatible trail destinations.

The implementation should test both patterns on a physical narrow phone and retain the one with fewer mis-taps and less visual clutter. In either pattern, the stored command identifies the exact dice used.

The pass label reflects consequence:

- **Skip Kick choice** if the current player already made a Table mark;
- **Pass and take a strike** if they have made no mark this turn.

### 9.3 Confirmation policy

Confirmation is required for:

- closing a trail;
- passing when that causes a strike;
- replacing or deleting an active game; and
- actions whose selected target or die combination is not visually unambiguous.

Routine legal marks should not require a full-screen modal. Use an anchored confirmation row or bottom sheet that retains board context.

### 9.4 Invalid actions

Illegal cells are not interactive, but the player may request **Why can’t I mark this?** through a help/detail gesture or accessible description. Reasons use rule concepts:

- value does not match the current dice;
- space is behind current progress;
- trail is closed;
- close needs more prior marks;
- action belongs to another phase; or
- this phase’s choice is already submitted.

The UI never relies on silently ignoring a tap. It gives brief non-blocking feedback without changing state.

## 10. CPU presentation

CPU decisions use the same visible board and rule states as human actions.

- The turn banner names the acting CPU and phase.
- The configured delay is presentation-only and may be shortened by reduced-motion preference.
- The chosen dice/cell receives a brief emphasis before or as the mark appears.
- A concise event message states the outcome, such as **Mica marked Wave 7** or **Mica passed and took a strike**.
- The interface does not reveal internal heuristic scores during normal play.
- Human controls are disabled while a CPU-owned transition is authoritative.
- Refresh during a delay resumes from saved state and must not choose or apply a second action.

An **Instant** delay option may remove staged animation, but the event log and resulting mark still explain what occurred.

## 11. Opponent presentation

The active human’s complete sheet remains expanded by default. Each CPU has a compact card showing:

- name and CPU label;
- active-player indicator;
- current total score;
- strikes;
- per-trail mark counts and closure/seal indicators; and
- an expand action for the full score sheet.

The currently acting CPU card may auto-expand only if it does not cause disruptive scrolling. Otherwise it receives a strong border and the relevant action appears in the sticky banner/event message.

On larger screens, sheets may form a responsive grid. Reading order remains seat order, and the active participant is visually and semantically identified.

## 12. Dialogs, sheets, and confirmations

| Surface | Required content | Dismissal behavior |
|---|---|---|
| Close trail | Trail name, close value, seal, global closure, die removal | Cancel returns to same phase |
| Strike pass | Explicit `−5 points` and strike count after passing | Cancel returns to choices |
| Replace game | Existing participants/progress and irreversible local replacement consequence | Safe choice is cancel/resume |
| Game complete | End trigger and path to full results | Cannot return to active play |
| Update available | Whether reload is safe; active game preservation | May defer until safe |
| Recovery failure | What was preserved, diagnostic copy action, safe reset path | Reset requires separate confirmation |

Dialogs trap keyboard focus, have accessible names/descriptions, and return focus to the invoking control. Escape/back closes only non-destructive dismissible overlays.

## 13. Results and completed state

The results screen appears immediately after the authoritative final phase and includes:

1. **Winner** or **Shared victory** heading.
2. Participant ranking cards in final-score order.
3. Exact score equation for every participant: four trail subtotals minus strikes.
4. End reason: second trail closed or fourth strike.
5. Expandable final score sheets.
6. **Play again** using the same participant setup.
7. **New setup** to change options.
8. Seed, rules, engine, and build details under diagnostics.

Ties remain shared victories; the UI must not invent a tiebreak rank. Equal winners receive equal prominence.

In alpha, replaying creates a new game ID and new seed unless a diagnostic replay is explicitly chosen. Completed local games are reviewable as supported by storage scope but do not imply permanent family history.

## 14. Expandable sections

Accordions preserve the successful information-density pattern of the reference project.

### 14.1 Home

- Advanced options
- How to play
- Install/offline help
- About Kuicks

### 14.2 Active game

- Opponent full sheets, one card per participant
- Recent actions
- Scoring reference
- Full rules/help
- Diagnostics

### 14.3 Results

- Final sheets
- Score details
- Game details

Accordion headers show useful summaries while collapsed. Expansion state is UI preference and must not alter game state. Only one large phone section may default open at a time, but opening one need not force all others closed unless phone testing shows excessive page length.

## 15. Visual design system

### 15.1 Relationship to the reference project

Kuicks inherits platform-level visual DNA:

- warm paper/cream page background;
- deep green framing and primary actions;
- muted gold and red accents;
- rounded cards with subtle borders and restrained shadows;
- Georgia-like display typography with readable system sans-serif body text;
- large touch controls;
- compact advanced controls; and
- welcoming, handmade tabletop character.

It does not inherit horse imagery, race-track metaphors, horse-specific components, or exact screen compositions. Shared style tokens may be recreated intentionally; game-specific artwork and interaction remain original.

### 15.2 Original Kuicks identity

Kuicks centers on momentum, dice, marks, trails, and seals.

- The wordmark may use a hand-lettered or stamped display treatment, but body text stays highly readable.
- A compact logo may combine a tumbling die with a forward mark or trail motif.
- Decorative line work suggests pencil/ink scoring and forward movement.
- Trail patterns provide a recognizable four-part visual system.
- Dice faces and marks feel tactile without imitating a commercial product’s exact components.
- Avoid horse, racetrack, hoof, commercial score-pad, and copied lock-symbol arrangements.

### 15.3 Suggested token direction

Exact values are finalized during implementation and contrast testing.

| Role | Direction |
|---|---|
| Page | Warm cream paper |
| Primary frame/action | Deep forest green |
| Main text | Near-black green/brown ink |
| Secondary text | Muted charcoal with compliant contrast |
| Card | Lighter cream with subtle warm border |
| Accent | Antique gold and muted brick red |
| Focus | High-contrast blue/teal or outlined dual treatment |
| Error/strike | Dark red plus strike icon/text |
| Success/mark | Ink mark plus semantic label, not green alone |

Shadows remain shallow and consistent. Texture, if used, must be subtle, generated/original, and removable in high-contrast or reduced-data contexts without losing hierarchy.

## 16. Responsive layout

### 16.1 Narrow portrait: 320–479 CSS px

- Single-column cards.
- Sticky compact turn banner.
- Dice tray wraps by semantic group, never interleaves Table and trail dice.
- Human sheet expanded; opponents collapsed.
- Primary actions span most or all available width.
- No page-level horizontal scrolling.
- Dialogs use near-full-width bottom sheets where board context remains helpful.

### 16.2 Wide phone/tablet: 480–899 CSS px

- Dice tray and turn summary may share a row.
- Opponent summaries may use two columns.
- Score trail cells gain spacing, not additional required content.

### 16.3 Desktop: 900 CSS px and above

- Centered maximum-width tabletop surface.
- Human board and opponent/status rail may sit side by side.
- All capabilities and reading order remain equivalent to phone layout.

Landscape must remain functional. The app may recommend portrait for comfort but cannot block play or hide controls.

## 17. Accessibility

### 17.1 Semantics and labels

- Use native buttons, fields, headings, details/summary controls, and dialogs where possible.
- Every die exposes group, identity, and value, for example **Table die A, 3**.
- Every trail cell exposes participant, trail, printed value, state, and phase action, for example **Your Sun trail, 8, legal Table mark**.
- Icons have text alternatives; decorative texture is hidden from assistive technology.
- Current participant and phase are headings/status semantics, not color changes alone.
- Dynamic status uses restrained live regions; dice animation must not announce intermediate decorative values.

### 17.2 Touch and keyboard

- Primary touch targets aim for at least 44 × 44 CSS px.
- Compact score cells may have a smaller visible shape only if their actual non-overlapping hit target meets the target size where layout permits; at 320 px, physical phone testing determines the safest feasible treatment.
- All actions are keyboard reachable in logical visual order.
- Focus is clearly visible against every trail color and card state.
- Focus is moved only for dialogs, view changes, or explicit error recovery—not after routine background updates.

### 17.3 Color, contrast, and pattern

- Normal text and controls meet WCAG 2.2 AA contrast targets.
- Trail identities use name, icon, pattern, and position in addition to color.
- Legal, selected, marked, skipped, locked, and closed states use shape/symbol/text differences.
- Disabled controls retain enough contrast to be recognized but are not confused with enabled controls.

### 17.4 Motion, sound, and cognition

- Honor `prefers-reduced-motion` by default.
- No required information appears only during animation.
- Sound is optional, off until intentionally implemented, and never the sole feedback.
- Instructions use Kuicks terminology consistently and avoid unexplained abbreviations.
- Confirmation language names the consequence rather than asking a generic **Are you sure?**

## 18. System and exceptional states

### 18.1 Loading

The initial shell shows the Kuicks identity and a concise **Loading your game…** status. If loading exceeds a reasonable threshold, show recovery guidance rather than an indefinite spinner.

### 18.2 Empty

With no saved game, the home screen opens directly to setup. Records/statistics accordions state that no completed history is available rather than showing a blank panel.

### 18.3 Saving

Local authoritative saves should normally be invisible and immediate. A subtle status may show **Saved on this device** after important transitions. Failure to persist is blocking: do not imply an action is safely recoverable when it is not.

### 18.4 Offline

- A cached Single-Device CPU game remains playable offline.
- The status uses **Offline — game saved on this device** when true.
- First-load failure before the shell is cached explains that a connection is required once.
- GitHub Pages deployment availability is not confused with gameplay authority.

### 18.5 Update available

Do not force-refresh during an active choice. Offer **Update when safe** or explain that the active game will be preserved and migrated. A version incompatible with saved state enters an explicit recovery flow rather than discarding it.

### 18.6 Paused

Pause is deferred for alpha, but its future state preserves dice, phase, choices, current participant, and save revision. A paused game shows who paused it, when, and what action resumes play. Pausing never counts as passing.

### 18.7 Disconnected separate-phone state

Future online play distinguishes:

- reconnecting;
- offline with unsent choice not yet accepted;
- waiting for another participant;
- seat claim lost/needs reclaim; and
- room unavailable or expired.

The UI never displays an optimistic action as authoritative until Firestore accepts the correct revision. It keeps the submitted command ID safe for idempotent retry.

### 18.8 Recoverable error

Show what failed, what remains safe, and the next action. Examples include **Your game is still saved. Retry loading it** and **That choice was already applied; the board has been refreshed**.

### 18.9 Fatal or invalid state

Do not continue play from an invariant failure. Preserve the raw save, show rules/engine/schema/build IDs, provide a diagnostic copy/export action, and offer a separately confirmed reset. Never automatically overwrite the only recovery copy.

## 19. Future mode UX

### 19.1 Pass the Phone

- A handoff screen names the next human and requires **I’m ready** before input.
- It does not claim to hide secret score information.
- Table choices are collected sequentially but presented as pending until atomic resolution.
- Previously submitted choices are not exposed to later participants through the normal UI.
- Refresh returns to the exact seat awaiting input.

### 19.2 Separate Phones

- Home adds **Create room** and **Join room** under the normal mode choice.
- The lobby shows room code, stable profiles, claimed seats, ready state, CPU seats, and host controls.
- Game screens emphasize **Waiting for…** and reconnection states without blocking inspection of public state.
- A returning device gets **Rejoin as [profile]** when a valid seat claim exists.
- Room codes are readable, copyable, and shareable; they are not treated as authentication secrets.

### 19.3 Statistics and history

- Main-screen records remain accordions/cards rather than a dense desktop dashboard.
- Charts include text summaries and accessible underlying values.
- Player identity uses stable profile IDs while names display from safe snapshots/current profiles.
- Simulations and experiments are clearly excluded from normal family totals.

### 19.4 Simulation and experiments

- Long work shows seed/configuration, progress, elapsed time, and cancellation.
- Results prioritize aggregate cards and phone-readable charts.
- Experiment surfaces use a distinct developer-style banner so they cannot be mistaken for normal games.
- High-speed loops never animate per turn or write each game to Firestore.

## 20. Event feedback and recent actions

The active game retains a short, human-readable event list, newest first or in a clearly indicated chronological order. Events include:

- dice rolled with final values;
- participant marked trail/value by Table or Kick choice;
- participant passed;
- strike received;
- trail closed and seal earned;
- current participant advanced; and
- game completed and why.

The log is supporting evidence, not the game-state authority. It may be reconstructed from authoritative actions where available. Normal entries avoid technical IDs; diagnostics may expose them separately.

## 21. Content and terminology

- Product name is always **Kuicks**.
- Use approved terms: participant, current player, Table dice, trail die, trail, Table choice, Kick choice, close space, seal, closed trail, and strike.
- Buttons use verbs and consequences: **Start game**, **Mark Sun 8**, **Pass and take a strike**, **Close Sun trail**, **Resume game**.
- Avoid copied rulebook phrasing and the branding terminology of other commercial games.
- CPU names should be original, distinct, family-friendly, and not imply difficulty unless policies differ.
- Error text is specific and non-blaming.

## 22. UX acceptance criteria

### 22.1 Setup

- At 320 CSS px, a first-time player can enter a name and start the default one-human/two-CPU game without opening an accordion or scrolling horizontally.
- Resume is visually primary whenever an unfinished game exists.
- Advanced settings remain collapsed and summarize their current values.

### 22.2 Active play

- At every phase, the current participant, phase, required input, dice values, and end-condition progress are visible or reachable without leaving the board.
- All legal human destinations are visibly distinct from illegal, skipped, marked, locked, and closed cells without relying on color.
- Table and Kick choices cannot be mistaken for one another.
- Closing and strike-causing passes name their consequences before submission.
- CPU actions remain understandable at Instant and delayed speeds.
- No normal action requires page-level horizontal scrolling at 320 CSS px.

### 22.3 Accessibility

- All normal actions work with touch and keyboard.
- Screen-reader labels identify dice, trail, value, cell state, and available action.
- Trail and state identities survive grayscale viewing.
- Text, controls, and focus indicators meet the approved WCAG 2.2 AA targets.
- Reduced-motion users receive the same final information without required animation.

### 22.4 Recovery and completion

- Refresh during any human phase or CPU delay returns to the same authoritative roll and phase without a duplicate action.
- Offline cached play clearly distinguishes local save state from network availability.
- Final results show exact scoring and shared winners correctly.
- Invalid stored state is preserved for diagnostics and never silently reset.

### 22.5 Originality

- The implemented product contains no copied branding, artwork, proprietary assets, rulebook prose, exact commercial score-sheet layout, or horse-specific imagery.
- Kuicks has its own wordmark direction, trail cards, icons/patterns, dice grouping, terminology, and interaction hierarchy.

## 23. Phone-test checklist for staged implementation

For every UX-affecting build published to GitHub Pages, test on a representative Android phone:

1. Open from a fresh browser tab and from installed PWA mode when available.
2. Start the default game without opening advanced options.
3. Verify no horizontal page scroll at the device’s portrait width.
4. Complete Table and Kick choices with each trail direction.
5. Preview a move that skips spaces.
6. Trigger the close requirement lock and a legal closure.
7. Pass with and without strike consequence.
8. Observe CPU mark, pass, strike, and closure feedback.
9. Expand and collapse every opponent/help section.
10. Refresh during a human choice and during CPU delay.
11. Test offline after the shell is cached.
12. Enable Android font scaling and reduced motion.
13. Complete a tied game using a deterministic fixture.
14. Confirm final score equations and end reason.
15. Record mis-taps, ambiguous labels, clipped text, scroll jumps, and controls obscured by browser chrome or the on-screen keyboard.

## 24. Open implementation validations

These are phone-test questions, not unresolved rules decisions:

- Whether direct tap-to-submit for a single routine legal target is safe enough, or all marks need a lightweight confirm step.
- Whether board-led Kick selection or die-first Kick selection creates less clutter and fewer errors at 320 px.
- The smallest readable trail-cell geometry that preserves non-overlapping touch targets.
- Whether the compact sticky banner should collapse automatically while scrolling.
- The final CPU delay labels and durations after perceived-speed testing.
- Whether one-open-at-a-time opponent accordions reduce scroll confusion.

The first implementation should choose the simplest accessible approach, record the choice in `DECISIONS.md`, and leave the associated issue open until physical-phone approval.

## 25. Approval gate

The product owner approved this document as the Alpha v1 UX baseline on 2026-08-10. This approval does not by itself authorize gameplay implementation. Material changes after approval require a dated decision entry, compatible document updates, and approval before implementation.

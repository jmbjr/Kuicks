# Kuicks Game Rules

Status: **Approved alpha baseline**  
Rules version: **1.0-alpha**  
Last updated: **2026-08-10**

This document defines the approved alpha rules for Kuicks. It is written to be usable by players, implementers, CPU-policy authors, and test authors without relying on another game's text or presentation.

Kuicks uses familiar roll-and-record ideas, but its name, terminology, writing, interface, artwork, and visual organization must remain original.

## 1. Game summary

Kuicks is a push-your-luck dice game for **2–5 participants**. A participant may be a human or a CPU player.

Every participant develops four independent number trails. On each turn:

1. all participants may record the total of the two table dice; and
2. the current player may also record the total of one table die and one trail die.

Numbers must be recorded forward along a trail. Passing a number makes earlier spaces permanently unavailable. Completing a trail closes it for everyone. The game ends when two trails close or one participant accumulates four strikes.

The highest final score wins.

## 2. Original Kuicks terminology

| Term | Meaning |
|---|---|
| Participant | A human or CPU player in the game |
| Current player | The participant whose turn is being resolved |
| Table dice | The two neutral dice available to everyone |
| Trail die | One die associated with a particular scoring trail |
| Trail | One ordered row of number spaces on a score sheet |
| Table choice | Optional score using the two table dice |
| Kick choice | Optional current-player score using one table die and one trail die |
| Close space | The final numbered space of a trail |
| Seal | The bonus mark earned by the participant who closes a trail |
| Closed trail | A trail no participant may mark again |
| Strike | A negative mark taken when the current player records nothing during the turn |
| Forward | Toward the close space, regardless of whether printed values rise or fall |

Interface labels may use shorter forms such as **Table**, **Kick**, **Close**, and **Strike**, provided their accessible labels state the full meaning.

## 3. Components

A game contains:

- two six-sided table dice;
- four six-sided trail dice, one for each trail;
- one score sheet per participant;
- a current-player marker;
- a shared record of closed trails; and
- a random seed and deterministic random-number state in the digital implementation.

### 3.1 Proposed trail identities

The names, icons, and patterns are part of Kuicks' original presentation. Final visual design may refine them without changing their mechanical identity.

| Trail ID | Display identity | Direction | Printed values | Close value |
|---|---|---|---|---:|
| `sun` | Sun · gold · radiating pattern | Rising | 2 through 12 | 12 |
| `spark` | Spark · muted red · zigzag pattern | Rising | 2 through 12 | 12 |
| `wave` | Wave · blue · ripple pattern | Falling | 12 through 2 | 2 |
| `leaf` | Leaf · deep green · vein pattern | Falling | 12 through 2 | 2 |

Color must never be the only way to distinguish a trail. Every trail is also identified by its name, icon, pattern, and accessible label.

## 4. Objective

Build valuable trails while limiting strikes. A trail's value increases with the number of marks it contains. Closing a trail can earn an additional seal mark, but it also removes that trail and its die from future play.

When the game ends, add all four trail scores and subtract strike points. The participant with the highest total wins.

## 5. Setup

1. Select **2–5 participants** and establish their seat order.
2. Create a blank score sheet for each participant.
3. Put all six dice into play.
4. Mark every trail as open.
5. Give every participant zero strikes.
6. Choose the starting participant using the configured method. The proposed default is a seeded random choice.
7. Snapshot all game settings, rules version, engine version, participant profile IDs, seat order, and random seed into the game record.

All score-sheet information is public. Pass-the-phone mode therefore requires no hidden-information screen for rules purposes, though a handoff screen may still prevent accidental input.

## 6. Score-sheet progression

Each trail contains eleven numbered spaces in a fixed left-to-right order.

- Sun and Spark run `2, 3, 4, ... 12`.
- Wave and Leaf run `12, 11, 10, ... 2`.

To mark a value, the participant must move forward along that trail. A participant may mark any legal occurrence of the rolled value that lies after their most recently marked space. All skipped spaces become permanently unavailable to that participant.

### 6.1 Progress examples

- If Maya's Sun trail has 2 and 5 marked, she may later mark 6–12. She may not return to 3 or 4.
- If Theo's Wave trail has 12 and 9 marked, he may later mark 8–2. He may not return to 11 or 10.
- Marks do not need to be consecutive.
- Progress on one trail does not affect progress on another trail.
- Another participant's marks do not affect a participant's progress unless a trail closes globally.

## 7. Turn structure

Each turn has four ordered phases.

### Phase A: Roll

The current player rolls both table dice and every trail die whose trail remains open.

The result is fixed for the rest of the turn. Refreshing, reconnecting, changing screens, or retrying a network command must not reroll the dice.

### Phase B: Table choices

Add the two table dice. This is the **table total**.

Every participant, including the current player, independently chooses one of the following:

- mark the table total in one open trail where that value is legal; or
- pass.

A participant can make at most one table choice per turn.

All table choices are evaluated against the game state at the beginning of Phase B and then resolved as one batch. This matters when more than one participant qualifies to close the same trail.

### Phase C: Kick choice

If the game did not end during Phase B, the current player may choose one of the following:

- select one table die and one available trail die, add them, and mark that total in the trail matching the selected trail die; or
- pass.

The other participants do not make a kick choice.

The current player may score in both Phase B and Phase C. If both marks use the same trail, the Phase B mark is applied first, so the Phase C mark must be forward of it.

### Phase D: Strike and handoff

If the current player made neither a table mark nor a kick mark during this turn, that participant takes one strike.

Passing is always permitted, even if a legal mark exists. A strike depends on the current player's final recorded actions, not on whether legal actions were available.

After checking end conditions, advance the current-player marker to the next participant in seat order.

## 8. Legal scoring actions

A proposed mark is legal if and only if all of these conditions hold:

1. the game is active and currently in the correct choice phase;
2. the acting participant is eligible to act in that phase;
3. the participant has not already completed that phase's choice;
4. the target trail is open at the phase's eligibility snapshot;
5. the dice used are permitted in that phase;
6. their sum equals the printed value of the target space;
7. the target space lies forward of the participant's last mark in that trail;
8. the target space is not the close space, unless the participant satisfies the close requirement; and
9. the command has not already been applied.

### 8.1 Table-choice dice

- Exactly the two table dice are used.
- The total may be marked in any open trail containing that value legally.
- Because rising and falling trails contain the same values, a participant may have several legal trail choices for one total.

### 8.2 Kick-choice dice

- Exactly one of the two table dice and exactly one available trail die are used.
- The result may be marked only in the trail associated with that trail die.
- The two possible table-die combinations are distinct action candidates even when they produce the same total.
- A trail die is unavailable once its trail is closed.

### 8.3 No automatic scoring

The engine never chooses a mark for a human participant. If multiple targets are legal, the human selects one. A CPU policy may select among legal actions, but the rule engine independently validates its choice.

## 9. Closing a trail

A participant may mark a trail's close space only if they already have at least **five numbered marks** in that trail before the close-space mark is applied.

When a participant legally marks the close space:

1. mark the close value on that participant's sheet;
2. give that participant one seal in that trail;
3. close the trail globally; and
4. remove the matching trail die from future rolls.

The close-space mark is a numbered mark. The seal is an additional scoring mark.

### 9.1 Shared-phase simultaneous close

If multiple participants legally submit the same trail's close value during Phase B, all eligible submitted marks are applied. Each such participant receives that trail's seal. The trail then closes once globally.

A participant who did not submit the close during that phase cannot add it afterward.

### 9.2 Closed-trail effects

- No later table or kick choice may mark the trail.
- Existing marks remain and are scored normally.
- Only participants who actually completed the close receive the seal.
- Closing a trail does not erase or alter the rolled table dice.
- The remaining open trail dice continue to be rolled normally.

## 10. Strikes

Only the current player can receive a strike.

The current player takes exactly one strike when they complete a turn without making either available type of mark. They do not take two strikes for passing both phases.

Each strike is worth **−5 points**. A participant can hold at most four strikes because the fourth ends the game.

No strike is assigned when Phase B closes the second trail and ends the game before Phase C and Phase D. The interrupted current-player turn is not treated as a failed turn.

## 11. End of game

The game ends when either condition becomes true:

1. **two distinct trails are closed**, regardless of who closed them; or
2. **any participant receives a fourth strike**.

End conditions are checked after the atomic resolution of each phase.

- If Phase B produces the second closed trail, finish resolving all valid Phase B choices and end immediately. Do not offer a kick choice.
- If Phase C produces the second closed trail, finish that mark and end immediately.
- If Phase D gives a participant a fourth strike, end immediately.
- Once the game is complete, later or duplicated commands cannot change it.

The action or resolved batch that triggers completion remains part of the final score.

## 12. Scoring

For each trail, count:

- every numbered mark in that trail; plus
- one additional mark if that participant earned the trail's seal.

Convert that count to points using the triangular sequence:

| Scoring marks | Points | Scoring marks | Points |
|---:|---:|---:|---:|
| 0 | 0 | 7 | 28 |
| 1 | 1 | 8 | 36 |
| 2 | 3 | 9 | 45 |
| 3 | 6 | 10 | 55 |
| 4 | 10 | 11 | 66 |
| 5 | 15 | 12 | 78 |
| 6 | 21 |  |  |

For `n` scoring marks, the engine uses:

`trailPoints(n) = n × (n + 1) ÷ 2`

Final score:

`finalScore = sun + spark + wave + leaf − (5 × strikes)`

Negative final scores are allowed.

### 12.1 Scoring example

A participant finishes with:

- Sun: 6 numbered marks and a seal = 7 scoring marks = 28 points;
- Spark: 4 numbered marks = 10 points;
- Wave: 7 numbered marks = 28 points;
- Leaf: 2 numbered marks = 3 points; and
- 2 strikes = −10 points.

Their final score is `28 + 10 + 28 + 3 − 10 = 59`.

## 13. Winner and ties

The participant with the highest final score wins.

If two or more participants share the highest score, they share the win. Kuicks uses no secondary tiebreaker by default. Statistics record each tied participant as a joint winner and record the game's winning margin as zero.

## 14. Important examples and edge cases

### 14.1 Same value, different trails

The table total is 8. A participant may legally place it in any open trail where 8 lies forward of their last mark. The participant marks at most one trail for the table choice.

### 14.2 Both choices in one trail

The table total lets the current player mark Sun 7. Their kick combination then totals 9 using the Sun die. They may mark both 7 and 9, in that order. They may not use the kick choice to mark Sun 6 or 7 afterward.

### 14.3 Passing despite a legal mark

The current player has a legal table choice but passes. They also pass the kick choice. They receive one strike. A non-current participant who passes simply receives no mark and no strike.

### 14.4 Close value without enough progress

Sun's close value is 12. A participant with four earlier Sun marks cannot mark 12. A participant with five earlier Sun marks may mark it, receive the seal, and close Sun.

### 14.5 Two participants close together

During the table-choice phase, two participants each have five earlier Sun marks and both submit Sun 12. Both marks and both seals count. Sun closes once. If this is the second closed trail, the game ends after all submitted table choices resolve.

### 14.6 Trail closes before the kick choice

If Phase B closes a trail but does not end the game, its trail die is unavailable in Phase C. Other open trail dice remain available.

### 14.7 No legal action

A non-current participant with no legal table mark passes without penalty. If the current player cannot legally mark in either phase, they take one strike at the end of the turn.

### 14.8 Duplicate digital command

Every action command carries a stable command ID. Applying the same command twice returns the previously established result or a no-op; it never adds a second mark, seal, strike, or turn transition.

### 14.9 Refresh during a roll

The dice result and phase are persistent game state. The restored client displays the existing roll and legal choices. It does not generate new dice.

## 15. Precise rule-engine model

This section is normative for implementation.

### 15.1 Core value types

```text
TrailId = "sun" | "spark" | "wave" | "leaf"
Phase = "awaitingRoll" | "tableChoices" | "kickChoice" | "turnEnd" | "completed"
ParticipantId = permanent profile ID
GameId = globally unique immutable ID
CommandId = globally unique immutable ID
```

### 15.2 Trail definitions

```text
sun.values   = [2,3,4,5,6,7,8,9,10,11,12]
spark.values = [2,3,4,5,6,7,8,9,10,11,12]
wave.values  = [12,11,10,9,8,7,6,5,4,3,2]
leaf.values  = [12,11,10,9,8,7,6,5,4,3,2]
minimumMarksBeforeClose = 5
strikeValue = -5
strikeEndCount = 4
closedTrailEndCount = 2
```

### 15.3 Score-sheet representation

Each participant/trail stores ordered marked indices, or an equivalent lossless representation. Legality is based on index order, not numeric comparison.

```text
lastMarkedIndex = maximum marked index, or -1 when empty
forward(value) = indexOf(value) > lastMarkedIndex
ordinaryMarksBeforeClose = count(marked numbered indices excluding close index)
canClose = forward(closeValue) and ordinaryMarksBeforeClose >= 5
```

### 15.4 Phase snapshots

At the beginning of the table-choice phase, record the open trails and each participant's legal candidates. Submitted table choices are validated against this snapshot so one participant's simultaneous close does not invalidate another participant's already-eligible choice.

After the table batch resolves, calculate kick candidates from the resulting state. Therefore, the current player's table mark can change their legal kick choices, and newly closed trails cannot be used for the kick.

### 15.5 Action functions

The rule layer should expose behavior equivalent to:

```text
createGame(settings, participants, seed) -> GameState
rollTurn(state, commandId) -> TransitionResult
getTableCandidates(state, participantId) -> Candidate[]
submitTableChoice(state, participantId, choiceOrPass, commandId) -> TransitionResult
resolveTableChoices(state, commandId) -> TransitionResult
getKickCandidates(state, currentParticipantId) -> Candidate[]
submitKickChoice(state, choiceOrPass, commandId) -> TransitionResult
finishTurn(state, commandId) -> TransitionResult
scoreSheet(sheet) -> ScoreBreakdown
getWinners(state) -> ParticipantId[]
validateState(state) -> ValidationResult
```

Functions return a new state rather than mutating their input. Random values come only from the stored deterministic random source. UI, Firebase, local storage, clocks, timers, and CPU strategy are outside the rule engine.

### 15.6 Required invariants

- A marked trail index appears at most once per participant.
- Marked indices within a trail are strictly progressive.
- A seal exists only when that participant marked the close space.
- A closed trail never becomes open again.
- At most four strikes exist per participant.
- Exactly one participant is current while the game is active.
- A completed game has immutable dice, sheets, strikes, and winners.
- A command ID affects state at most once.
- Every stored settings snapshot contains a rules version and schema version.

## 16. Mode-neutrality

These rules are identical for:

- one human with CPU opponents;
- pass-the-phone games;
- separate-phone rooms; and
- production-fidelity simulations.

Modes may change who supplies a decision, how long the interface waits, where state is stored, or whether results enter permanent statistics. Modes do not change legal actions unless a separately documented rules variant is selected before the game starts.

Experimental models may simplify rules only when the experiment clearly records the omitted behavior and its own model version.

## 17. Proposed defaults requiring approval

The following decisions materially define the product. The recommendations above assume all are approved together as the initial baseline.

| Decision | Proposed Kuicks default | Main alternative |
|---|---|---|
| Participant count | 2–5 total participants | Support larger groups immediately |
| Trail layout | Two rising 2–12; two falling 12–2 | Different values or directions |
| Table choice | Optional for every participant | Mandatory when legal |
| Kick choice | Optional; current player only | Mandatory when legal |
| Shared resolution | Collect then resolve as one batch | Resolve sequentially by seat |
| Close requirement | Five earlier numbered marks | Different progress threshold |
| Close reward | Close value plus one seal mark | Close value only |
| Strike trigger | Current player records no mark in either phase | Penalize a missed kick regardless of table mark |
| Strike value/end | −5 points; fourth strike ends game | Different values or limit |
| Trail end condition | Second closed trail ends game | Different number of closures |
| Phase-triggered ending | End after the triggering phase resolves | Always finish the entire turn |
| Tie handling | Shared win | Secondary tiebreaker |
| Starting player | Seeded random participant | Fixed/rotating first seat |

## 18. Explicitly deferred variants

The initial engine should not implement these until separately approved:

- alternative dice counts or die sizes;
- asymmetric or custom trail values;
- variable close thresholds;
- variable strike values or strike limits;
- simultaneous real-time kick choices;
- power-ups, rerolls, currencies, or consumable abilities;
- hidden score sheets;
- elimination before the whole game ends;
- campaign progression; and
- CPU-specific rule advantages.

Keeping variants out of the first playable build reduces ambiguity and makes the pure engine, CPU behavior, and statistics comparable.

## 19. Approval record

**Approved for alpha v1 by the product owner on 2026-08-10.**

The proposed defaults in Section 17 are the Kuicks alpha baseline. Subsequent rule changes must update the rules version and record their compatibility consequences in `DECISIONS.md`.

This approval authorizes requirements and rule-engine planning. It does not authorize unrelated gameplay features, Firebase changes, deployment, or issue closure.

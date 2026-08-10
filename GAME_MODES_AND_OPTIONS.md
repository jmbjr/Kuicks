# Kuicks Game Modes and Options

Status: **Approved alpha baseline**  
Document version: **1.0-alpha**  
Rules dependency: **GAME_RULES.md 1.0-alpha (approved)**  
Requirements dependency: **PRODUCT_REQUIREMENTS.md 1.0-alpha (approved)**  
Last updated: **2026-08-10**
Approved: **2026-08-10**

## 1. Purpose

This document defines every planned Kuicks play mode and configurable option. It identifies the approved alpha boundary, distinguishes presentation settings from rule variants, and states which choices can change after a game begins.

All normal play modes use the approved rules in `GAME_RULES.md`. A mode changes where participants act, how state is stored or synchronized, and who selects actions; it does not silently change legal moves or scoring.

## 2. Product principles for modes and options

1. **The default starts quickly.** A player should be able to enter a name and start a one-human, two-CPU game without opening advanced settings.
2. **Rules are consistent across normal modes.** Single-device, pass-the-phone, and separate-phone games produce the same outcome from the same seed and actions.
3. **Options reveal complexity gradually.** Advanced options remain collapsed until requested.
4. **Balance changes are explicit.** Any setting that changes legal actions, scoring, randomness, or CPU strength is labeled before the game starts and saved with the game.
5. **Active games are reproducible.** Mode, options, rules version, engine version, CPU policy version, seed, and seat order are snapshotted at creation.
6. **Presentation is not authority.** CPU delays, animation, sound, and accordion state never affect game results.
7. **Experiments do not pollute family records.** Simulations and experimental runs remain separate from ordinary games and statistics.

## 3. Mode summary

| Mode ID | Display name | Participants and devices | Intended use | Alpha status |
|---|---|---|---|---|
| `single_device_cpu` | Single-Device CPU | One human and 1–4 CPUs on one device | First playable milestone and fastest phone testing | **Required** |
| `pass_phone` | Pass the Phone | 2–5 local humans/CPUs sharing one device | Family play and local multiplayer testing | Deferred until after CPU alpha |
| `online_room` | Separate Phones | 2–5 humans/CPUs synchronized through a room | Family multiplayer across devices | Deferred |
| `simulation` | Simulation | CPU policies run in memory without interactive presentation | High-volume rule, policy, and balance analysis | Deferred |
| `experiment` | Experiment Lab | Developer-selected scenarios, policies, and seeds | Focused debugging and exploratory analysis | Deferred |

Only `single_device_cpu` is required for the Single-Device CPU Alpha. Deferred modes are specified now so the initial architecture does not block them.

## 4. Single-Device CPU mode

### 4.1 Intended use

Single-Device CPU is the smallest complete Kuicks experience and the primary development/test mode. One human plays against computer-controlled participants using a single Android browser or installed PWA. Approved playable builds are published to GitHub Pages for physical-phone testing.

“Single-device” describes where game state and input live. It does not mean the build runs only from a developer computer or cannot be deployed publicly.

### 4.2 Required behavior

- One local human participant is required.
- One to four CPU participants may be selected, producing 2–5 total participants.
- The default is one human plus two CPUs.
- All sheets and game information are public and inspectable on the device.
- Human choices require direct input; CPUs act automatically.
- The active game is saved locally after every authoritative transition.
- Refresh or PWA relaunch resumes the exact roll and phase without duplicate actions.
- No Firebase connection, account, room, or network connection is required after the application shell has been cached.
- A completed game may be reviewed locally but does not yet contribute to permanent family statistics.

### 4.3 Setup flow

The normal setup asks for only a human display name and offers a prominent **Start game** action. The default CPU count and delay are already selected. CPU count, action delay, seed controls, and other diagnostic settings appear under **Advanced options**.

If an unfinished game exists, **Resume game** is the primary action. Replacing it requires confirmation.

### 4.4 CPU policy for the first alpha

The first alpha may provide one named policy, provisionally **Balanced**. It must:

- choose only rule-engine-provided legal candidates;
- use deterministic, documented heuristics;
- make the same decision for the same state, seed state, and policy version;
- receive no hidden advantage;
- be independently validated by the rule engine; and
- remain testable without UI timers.

Difficulty controls must not appear until meaningfully different, tested policies exist. Random-looking tie breaks may consume the stored deterministic random stream, but the decision remains reproducible.

## 5. Pass-the-Phone mode

### 5.1 Intended use

Pass the Phone supports quick local family play and tests multi-human phase handling without Firestore. Two to five participants share one browser instance; any seat may be human or CPU, with at least two total participants and at least one human.

### 5.2 Required behavior

- Setup selects local profiles or temporary display names for each human seat.
- Seat order is visible before starting and locked for the game.
- Shared table choices are collected from every eligible human and CPU against the same Phase B snapshot.
- Submitted table choices are not applied one at a time; they resolve as the approved atomic batch.
- A handoff screen identifies the next human participant before accepting their choice.
- Because Kuicks has no private score-sheet information, the handoff screen prevents accidental input rather than concealing secret state.
- CPU choices may be prepared immediately but are revealed/resolved consistently with the shared phase.
- The game saves locally after every submitted choice and resolved phase.
- Refresh resumes the exact participant awaiting input.

### 5.3 Shared-phase input sequence

Humans may enter their Phase B decisions sequentially on the shared phone, but this is an input convenience only. Each choice is validated against the Phase B eligibility snapshot. After all eligible participants have submitted a mark or pass, the engine resolves the complete batch.

A participant cannot inspect later participants' unsubmitted choices through the normal interface. This is a fairness convention, not a hidden-information rule.

### 5.4 Differences from Single-Device CPU

| Concern | Single-Device CPU | Pass the Phone |
|---|---|---|
| Human seats | Exactly one | One or more |
| Human table choices | One local choice per phase | Sequential collection for each human |
| Handoff screen | Not required | Required between human inputs |
| Persistence | Local active game | Local active game plus pending-input seat |
| Network | Not required | Not required |
| CPU support | Required | Optional per seat |

## 6. Separate-Phones mode

### 6.1 Intended use

Separate Phones lets family members use their own devices while sharing one synchronized game. It uses Firebase anonymous authentication, permanent family profile IDs, a short room code, and Firestore as the online authority.

### 6.2 Required behavior

- A host creates a room and selects normal-game settings.
- Humans join with a room code and claim an available seat using a family profile.
- Profile identity uses a permanent profile ID, never a display name as a key.
- A device receives anonymous authentication before reading or writing protected room state.
- Each human submits only actions for the seat they currently control.
- Shared dice, phase, choices, sheets, closures, strikes, and results synchronize to all connected devices.
- The room records command IDs and resolves authoritative transitions transactionally or through another documented single-authority method.
- Duplicate, late, conflicting, and retried commands are safe and idempotent.
- Refresh or disconnection does not forfeit a seat; a participant can reclaim it using stored session/claim information.
- CPU seats are advanced by one elected authority at a time so a CPU action cannot be applied twice.
- Completed history is written once per game ID.

### 6.3 Lobby and start constraints

- The host can configure and reorder seats before starting.
- Every human seat must be claimed and ready before start.
- A room must contain 2–5 total participants and at least one human.
- The host may include CPU seats from the shared family roster.
- Rules-affecting settings, participant IDs, seat order, and mode lock when the game starts.
- Joining after start is limited to reclaiming an existing human seat unless a future spectator mode is explicitly approved.

### 6.4 Disconnection behavior

A disconnected participant's required decision remains pending. The game does not silently pass or replace that human with a CPU. The UI identifies the blocked seat and permits reconnection. Host-controlled replacement, turn timers, or automatic forfeits are deferred variants and require explicit approval.

### 6.5 Differences from single-device modes

| Concern | Single device | Separate phones |
|---|---|---|
| Authority | Versioned local state | Firestore-backed synchronized state |
| Identity | Local participant IDs | Permanent profile ID plus authenticated seat claim |
| Shared choices | Collected on one UI | Submitted independently from each device |
| Recovery | Local save/resume | Room listener plus seat reclaim |
| Conflict handling | Local command deduplication | Transaction/revision checks and command deduplication |
| Connectivity | Optional after cached load | Required to advance authoritative play |
| Completion record | Local inspection | Idempotent shared history/statistics pipeline |

## 7. Simulation mode

### 7.1 Intended use

Simulation runs many CPU-controlled games quickly to test rules, strategy, balance, and policy regressions. It uses the same pure rule engine as normal play without DOM rendering, animation delays, Firebase writes, or per-turn persistence.

### 7.2 Required behavior

- All participants use explicitly versioned CPU policies.
- Every run has a master seed; each game receives a deterministic derived seed.
- Given identical configuration and code versions, a run produces reproducible results.
- The engine validates all CPU actions and invariants.
- Work is chunked, moved to a worker, or otherwise scheduled so the UI remains responsive.
- The user can cancel a long run and retain clearly labeled partial aggregates.
- Progress shows completed games, total games, elapsed time, and invalid-game count.
- Ordinary family player statistics and completed-game history are never updated.
- Optional saved output contains configuration, versions, seed, aggregate results, timestamps, and failures—not every turn of every successful game.

### 7.3 Proposed aggregate outputs

- games completed and invalid games;
- wins and shared wins per policy/seat;
- score mean, median, range, and distribution;
- mean trail marks, closures, seals, and strikes;
- end-condition frequency;
- turn-count distribution;
- starting-seat advantage; and
- policy decision timing.

### 7.4 Simulation limits

The default maximum should be selected only after performance testing on a representative Android phone. The UI must warn before a configuration likely to cause a long mobile run. A desktop-oriented higher limit may be offered without making it the phone default.

## 8. Experiment Lab mode

### 8.1 Intended use

Experiment Lab supports focused, developer-oriented questions that are not well represented by a large batch of ordinary games. It is distinct from simulation so experimental state and one-off instrumentation do not leak into normal play.

### 8.2 Proposed experiment types

- **Seed replay:** run or step through a known seed and configuration.
- **Policy comparison:** replay equivalent seeded games with different CPU policies.
- **Scenario injection:** begin from a validated midgame state to test closures, strikes, or edge cases.
- **Decision inspection:** show legal candidates and the heuristic score assigned to each CPU option.
- **Balance sweep:** compare explicitly approved rules variants across a bounded seed range.
- **Failure replay:** reopen the smallest saved diagnostic record for an invariant or illegal-action failure.

### 8.3 Guardrails

- Experimental games are visibly labeled and cannot be mistaken for family games.
- They do not update ordinary history, achievements, or player statistics.
- Injected state must pass engine validation or show exact validation failures.
- Rules variants require unique configuration IDs and complete parameter snapshots.
- Aggregate summaries may be saved only by explicit user action.
- Raw turn traces default to transient storage and are saved only for debugging failures or by explicit request.

## 9. Option classification

Options belong to one of four classes:

| Class | Meaning | Snapshot at start? | Can change during play? |
|---|---|---:|---:|
| Mode | Changes participant input, authority, or persistence model | Yes | No |
| Rules/balance | Can change legal outcomes, scores, end timing, or strategic strength | Yes | No |
| Presentation | Changes timing or display without changing outcomes | Record when diagnostically useful | Yes |
| Diagnostic/experiment | Supports reproduction, testing, or analysis | Yes when used | Usually no |

Normal alpha games expose no configurable rules variants. The approved `1.0-alpha` rules are fixed.

## 10. Normal game options

| Option ID | Display label | Applies to | Default | Range/values | Balance effect | Locked after start? | Alpha |
|---|---|---|---|---|---|---:|---:|
| `mode` | Game mode | All | `single_device_cpu` | Supported mode IDs | No rule change; changes authority/input | Yes | Required |
| `human_name` | Your name | Single-Device CPU | Last valid local name or blank | Non-empty safe display text | None | Stored participant snapshot is locked | Required |
| `cpu_count` | CPU opponents | Single-Device CPU | `2` | `1–4` | Changes player count and competition | Yes | Required |
| `cpu_policy` | CPU style | CPU seats | `balanced-v1` | Tested policy IDs | **Yes** | Yes | One fixed policy |
| `cpu_delay_ms` | CPU action delay | Interactive CPU games | `650 ms` proposed | `0`, `250`, `650`, `1000`, `1500 ms` proposed | None | No | Required advanced option |
| `starting_seat` | Starting participant | Normal games | Seeded random | Random; fixed-seat diagnostic only | **Yes** | Yes | Random required |
| `random_seed` | Game seed | Normal games | Securely generated/stored | Valid implementation-defined seed | Changes outcomes, not rules | Yes | Hidden diagnostic |
| `sound_enabled` | Sound | Interactive modes | Off until sound exists | On/off | None | No | Deferred |
| `reduced_motion` | Reduced motion | Interactive modes | Follow system | System/on/off | None | No | Required behavior; override optional |
| `confirm_avoidable_strike` | Confirm risky pass | Human play | On | On/off | None; confirmation only | No | Required; disabling may be deferred |

### 10.1 CPU count

Changing CPU count changes total participants and therefore how frequently each participant becomes current player. It is a balance-relevant setup option, even though the core rules do not change. The chosen count is locked and saved with the game.

### 10.2 CPU action delay

Delay affects presentation only. The CPU decision must be computed from the same authoritative state regardless of delay. Refreshing during a delay must neither reroll nor apply the pending action twice. Reduced-motion preference may shorten or eliminate decorative delay while preserving understandable feedback.

### 10.3 Starting participant

Normal games select the starting participant using stored deterministic random state. A fixed starting seat may exist in diagnostic or experimental interfaces but should not appear as a normal alpha option because it can advantage a preferred seat over repeated games.

### 10.4 Random seed

Normal setup generates the seed automatically. The seed is visible in diagnostics and included in saved state. Manual seed entry belongs to advanced testing or Experiment Lab, not the primary setup flow.

## 11. Future lobby options

| Option | Default | Editable by | Locks | Notes |
|---|---|---|---|---|
| Room name | Optional/blank | Host | At start or remains descriptive | Must not be an identity key |
| Participant roster | Host plus joiners | Host before start | At start | Uses stable profile IDs |
| Seat order | Join/order sequence | Host before start | At start | Snapshotted into game |
| CPU seats | None unless host adds them | Host before start | At start | One authority advances CPUs |
| Room visibility | Code-only | Host | At room creation | Public directory is deferred |
| Rejoin enabled | On | Fixed product behavior | At start | Seat claim is refresh-safe |
| Pause | Off/not paused | Authorized human/host per future policy | State change during play | Exact authority defined in later spec |

Turn timers, spectators, midgame substitution, host kicks, public matchmaking, and automatic disconnected-player conversion to CPU are not approved normal options.

## 12. Deferred rules variants

The following ideas may be evaluated only in Experiment Lab until separately approved. They must never alter a normal game merely through UI preferences.

| Variant | Why it materially changes balance |
|---|---|
| Different trail sequences or directions | Changes value availability and progression risk |
| Different close-mark requirement | Changes closure timing and achievable scores |
| Different strike count or deduction | Changes risk tolerance and game duration |
| Different number of closures needed to end | Changes game length and closure strategy |
| Mandatory scoring when legal | Removes intentional passing decisions |
| Sequential rather than batch table choices | Can create seat-order advantage during closure |
| Continue kick phase after a shared end trigger | Changes the final active participant's opportunity |
| Alternate seal scoring | Changes the value of closing a trail |
| Fixed versus random starting seat | Can bias repeated comparisons |

Each tested variant requires a stable variant ID, full parameter snapshot, base rules version, decision-log entry, and tests. Promotion into normal play requires product-owner approval and a rules-version review.

## 13. Option locking and mutation rules

### 13.1 Locked at game creation

- mode;
- rules and engine versions;
- participant roster, permanent/local IDs, roles, and seat order;
- CPU policy version for each CPU seat;
- random seed and initial random state;
- all rules-affecting settings; and
- persistence/synchronization authority.

### 13.2 Changeable during a game

- CPU visual delay;
- sound and volume when implemented;
- reduced-motion override;
- accordion expansion and compact/full sheet views;
- help visibility; and
- other accessibility/presentation preferences that do not alter actions or timing rules.

Changes to these preferences must not append a gameplay command or alter deterministic results.

### 13.3 Requires confirmation

- replacing an unfinished game;
- abandoning or deleting an active game;
- leaving an online room when the seat remains claimed;
- clearing local recovery data;
- starting a long simulation; and
- saving or deleting experiment results.

## 14. Persistence and statistics by mode

| Record type | Single-Device CPU Alpha | Pass the Phone | Separate Phones | Simulation/Experiment |
|---|---|---|---|---|
| Active state | Local, automatic | Local, automatic | Firestore plus local session/rejoin data | In memory; optional checkpoint |
| Refresh recovery | Required | Required | Required through listener/reclaim | Optional except saved failure replay |
| Completed record | Local inspectable state | Future local/shared policy | Idempotent shared history | Aggregate only by explicit save |
| Family statistics | Not required | Deferred | Planned | Never |
| Seed and versions | Required | Required | Required | Required |
| Per-turn trace | Minimum needed for safety/inspection | Same | Versioned commands as needed | Failures or explicit diagnostics only |

Normal games, simulations, and experiments require distinct record types or an unambiguous record-kind field. Queries for family results must exclude non-normal records by construction.

## 15. Default configuration for the first playable build

```text
mode: single_device_cpu
participants: 1 human + 2 CPUs
rulesVersion: 1.0-alpha
cpuPolicy: balanced-v1
cpuDelayMs: 650 (proposed presentation default)
startingSeat: seeded random
seed: generated and persisted
confirmAvoidableStrike: true
reducedMotion: follow system preference
persistence: local automatic save
deployment: GitHub Pages test build
```

If implementation testing shows that 650 ms makes full CPU sequences feel slow, the presentation default may be adjusted without a rules-version change. The chosen value should be recorded in the decision log and tested on an Android phone.

## 16. Acceptance criteria

This document is satisfied when:

1. Every approved or proposed mode has a unique ID, purpose, participant/device model, authority model, and persistence policy.
2. The Single-Device CPU Alpha is clearly the first required playable mode.
3. The default setup is one human versus two deterministic CPUs on one device.
4. Pass-the-phone shared decisions preserve the approved atomic Phase B semantics.
5. Separate-phone play defines rooms, permanent profile IDs, authentication, seat reclaim, synchronization, and idempotent actions without changing core rules.
6. Simulation and Experiment Lab are isolated from normal history and family statistics.
7. Every visible alpha option has a default, allowed range, balance classification, and lock policy.
8. Rules variants are absent from normal alpha setup and require versioned experimental configuration plus approval.
9. Presentation settings cannot affect authoritative outcomes.
10. All settings that determine a result are snapshotted into the game or experiment record.
11. The definitions are consistent with `GAME_RULES.md` and `PRODUCT_REQUIREMENTS.md`.
12. Product-owner approval is recorded in the document metadata before it is treated as an implementation baseline.

## 17. Deferred decisions

These choices do not block the Single-Device CPU Alpha:

- final names and heuristics for multiple CPU difficulty policies;
- the exact pass-the-phone handoff interaction;
- online host authority for pause, abandon, and participant removal;
- room expiration and archival duration;
- whether completed single-device games later migrate into family statistics;
- simulation phone/desktop run limits;
- aggregate chart set and export format;
- sound, haptics, and volume controls; and
- which successful experiments, if any, become supported normal variants.

Each deferred choice belongs in `DECISIONS.md` when resolved and must update this document if it changes a mode or option contract.

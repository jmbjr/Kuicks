# Kuicks User Guide

Status: **Draft for review**  
Document version: **0.1-draft**  
Last updated: **2026-08-10**

This guide explains how players will use Kuicks. It describes the approved **Single-Device CPU Alpha** first and labels later modes clearly so planned features are not mistaken for available features.

## 1. Alpha at a glance

The first playable Kuicks release is designed for:

- one human player;
- one to four computer opponents, with two CPUs as the default;
- one Android phone or another modern browser;
- play from the published GitHub Pages site;
- saved progress on that browser and device;
- no account, room code, or Firebase connection.

Kuicks is a turn-based dice-and-score-sheet game. Every participant uses the same roll, but each maintains an individual sheet of four trails. The aim is to score the most points by making useful marks while avoiding strikes.

## 2. Starting a game

1. Open the published Kuicks GitHub Pages URL in a supported browser.
2. Choose **New Game**.
3. Enter or select the human player's display name.
4. Choose from one to four CPU opponents. The default is two.
5. Review the game summary.
6. Choose **Start Game**.

Alpha games use the approved rules and settings. Rule-changing variants are not exposed unless a later issue explicitly adds them.

Starting a new game while another game is unfinished must require confirmation. The app must not silently discard a saved game.

## 3. The play screen

The phone layout presents the most important information first:

1. current player and turn stage;
2. the six rolled dice;
3. the available Table or Kick action;
4. the human player's four scoring trails;
5. strikes and current score;
6. expandable CPU sheets, rules help, and game details.

The four trails use names, icons, direction indicators, and patterns as well as color. Color is never the only way to understand a trail.

Controls and cells indicate whether an action is:

- legal now;
- unavailable in this stage;
- already marked;
- passed;
- locked by progression;
- the closing value;
- sealed because its trail has closed.

## 4. Dice and trails

Each roll uses six dice:

- two neutral shared dice;
- one die for each of the four trail colors.

There are four scoring trails:

- two progress from lower values toward higher values;
- two progress from higher values toward lower values.

A new mark must be farther along a trail than that player's previous mark in the same trail. Skipped values remain unavailable to that player.

The interface previews the destination before a mark is confirmed. It must not allow an illegal mark.

## 5. Turn sequence

Each turn has two stages.

### 5.1 Table stage

Add the two neutral dice.

Every participant may independently:

- mark that total on a legal trail; or
- decline the Table action.

The human makes their own choice. CPUs resolve their choices through the approved deterministic CPU policy.

A player's choice does not consume the Table total for anyone else.

### 5.2 Kick stage

After all Table choices resolve, only the current player may:

- combine either neutral die with any one colored die;
- mark the resulting total on the matching colored trail; or
- decline the Kick action.

When the human is the current player, the interface presents only legal combinations and an explicit decline control. When a CPU is current, its choice appears after the configured action delay.

### 5.3 Strike check

The current player receives one strike if they finish the whole turn without making either a Table mark or a Kick mark.

A player who made at least one mark that turn receives no strike. Declining one stage is therefore safe if the player marks during the other stage.

After the strike check, play advances to the next participant unless an end condition has been reached.

## 6. Closing a trail

A player may use a trail's final value only after making at least five earlier marks in that trail.

When an eligible player marks the final value:

- that final value counts as a normal mark;
- the player also earns the trail's bonus seal;
- the trail closes globally;
- no participant may mark that trail again.

The interface asks for confirmation when a choice will close a trail and shows who closed it. If several valid Table choices close the same trail during the shared resolution, all choices accepted for that resolution remain valid under the approved rules.

## 7. Ending the game

The game ends when either:

- two trails have closed globally; or
- any participant receives a fourth strike.

If an end condition occurs during the shared Table resolution, that resolution completes consistently and no new Kick stage begins. The completed screen then shows the final scoring breakdown.

## 8. Scoring

Each trail scores according to its number of marks:

| Marks | Trail points |
|---:|---:|
| 0 | 0 |
| 1 | 1 |
| 2 | 3 |
| 3 | 6 |
| 4 | 10 |
| 5 | 15 |
| 6 | 21 |
| 7 | 28 |
| 8 | 36 |
| 9 | 45 |
| 10 | 55 |
| 11 | 66 |

Each bonus seal adds one additional scored mark for its trail. Each strike subtracts **5 points**.

Final score:

[
\text{trail points} - (5 \times \text{strikes})
]

The participant with the highest score wins. Equal highest scores are shared victories; Kuicks does not apply a hidden tie-breaker.

## 9. CPU opponents

CPU players obey exactly the same action and scoring rules as the human.

For Alpha v1:

- decisions are deterministic for a saved game state and random seed;
- action delays communicate what happened without changing decisions;
- CPU turns cannot be skipped accidentally by repeated taps;
- refreshing the page does not cause a CPU to take an action twice;
- CPU sheets and recent decisions can be expanded for inspection.

Difficulty levels and alternative strategies are deferred unless separately approved.

## 10. Saving and resuming

Kuicks saves an active Alpha game in the current browser's local storage.

On reopening the app:

- **Continue Game** restores the latest valid active game;
- the same roll, phase, current player, marks, strikes, and CPU state return;
- no die is rerolled merely because the page refreshed;
- no accepted action is applied twice.

Saved progress belongs to that browser profile and device. Clearing site data, using private browsing, or changing devices may remove or hide it. Cloud synchronization is not part of the Single-Device CPU Alpha.

If saved data is invalid or from an unsupported schema, Kuicks must explain the problem and offer a safe recovery path. It must not present corrupted state as a valid game.

## 11. Installing and updating

The published build is tested through an Android browser. When the browser supports it, the player may install Kuicks as a Progressive Web App from the browser menu.

After a new approved build is published:

1. reopen or refresh Kuicks while online;
2. allow the new assets to load;
3. close and reopen the installed app if an older cached version remains;
4. check the displayed build/version information when reporting a problem.

Every approved playable build increments its service-worker cache version. An update must not silently erase a compatible saved game.

## 12. Offline behavior

After the required assets have been cached, the Single-Device CPU game should remain playable without a network connection.

Offline Alpha limitations:

- a first visit still requires the site to load;
- GitHub Pages updates cannot arrive while offline;
- clearing browser storage removes cached assets and saved games;
- future separate-phone play will require network connectivity.

The interface should show offline status without blocking a valid single-device game.

## 13. Accessibility and phone use

Kuicks targets a minimum CSS viewport width of 320 px.

Players must be able to:

- use all essential actions with touch or keyboard;
- identify trails without relying on color;
- see clear focus, selected, legal, and disabled states;
- enlarge text without losing essential actions;
- read status changes and validation messages;
- avoid accidental double actions;
- understand CPU activity without relying only on animation.

Motion should be restrained and respect reduced-motion preferences.

## 14. Completing or abandoning a game

The completed screen shows:

- winner or shared winners;
- each participant's total;
- points by trail;
- seals;
- strike deductions;
- relevant game and seed information for troubleshooting.

Starting another game returns to setup.

Leaving an unfinished game keeps it available to continue. A deliberate **Abandon Game** action must explain that the active save will be replaced or removed and require confirmation.

Alpha completion does not write permanent family statistics or online history.

## 15. Troubleshooting

### The page shows an older build

Refresh while online. If installed as a PWA, close it completely and reopen it. Check the displayed build version before reporting the problem.

### Continue Game is missing

Confirm that the same browser profile and device are being used. Private mode, cleared site data, browser cleanup, or a different device may not contain the save.

### A button is disabled

Check the current stage, selected dice, and trail progression. The interface allows only legal actions for the current participant and stage.

### The app looks too wide or controls overlap

Record the phone model, browser, orientation, display/font scaling, and a screenshot. Alpha acceptance requires the primary game flow to work at 320 CSS pixels without horizontal page scrolling.

### The game changed after refresh

Record the visible build version, game ID, seed, participant, phase, and what changed. Refresh is required to restore the exact accepted state.

### A CPU acted twice or the game skipped a stage

Stop testing that game and record the game ID, seed, before/after phase, and recent action history. Duplicate execution is a correctness defect.

## 16. Future modes

The following modes are planned but are **not part of the first playable Alpha**.

### Pass the phone

Several humans share one device, with a handoff screen between turns where needed.

### Separate phones

Humans join a synchronized room by code, use family profiles, and reclaim their seats after refresh or disconnection.

### Simulation and Experiment Lab

Seeded, high-speed games compare CPU policies and balance without writing ordinary family statistics.

Their approved product behavior is defined in `GAME_MODES_AND_OPTIONS.md`. Availability must be shown honestly in the interface; planned modes must not appear usable before implementation.

## 17. Reporting a phone-test result

For each staged build, record:

- issue number and build/commit;
- phone model and Android version;
- browser and version;
- installed PWA or browser tab;
- portrait or landscape;
- viewport/display scaling when relevant;
- steps performed;
- expected and actual result;
- screenshot or screen recording when useful;
- game ID and seed for gameplay defects.

The implementation issue remains open while phone testing is underway and closes only after explicit approval.

## 18. Alpha guide acceptance criteria

This guide is ready as the Alpha v1 user baseline when:

1. Its terminology matches the approved rules and UX documents.
2. A new player can understand Table, Kick, trail progression, closures, strikes, scoring, and end conditions.
3. Single-device storage is not confused with local-only deployment.
4. GitHub Pages and Android-browser testing are explicit.
5. CPU, refresh, offline, accessibility, and update expectations are clear.
6. Future modes are visibly distinguished from Alpha features.
7. Troubleshooting reports capture reproducible game and device information.

## 19. Approval gate

This document is a **draft for review**. After explicit approval, update its status to **Approved alpha baseline**, set its version to **1.0-alpha**, and commit the approval checkpoint before implementation relies on it.

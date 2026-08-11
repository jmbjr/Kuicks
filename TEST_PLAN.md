# Kuicks Test Plan

Status: **Draft for review**  
Document version: **0.2-draft**  
Last updated: **2026-08-11**

This plan defines the minimum practical testing needed while building the first Kuicks playable alpha: one human versus two CPU players, published through GitHub Pages and tested on an Android phone.

The goal before alpha is fast feedback and basic confidence—not exhaustive verification. Deeper automation and hardening begin after the complete game loop exists.

## 1. Pre-alpha testing philosophy

During initial implementation:

- test the behavior introduced by the current issue;
- keep pure rule calculations easy to test;
- run a quick desktop smoke test before publishing;
- publish useful checkpoints to GitHub Pages;
- test the main flow on the primary Android phone;
- record bugs and continue iterating;
- do not block progress on a comprehensive test suite.

A test is valuable when it catches likely mistakes or makes the next change safer. Testing infrastructure must remain smaller than the feature it protects.

## 2. Minimum checks while building

### 2.1 Syntax and startup

Before publishing a build:

- the project loads without fatal console errors;
- referenced files and modules resolve;
- the current screen renders in desktop Chrome or Chromium;
- existing implemented actions still respond.

### 2.2 Rules engine

As each rule is implemented, add a small focused automated test when practical. Before the first complete playable build, cover at least:

- rising and falling trail progression;
- rejection of an illegal mark;
- trail closure eligibility and seal scoring;
- strikes and the fourth-strike end condition;
- the two-closed-trails end condition;
- final score calculation;
- CPUs selecting only legal actions.

These tests may use fixed dice and hand-authored game states. A large fixture system, randomized simulation harness, and exhaustive boundary matrix are deferred.

### 2.3 Playable-flow smoke test

Once the full loop exists, verify that:

1. A game starts with one human and two CPUs.
2. Dice roll and the Table choice can be accepted or skipped.
3. The active human can make or skip a Kick choice.
4. CPU turns finish without getting stuck.
5. Trails advance and close.
6. Strikes are assigned.
7. The game ends and displays final scores and a winner.
8. A new game can start.

One complete successful game is enough for the first alpha checkpoint. Bugs found during play become issues or follow-up work.

### 2.4 Android phone check

For each meaningful playable checkpoint:

- deploy the build through GitHub Pages;
- open the published URL in Android Chrome;
- confirm the main controls are readable and tappable in portrait;
- complete the newly implemented flow;
- note clipping, unwanted horizontal scrolling, confusing states, or touch problems.

The primary test target is the user's actual Android phone. Broad device and browser coverage is deferred.

## 3. Issue-level acceptance

Each implementation issue should contain only the testing relevant to that issue:

- a short expected-behavior checklist;
- important edge cases known at the time;
- any focused automated checks worth adding;
- a short Android test procedure once the behavior is deployable.

The issue remains open while the published build is being tested and closes after explicit approval.

## 4. What blocks the first playable alpha

A build is not ready for the first alpha playtest if it:

- cannot start or finish the main one-human-versus-two-CPU game;
- permits an obvious illegal mark;
- calculates closure, strikes, scoring, or the winner incorrectly;
- leaves a CPU turn permanently stuck;
- loses essential controls off-screen or makes them unusable on the primary phone;
- crashes or becomes unrecoverable during an ordinary game.

Minor visual defects, incomplete polish, limited accessibility, and missing recovery behavior may remain if they are visible and recorded.

## 5. Deferred hardening

After a complete alpha is playable, expand the test plan based on the failures actually observed. Later hardening may include:

- exhaustive rule-boundary and command-sequence tests;
- deterministic replay verification;
- duplicate-command and repeated-tap protection;
- refresh during every phase and pending CPU action;
- save-schema validation and migration fixtures;
- corrupt-save recovery;
- large seeded CPU simulation batches;
- keyboard, screen-reader, contrast, zoom, and reduced-motion passes;
- PWA installation, offline continuation, and cache-update testing;
- multiple Android devices, viewport sizes, and browsers;
- automated deployment and regression checks;
- detailed diagnostic capture using game IDs, seeds, revisions, and build versions.

These remain architectural goals, but they are not prerequisites for building or publishing the first playable alpha.

## 6. First alpha checkpoint

The first playable alpha is ready for user testing when:

1. Focused tests cover the implemented core rules.
2. A desktop smoke test passes.
3. One human-versus-two-CPU game can finish.
4. The build is published through GitHub Pages.
5. The main game flow is usable in portrait on the primary Android phone.
6. Known problems and deferred hardening items are recorded.
7. The issue remains open until the user tests and approves the build.

## 7. Approval gate

This document is a **draft for review**. After explicit approval, update its status to **Approved alpha baseline**, set its version to **1.0-alpha**, and commit the approval checkpoint.

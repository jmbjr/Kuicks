# Kuicks Iteration Workflow

Status: **Approved alpha baseline**  
Document version: **1.0-alpha**  
Last updated: **2026-08-11**

This workflow defines how Kuicks moves from an issue to a tested GitHub Pages build. It intentionally favors small playable increments and direct Android feedback over process overhead.

## 1. Core loop

For each implementation issue:

1. Confirm the issue's narrow goal and acceptance checklist.
2. Implement only that slice.
3. Run the focused checks relevant to the change.
4. Publish the checkpoint to GitHub Pages when it is useful to test.
5. Test the published build in Android Chrome.
6. Record bugs or requested changes on the issue.
7. Iterate on the same issue.
8. Close the issue only after explicit user approval.

Documentation issues use the same pattern: draft, review, revise, approve, and record the approved baseline on `main`.

## 2. Issue scope

An implementation issue should normally produce one visible or independently testable capability. Each issue should state:

- the player-facing goal;
- required behavior;
- important edge cases already known;
- dependencies;
- a short completion checklist;
- focused automated checks, if useful;
- an Android test procedure once deployable.

Do not expand an issue merely because adjacent improvements are convenient. Record worthwhile follow-up work separately.

## 3. Implementation order

Build the Single-Device CPU Alpha in dependency order:

1. Minimal GitHub Pages and PWA shell.
2. Pure deterministic rules engine.
3. Deterministic CPU decision policies.
4. Human and CPU game setup.
5. Mobile score sheet and dice interface.
6. Complete human-versus-CPU turn orchestration.
7. Save and resume.
8. Focused usability, accessibility, offline, and PWA refinement.

The first meaningful target is one human completing a game against two CPUs on one Android phone.

## 4. Checkpoint publishing

A checkpoint is worth publishing when it enables useful phone feedback. It does not need to be a polished release.

Before publishing:

- the app starts without a fatal error;
- the implemented flow works in a desktop smoke test;
- relevant focused tests pass;
- unfinished controls are hidden, disabled, or clearly labeled;
- the build/version identifier changes when needed to avoid stale-cache confusion.

Publish through GitHub Pages and test the public URL. Installing the PWA is optional until installation or offline behavior is the feature under test.

## 5. Android feedback

For each phone-testable issue:

1. Open the current GitHub Pages URL in Android Chrome.
2. Refresh or clear the installed app/cache if the displayed build is stale.
3. Follow the issue's short test procedure.
4. Report what happened, including screenshots when layout is the problem.
5. Keep the issue open while changes are still being evaluated.
6. Close only after the user explicitly accepts the result.

A bug that blocks the current issue stays in that issue. A separate concern that does not block acceptance becomes a new issue.

## 6. Approval and repository history

- Draft specifications may be placed on `main` so they have durable review links.
- Drafts must be clearly labeled **Draft for review**.
- Explicit approval changes the status to **Approved alpha baseline** and the version to **1.0-alpha**.
- Approved decisions are committed promptly.
- Later changes to an approved baseline must preserve the reason in commit history and, when material, in the decision log.
- Gameplay implementation does not begin until its governing rule and requirement baselines are approved.

## 7. Working agreements

- Keep dependencies low and the deployment path simple.
- Prefer understandable browser-native code for the alpha.
- Separate rules, state transitions, CPU policy, persistence, and rendering.
- Preserve deterministic seeds and state where the approved architecture requires them.
- Avoid speculative infrastructure before a playable need exists.
- Update relevant documentation when implementation proves an assumption wrong.
- Never overwrite unrelated Firebase security rules when online work begins.

## 8. Definition of done for an implementation issue

An issue is done when:

- its required behavior is implemented;
- focused checks pass;
- the published build is usable for the intended Android test;
- known non-blocking defects are recorded;
- relevant documentation is updated;
- the user explicitly approves the result.

A passing desktop check alone does not close a phone-facing issue.

## 9. Exceptions

Emergency fixes and tiny documentation corrections may use a shortened loop, but must still be scoped, verified, and recorded. If a workflow step adds no useful confidence for the current change, keep it lightweight and explain the exception in the issue or commit.

## 10. Approval record

Approved as the Kuicks Alpha v1 iteration workflow on **2026-08-11**.

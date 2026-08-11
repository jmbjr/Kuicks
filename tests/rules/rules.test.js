import test from "node:test";
import assert from "node:assert/strict";
import { createGame, PHASES } from "../../js/rules/model.js";
import { getKickCandidates, getTableCandidates } from "../../js/rules/legal-actions.js";
import { getWinners, scoreSheet, trailPoints } from "../../js/rules/scoring.js";
import { finishTurn, resolveTableChoices, rollTurn, submitKickChoice, submitTableChoice, validateState } from "../../js/rules/transition.js";

const players = [{ id: "a", name: "A" }, { id: "b", name: "B" }];
const game = () => createGame({ gameId: "test", startingSeat: 0 }, players, 123);

function tablePhase(state, roll = { table: [6, 6], trails: { sun: 1, spark: 1, wave: 1, leaf: 1 } }) {
  return rollTurn(state, `roll-${state.revision}`, roll).state;
}

function passTable(state) {
  for (const participant of state.participants) state = submitTableChoice(state, participant.id, null, `pass-${participant.id}-${state.revision}`).state;
  return resolveTableChoices(state, `resolve-${state.revision}`).state;
}

test("rising and falling progression is based on trail index", () => {
  let state = tablePhase(game(), { table: [4, 4], trails: { sun: 1, spark: 1, wave: 1, leaf: 1 } });
  assert.deepEqual(getTableCandidates(state, "a").map((choice) => choice.trailId), ["sun", "spark", "wave", "leaf"]);
  state.participants[0].sheet.trails.sun.markedIndices = [6];
  state.participants[0].sheet.trails.wave.markedIndices = [6];
  assert.deepEqual(getTableCandidates(state, "a").map((choice) => choice.trailId), ["spark", "leaf"]);
});

test("illegal marks are rejected without changing state", () => {
  const state = tablePhase(game());
  const result = submitTableChoice(state, "a", { trailId: "sun", index: 2 }, "bad");
  assert.equal(result.accepted, false);
  assert.equal(result.reason, "ILLEGAL_TABLE_CHOICE");
  assert.strictEqual(result.state, state);
});

test("close requires five prior marks and awards a seal", () => {
  let state = game();
  state.participants[0].sheet.trails.sun.markedIndices = [0, 1, 2, 3, 4];
  state = tablePhase(state);
  const close = getTableCandidates(state, "a").find((choice) => choice.trailId === "sun");
  state = submitTableChoice(state, "a", close, "close-a").state;
  state = submitTableChoice(state, "b", null, "pass-b").state;
  state = resolveTableChoices(state, "resolve").state;
  assert.equal(state.participants[0].sheet.trails.sun.seal, true);
  assert.deepEqual(state.participants[0].sheet.trails.sun.markedIndices, [0, 1, 2, 3, 4, 10]);
  assert.deepEqual(state.closedTrails.sun.closedBy, ["a"]);
  assert.equal(scoreSheet(state.participants[0].sheet).trails.sun.points, 28);
});

test("simultaneous Table closures award both seals", () => {
  let state = game();
  for (const participant of state.participants) participant.sheet.trails.sun.markedIndices = [0, 1, 2, 3, 4];
  state = tablePhase(state);
  for (const participant of state.participants) {
    const close = getTableCandidates(state, participant.id).find((choice) => choice.trailId === "sun");
    state = submitTableChoice(state, participant.id, close, `close-${participant.id}`).state;
  }
  state = resolveTableChoices(state, "resolve-both").state;
  assert.equal(state.participants.every((participant) => participant.sheet.trails.sun.seal), true);
  assert.deepEqual(state.closedTrails.sun.closedBy, ["a", "b"]);
});

test("a current player who marks neither phase receives one strike", () => {
  let state = passTable(tablePhase(game(), { table: [1, 1], trails: { sun: 1, spark: 1, wave: 1, leaf: 1 } }));
  assert.equal(state.phase, PHASES.KICK_CHOICE);
  state = submitKickChoice(state, null, "kick-pass").state;
  state = finishTurn(state, "finish").state;
  assert.equal(state.participants[0].sheet.strikes, 1);
  assert.equal(state.currentSeat, 1);
});

test("fourth strike ends the game", () => {
  let state = game();
  state.participants[0].sheet.strikes = 3;
  state = passTable(tablePhase(state, { table: [1, 1], trails: { sun: 1, spark: 1, wave: 1, leaf: 1 } }));
  state = submitKickChoice(state, null, "kick-pass").state;
  state = finishTurn(state, "finish").state;
  assert.equal(state.phase, PHASES.COMPLETED);
  assert.equal(state.participants[0].sheet.strikes, 4);
  assert.equal(state.result.cause, "fourStrikes");
});

test("second closed trail ends after Table batch without Kick", () => {
  let state = game();
  state.closedTrails.spark = { trailId: "spark", closedBy: ["b"] };
  state.participants[0].sheet.trails.sun.markedIndices = [0, 1, 2, 3, 4];
  state = tablePhase(state);
  state = submitTableChoice(state, "a", getTableCandidates(state, "a").find((choice) => choice.trailId === "sun"), "close").state;
  state = submitTableChoice(state, "b", null, "pass").state;
  state = resolveTableChoices(state, "resolve").state;
  assert.equal(state.phase, PHASES.COMPLETED);
  assert.equal(state.result.cause, "closedTrails");
});

test("Kick candidates retain distinct table dice", () => {
  let state = passTable(tablePhase(game(), { table: [2, 5], trails: { sun: 3, spark: 1, wave: 1, leaf: 1 } }));
  const sun = getKickCandidates(state).filter((choice) => choice.trailId === "sun");
  assert.deepEqual(sun.map((choice) => [choice.value, choice.tableDieIndex]), [[5, 0], [8, 1]]);
});

test("scoring, ties, duplicate commands, and invariants", () => {
  let state = game();
  state.participants[0].sheet.trails.sun.markedIndices = [0, 2, 4];
  state.participants[0].sheet.strikes = 2;
  assert.equal(trailPoints(3), 6);
  assert.equal(scoreSheet(state.participants[0].sheet).total, -4);
  assert.deepEqual(getWinners(game()), ["a", "b"]);
  const rolled = rollTurn(state, "same", { table: [1, 1], trails: { sun: 1, spark: 1, wave: 1, leaf: 1 } });
  const duplicate = rollTurn(rolled.state, "same");
  assert.equal(duplicate.duplicate, true);
  assert.strictEqual(duplicate.state, rolled.state);
  assert.equal(validateState(state).valid, true);
});

test("a complete game can be driven through code", () => {
  let state = game();
  let command = 0;
  while (state.phase !== PHASES.COMPLETED && state.turn < 100) {
    state = rollTurn(state, `auto-${command++}`).state;
    for (const participant of state.participants) {
      const choice = getTableCandidates(state, participant.id)[0] || null;
      state = submitTableChoice(state, participant.id, choice, `auto-${command++}`).state;
    }
    state = resolveTableChoices(state, `auto-${command++}`).state;
    if (state.phase === PHASES.COMPLETED) break;
    state = submitKickChoice(state, getKickCandidates(state)[0] || null, `auto-${command++}`).state;
    if (state.phase === PHASES.COMPLETED) break;
    state = finishTurn(state, `auto-${command++}`).state;
  }
  assert.equal(state.phase, PHASES.COMPLETED);
  assert.ok(state.result.winners.length >= 1);
  assert.equal(validateState(state).valid, true);
});

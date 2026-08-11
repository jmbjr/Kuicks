import test from "node:test";
import assert from "node:assert/strict";
import { chooseCpuAction, CPU_POLICY_VERSION } from "../../js/cpu/choose-action.js";
import { runCpuGame } from "../../js/cpu/run-game.js";
import { createGame, PHASES } from "../../js/rules/model.js";
import { getTableCandidates } from "../../js/rules/legal-actions.js";
import { rollTurn } from "../../js/rules/transition.js";

function tableFixture(table = [4, 4]) {
  let state = createGame({ startingSeat: 0 }, [{ id: "a", type: "cpu" }, { id: "b", type: "cpu" }], 9);
  state = rollTurn(state, "roll", { table, trails: { sun: 1, spark: 1, wave: 1, leaf: 1 } }).state;
  return state;
}

test("CPU selects one of the supplied legal candidates", () => {
  const state = tableFixture();
  const candidates = getTableCandidates(state, "a");
  const decision = chooseCpuAction(state, "a", candidates);
  assert.ok(candidates.includes(decision.action));
  assert.equal(decision.policyVersion, CPU_POLICY_VERSION);
});

test("CPU passes explicitly when no legal candidate exists", () => {
  const decision = chooseCpuAction(tableFixture(), "a", []);
  assert.equal(decision.action, null);
  assert.match(decision.reason, /pass/i);
});

test("CPU prefers a closure and explains it", () => {
  const state = tableFixture([6, 6]);
  state.participants[0].sheet.trails.sun.markedIndices = [0, 1, 2, 3, 4];
  const decision = chooseCpuAction(state, "a", getTableCandidates(state, "a"));
  assert.equal(decision.action.trailId, "sun");
  assert.equal(decision.action.closesTrail, true);
  assert.match(decision.reason, /close/i);
});

test("identical seeds replay identical CPU games", () => {
  assert.deepEqual(runCpuGame(42), runCpuGame(42));
});

test("three CPUs complete a valid game without getting stuck", () => {
  const run = runCpuGame(314159, 3);
  assert.equal(run.state.phase, PHASES.COMPLETED);
  assert.ok(run.state.result.winners.length >= 1);
  assert.ok(run.decisions.some((decision) => decision.action === null));
});

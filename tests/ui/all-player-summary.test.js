import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../../js/rules/model.js";
import { activeFirstParticipants, createSummaryModel, SUMMARY_LAYOUTS } from "../../js/ui/all-player-summary.js";

const participants = [
  { id: "p1", name: "P1" }, { id: "p2", name: "P2" }, { id: "p3", name: "P3" }, { id: "p4", name: "P4" },
];

test("player layout includes every player in seat order", () => {
  const state = createGame({ startingSeat: 2 }, participants, 1);
  const model = createSummaryModel(state, SUMMARY_LAYOUTS.PLAYERS);
  assert.deepEqual(model.participants.map(({ id }) => id), ["p1", "p2", "p3", "p4"]);
  assert.equal(model.participants.find(({ id }) => id === "p3").active, true);
});

test("interleaved layout groups trails and rotates the active player first", () => {
  const state = createGame({ startingSeat: 2 }, participants, 1);
  assert.deepEqual(activeFirstParticipants(state).map(({ id }) => id), ["p3", "p4", "p1", "p2"]);
  const model = createSummaryModel(state, SUMMARY_LAYOUTS.TRAILS);
  assert.deepEqual(model.trails.map(({ trailId }) => trailId), ["sun", "spark", "wave", "leaf"]);
  for (const trail of model.trails) assert.deepEqual(trail.participants.map(({ id }) => id), ["p3", "p4", "p1", "p2"]);
});

test("switching summary layouts does not mutate gameplay state", () => {
  const state = createGame({ startingSeat: 1 }, participants, 1);
  const before = structuredClone(state);
  createSummaryModel(state, SUMMARY_LAYOUTS.PLAYERS);
  createSummaryModel(state, SUMMARY_LAYOUTS.TRAILS);
  assert.deepEqual(state, before);
});

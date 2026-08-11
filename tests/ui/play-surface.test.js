import test from "node:test";
import assert from "node:assert/strict";
import { createPlaySurfaceDemo, chooseTable, chooseKick } from "../../js/ui/play-surface.js";

test("setup accepts one to four CPUs and preserves the human name", () => {
  for (let count = 1; count <= 4; count += 1) {
    const demo = createPlaySurfaceDemo("Ada", count, 10 + count);
    assert.equal(demo.state.participants.length, count + 1);
    assert.equal(demo.state.participants[0].name, "Ada");
    assert.equal(demo.phase, "table");
  }
});

test("human Table and Kick choices continue into the next turn", () => {
  let demo = createPlaySurfaceDemo("Ada", 2, 20260811);
  const tableChoice = demo.tableCandidates[0] ?? null;
  demo = chooseTable(demo, tableChoice);
  assert.equal(demo.phase, "kick");
  assert.equal(Object.keys(demo.state.tableSubmissions).length, 3);
  const kickChoice = demo.kickCandidates[0] ?? null;
  demo = chooseKick(demo, kickChoice);
  assert.equal(demo.phase, "table");
  assert.equal(demo.state.phase, "tableChoices");
  assert.equal(demo.state.turn, 2);
  assert.ok(demo.log.some((entry) => entry.startsWith("CPU 1")));
});

test("play surface reaches a scored result and can be recreated", () => {
  let demo = createPlaySurfaceDemo("Ada", 2, 99);
  let decisions = 0;
  while (demo.phase !== "completed" && decisions < 500) {
    const candidates = demo.phase === "table" ? demo.tableCandidates : demo.kickCandidates;
    demo = demo.phase === "table" ? chooseTable(demo, candidates.at(-1) ?? null) : chooseKick(demo, candidates.at(-1) ?? null);
    decisions += 1;
  }
  assert.equal(demo.phase, "completed");
  assert.equal(demo.state.result.scores.length, 3);
  assert.ok(demo.state.result.winners.length >= 1);
  assert.equal(createPlaySurfaceDemo("Ada", 2, 100).state.turn, 1);
});

test("setup rejects invalid player and CPU counts", () => {
  assert.throws(() => createPlaySurfaceDemo(" ", 2));
  assert.throws(() => createPlaySurfaceDemo("Ada", 0));
  assert.throws(() => createPlaySurfaceDemo("Ada", 5));
});

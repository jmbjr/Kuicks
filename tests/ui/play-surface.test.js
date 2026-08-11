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

test("human Table and Kick choices drive the real engine", () => {
  let demo = createPlaySurfaceDemo("Ada", 2, 20260811);
  const tableChoice = demo.tableCandidates[0] ?? null;
  demo = chooseTable(demo, tableChoice);
  assert.equal(demo.phase, "kick");
  assert.equal(Object.keys(demo.state.tableSubmissions).length, 3);
  const kickChoice = demo.kickCandidates[0] ?? null;
  demo = chooseKick(demo, kickChoice);
  assert.equal(demo.phase, "complete");
  assert.equal(demo.state.phase, "turnEnd");
  assert.ok(demo.log.some((entry) => entry.startsWith("CPU 1")));
});

test("setup rejects invalid player and CPU counts", () => {
  assert.throws(() => createPlaySurfaceDemo(" ", 2));
  assert.throws(() => createPlaySurfaceDemo("Ada", 0));
  assert.throws(() => createPlaySurfaceDemo("Ada", 5));
});

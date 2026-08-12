import test from "node:test";
import assert from "node:assert/strict";
import { ACTIVE_GAME_SCHEMA_VERSION, ACTIVE_GAME_STORAGE_KEY, createActiveGameEnvelope, saveActiveGame } from "../../js/game/persistence.js";
import { chooseKick, chooseTable, createPlaySurfaceDemo } from "../../js/ui/play-surface.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

test("active-game envelope is versioned and contains a detached complete snapshot", () => {
  const demo = createPlaySurfaceDemo("Ada", 2, 20260811);
  const envelope = createActiveGameEnvelope(demo, "2026-08-12T00:00:00.000Z");
  assert.equal(envelope.schemaVersion, ACTIVE_GAME_SCHEMA_VERSION);
  assert.equal(envelope.gameId, demo.state.gameId);
  assert.equal(envelope.status, "active");
  assert.equal(envelope.savedAt, "2026-08-12T00:00:00.000Z");
  assert.deepEqual(envelope.game, demo);
  envelope.game.log.push("changed snapshot");
  assert.equal(demo.log.includes("changed snapshot"), false);
});

test("save replaces the active snapshot after representative Table and Kick transitions", () => {
  const storage = memoryStorage();
  let demo = createPlaySurfaceDemo("Ada", 2, 20260811);
  saveActiveGame(demo, storage, "2026-08-12T00:00:00.000Z");
  let stored = JSON.parse(storage.getItem(ACTIVE_GAME_STORAGE_KEY));
  assert.equal(stored.game.phase, "table");
  assert.equal(stored.game.state.turn, 1);

  demo = chooseTable(demo, demo.tableCandidates[0] ?? null);
  saveActiveGame(demo, storage, "2026-08-12T00:01:00.000Z");
  stored = JSON.parse(storage.getItem(ACTIVE_GAME_STORAGE_KEY));
  assert.equal(stored.game.phase, "kick");
  assert.deepEqual(stored.game.state, demo.state);

  demo = chooseKick(demo, demo.kickCandidates[0] ?? null);
  saveActiveGame(demo, storage, "2026-08-12T00:02:00.000Z");
  stored = JSON.parse(storage.getItem(ACTIVE_GAME_STORAGE_KEY));
  assert.equal(stored.game.phase, "table");
  assert.equal(stored.game.state.turn, 2);
  assert.deepEqual(stored.game, demo);
});

test("completed games remain stored until an explicit lifecycle action removes them", () => {
  const storage = memoryStorage();
  let demo = createPlaySurfaceDemo("Ada", 2, 99);
  for (let decisions = 0; demo.phase !== "completed" && decisions < 500; decisions += 1) {
    const candidates = demo.phase === "table" ? demo.tableCandidates : demo.kickCandidates;
    demo = demo.phase === "table" ? chooseTable(demo, candidates.at(-1) ?? null) : chooseKick(demo, candidates.at(-1) ?? null);
  }
  const envelope = saveActiveGame(demo, storage);
  assert.equal(envelope.status, "completed");
  assert.equal(JSON.parse(storage.getItem(ACTIVE_GAME_STORAGE_KEY)).game.phase, "completed");
});

test("persistence rejects incomplete games and incompatible storage objects", () => {
  assert.throws(() => createActiveGameEnvelope({ phase: "table" }), /complete play-surface game/);
  assert.throws(() => saveActiveGame(createPlaySurfaceDemo("Ada", 1), {}), /Web Storage-compatible/);
});

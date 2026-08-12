export const ACTIVE_GAME_STORAGE_KEY = "kuicks.active-game";
export const ACTIVE_GAME_SCHEMA_VERSION = 1;

function requireStorage(storage) {
  if (!storage || typeof storage.setItem !== "function" || typeof storage.getItem !== "function") {
    throw new TypeError("A Web Storage-compatible object is required.");
  }
  return storage;
}

function cloneSnapshot(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createActiveGameEnvelope(demo, savedAt = new Date().toISOString()) {
  if (!demo?.state || !demo?.phase) throw new TypeError("A complete play-surface game is required.");
  return {
    schemaVersion: ACTIVE_GAME_SCHEMA_VERSION,
    savedAt,
    gameId: demo.state.gameId,
    status: demo.phase === "completed" ? "completed" : "active",
    game: cloneSnapshot(demo),
  };
}

export function saveActiveGame(demo, storage = globalThis.localStorage, savedAt) {
  const envelope = createActiveGameEnvelope(demo, savedAt);
  requireStorage(storage).setItem(ACTIVE_GAME_STORAGE_KEY, JSON.stringify(envelope));
  return envelope;
}

export function loadActiveGame(storage = globalThis.localStorage) {
  requireStorage(storage);
  const stored = storage.getItem(ACTIVE_GAME_STORAGE_KEY);
  if (stored === null) return null;
  try {
    const envelope = JSON.parse(stored);
    if (envelope?.schemaVersion !== ACTIVE_GAME_SCHEMA_VERSION || envelope?.status !== "active" || !envelope?.game?.state || !envelope?.game?.phase) return null;
    return cloneSnapshot(envelope);
  } catch {
    return null;
  }
}

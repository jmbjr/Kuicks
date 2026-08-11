export const TRAIL_IDS = Object.freeze(["sun", "spark", "wave", "leaf"]);

export const TRAILS = Object.freeze({
  sun: Object.freeze({ id: "sun", values: Object.freeze([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) }),
  spark: Object.freeze({ id: "spark", values: Object.freeze([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) }),
  wave: Object.freeze({ id: "wave", values: Object.freeze([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]) }),
  leaf: Object.freeze({ id: "leaf", values: Object.freeze([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]) })
});

export const PHASES = Object.freeze({
  AWAITING_ROLL: "awaitingRoll",
  TABLE_CHOICES: "tableChoices",
  KICK_CHOICE: "kickChoice",
  TURN_END: "turnEnd",
  COMPLETED: "completed"
});

export const RULES = Object.freeze({
  minimumMarksBeforeClose: 5,
  strikeValue: -5,
  strikeEndCount: 4,
  closedTrailEndCount: 2
});

function blankSheet() {
  return {
    trails: Object.fromEntries(TRAIL_IDS.map((id) => [id, { markedIndices: [], seal: false }])),
    strikes: 0
  };
}

function normalizeParticipants(participants) {
  if (!Array.isArray(participants) || participants.length < 2 || participants.length > 5) {
    throw new RangeError("Kuicks requires 2–5 participants.");
  }
  const ids = new Set();
  return participants.map((participant, seat) => {
    if (!participant?.id || ids.has(participant.id)) throw new TypeError("Participant IDs must be unique and non-empty.");
    ids.add(participant.id);
    return { id: participant.id, name: participant.name || `Player ${seat + 1}`, type: participant.type || "human", seat, sheet: blankSheet() };
  });
}

export function createGame(settings, participants, seed = 1) {
  const normalized = normalizeParticipants(participants);
  const numericSeed = Number(seed) >>> 0;
  const startingSeat = settings?.startingSeat ?? numericSeed % normalized.length;
  if (!Number.isInteger(startingSeat) || startingSeat < 0 || startingSeat >= normalized.length) {
    throw new RangeError("startingSeat is outside the participant list.");
  }
  return {
    schemaVersion: 1,
    rulesVersion: "1.0-alpha",
    engineVersion: "0.1.0",
    gameId: settings?.gameId || `game-${numericSeed}`,
    settings: { mode: "singleDeviceCpu", ...settings, startingSeat },
    participants: normalized,
    currentSeat: startingSeat,
    turn: 1,
    phase: PHASES.AWAITING_ROLL,
    roll: null,
    closedTrails: {},
    tableSnapshot: null,
    tableSubmissions: {},
    kickMarkedThisTurn: false,
    random: { algorithm: "mulberry32", seed: numericSeed, state: numericSeed },
    acceptedCommandIds: [],
    revision: 0,
    result: null
  };
}

export function cloneState(state) {
  return structuredClone(state);
}

export function currentParticipant(state) {
  return state.participants[state.currentSeat];
}

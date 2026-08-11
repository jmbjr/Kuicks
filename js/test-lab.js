import { createGame, PHASES } from "./rules/model.js";
import { getKickCandidates, getTableCandidates } from "./rules/legal-actions.js";
import { getWinners, scoreSheet } from "./rules/scoring.js";
import {
  finishTurn,
  resolveTableChoices,
  rollTurn,
  submitKickChoice,
  submitTableChoice,
  validateState
} from "./rules/transition.js";

const participants = [{ id: "human", name: "You" }, { id: "cpu", name: "CPU" }];
const fixedRoll = { table: [6, 6], trails: { sun: 1, spark: 1, wave: 1, leaf: 1 } };

function newGame() {
  return createGame({ gameId: "browser-test", startingSeat: 0 }, participants, 123);
}

function check(name, run) {
  try {
    return { name, passed: true, detail: run() };
  } catch (error) {
    return { name, passed: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

function startTable(state, roll = fixedRoll) {
  const result = rollTurn(state, `roll-${state.revision}`, roll);
  expect(result.accepted, `Roll rejected: ${result.reason}`);
  return result.state;
}

function passTable(state, prefix) {
  for (const participant of state.participants) {
    state = submitTableChoice(state, participant.id, null, `${prefix}-pass-${participant.id}`).state;
  }
  return resolveTableChoices(state, `${prefix}-resolve`).state;
}

function legalMoveCheck() {
  const state = startTable(newGame(), { table: [4, 4], trails: { sun: 1, spark: 1, wave: 1, leaf: 1 } });
  expect(getTableCandidates(state, "human").length === 4, "Expected four legal trail choices for total 8.");
  const illegal = submitTableChoice(state, "human", { trailId: "sun", index: 2 }, "illegal");
  expect(!illegal.accepted && illegal.reason === "ILLEGAL_TABLE_CHOICE", "Illegal move was not safely rejected.");
  expect(illegal.state === state, "Rejected move changed game state.");
  return "Total 8 offered four legal trails; an out-of-order mark was rejected without changing state.";
}

function closureCheck() {
  let state = newGame();
  for (const participant of state.participants) participant.sheet.trails.sun.markedIndices = [0, 1, 2, 3, 4];
  state = startTable(state);
  for (const participant of state.participants) {
    const close = getTableCandidates(state, participant.id).find((choice) => choice.trailId === "sun");
    expect(close?.closesTrail, `No legal Sun closure for ${participant.name}.`);
    state = submitTableChoice(state, participant.id, close, `close-${participant.id}`).state;
  }
  state = resolveTableChoices(state, "resolve-closures").state;
  expect(state.participants.every((participant) => participant.sheet.trails.sun.seal), "Both players did not receive the seal.");
  expect(state.closedTrails.sun.closedBy.length === 2, "Closure record did not retain both players.");
  return "Two simultaneous Table choices closed Sun and awarded both players a seal.";
}

function strikeCheck() {
  let state = newGame();
  state.participants[0].sheet.strikes = 3;
  state = passTable(startTable(state, { table: [1, 1], trails: { sun: 1, spark: 1, wave: 1, leaf: 1 } }), "strike");
  state = submitKickChoice(state, null, "strike-kick-pass").state;
  state = finishTurn(state, "strike-finish").state;
  expect(state.phase === PHASES.COMPLETED, "Game did not end on the fourth strike.");
  expect(state.result?.cause === "fourStrikes", "Wrong game-ending cause recorded.");
  return "A player at three strikes passed both choices; strike four ended the game.";
}

function scoringCheck() {
  const state = newGame();
  state.participants[0].sheet.trails.sun.markedIndices = [0, 2, 4];
  state.participants[0].sheet.strikes = 2;
  expect(scoreSheet(state.participants[0].sheet).total === -4, "Expected 6 trail points minus 10 strike points.");
  expect(getWinners(newGame()).length === 2, "Equal scores were not recognized as a tie.");
  return "Three marks scored 6, two strikes scored −10, total −4; equal scores produced two winners.";
}

function completeGameCheck() {
  let state = newGame();
  let command = 0;
  while (state.phase !== PHASES.COMPLETED && state.turn < 100) {
    state = rollTurn(state, `auto-${command++}`).state;
    for (const participant of state.participants) {
      state = submitTableChoice(state, participant.id, getTableCandidates(state, participant.id)[0] || null, `auto-${command++}`).state;
    }
    state = resolveTableChoices(state, `auto-${command++}`).state;
    if (state.phase === PHASES.COMPLETED) break;
    state = submitKickChoice(state, getKickCandidates(state)[0] || null, `auto-${command++}`).state;
    if (state.phase === PHASES.COMPLETED) break;
    state = finishTurn(state, `auto-${command++}`).state;
  }
  expect(state.phase === PHASES.COMPLETED, "Automated game did not finish within 100 turns.");
  const validation = validateState(state);
  expect(validation.valid, validation.errors.join(" "));
  expect(state.result?.winners.length >= 1, "Completed game has no winner.");
  return `Seed 123 completed in ${state.turn} turns with valid state and ${state.result.winners.length} winner${state.result.winners.length === 1 ? "" : "s"}.`;
}

export function runEngineChecks() {
  return [
    check("Legal and illegal moves", legalMoveCheck),
    check("Simultaneous trail closure", closureCheck),
    check("Fourth-strike ending", strikeCheck),
    check("Scoring and ties", scoringCheck),
    check("Deterministic complete game", completeGameCheck)
  ];
}

import { PHASES, RULES, TRAIL_IDS, cloneState, currentParticipant } from "./model.js";
import { getKickCandidates, getTableCandidates, isCandidateMatch } from "./legal-actions.js";
import { getFinalResult } from "./scoring.js";
import { rollDie } from "../game/random.js";

function reject(state, reason) { return { accepted: false, reason, state, events: [] }; }

function accept(original, next, commandId, events = []) {
  next.acceptedCommandIds.push(commandId);
  next.revision = original.revision + 1;
  return { accepted: true, state: next, events };
}

function begin(state, commandId, phase) {
  if (!commandId) return { rejection: reject(state, "COMMAND_ID_REQUIRED") };
  if (state.acceptedCommandIds.includes(commandId)) return { duplicate: { accepted: true, duplicate: true, state, events: [] } };
  if (state.phase !== phase) return { rejection: reject(state, "WRONG_PHASE") };
  return {};
}

function completeIfNeeded(state, cause) {
  if (Object.keys(state.closedTrails).length >= RULES.closedTrailEndCount
      || state.participants.some((participant) => participant.sheet.strikes >= RULES.strikeEndCount)) {
    state.phase = PHASES.COMPLETED;
    state.result = { cause, ...getFinalResult(state) };
    return true;
  }
  return false;
}

function applyMark(state, participantId, choice, phase) {
  const participant = state.participants.find((item) => item.id === participantId);
  participant.sheet.trails[choice.trailId].markedIndices.push(choice.index);
  if (choice.closesTrail) {
    participant.sheet.trails[choice.trailId].seal = true;
    state.closedTrails[choice.trailId] ||= { trailId: choice.trailId, turn: state.turn, phase, closedBy: [] };
    state.closedTrails[choice.trailId].closedBy.push(participantId);
  }
}

export function rollTurn(state, commandId, fixedRoll = null) {
  const check = begin(state, commandId, PHASES.AWAITING_ROLL);
  if (check.rejection || check.duplicate) return check.rejection || check.duplicate;
  const next = cloneState(state);
  let random = next.random;
  const values = [];
  for (let i = 0; i < 2 + TRAIL_IDS.filter((id) => !next.closedTrails[id]).length; i += 1) {
    const rolled = rollDie(random); random = rolled.random; values.push(rolled.value);
  }
  const supplied = fixedRoll || { table: values.slice(0, 2), trails: Object.fromEntries(TRAIL_IDS.filter((id) => !next.closedTrails[id]).map((id, index) => [id, values[index + 2]])) };
  if (!validRoll(supplied, next)) return reject(state, "INVALID_ROLL");
  next.random = random;
  next.roll = cloneState(supplied);
  next.phase = PHASES.TABLE_CHOICES;
  next.tableSubmissions = {};
  next.kickMarkedThisTurn = false;
  next.tableSnapshot = { openTrails: TRAIL_IDS.filter((id) => !next.closedTrails[id]) };
  return accept(state, next, commandId, [{ type: "DICE_ROLLED", roll: next.roll }]);
}

function validRoll(roll, state) {
  const dice = [...(roll?.table || []), ...TRAIL_IDS.filter((id) => !state.closedTrails[id]).map((id) => roll?.trails?.[id])];
  return roll?.table?.length === 2 && dice.every((die) => Number.isInteger(die) && die >= 1 && die <= 6);
}

export function submitTableChoice(state, participantId, choice, commandId) {
  const check = begin(state, commandId, PHASES.TABLE_CHOICES);
  if (check.rejection || check.duplicate) return check.rejection || check.duplicate;
  if (!state.participants.some((item) => item.id === participantId)) return reject(state, "UNKNOWN_PARTICIPANT");
  if (state.tableSubmissions[participantId]) return reject(state, "CHOICE_ALREADY_SUBMITTED");
  const candidates = getTableCandidates(state, participantId);
  if (choice !== null && !isCandidateMatch(candidates, choice)) return reject(state, "ILLEGAL_TABLE_CHOICE");
  const next = cloneState(state);
  next.tableSubmissions[participantId] = choice === null ? { pass: true } : candidates.find((candidate) => candidate.trailId === choice.trailId && candidate.index === choice.index);
  return accept(state, next, commandId, [{ type: choice === null ? "TABLE_PASSED" : "TABLE_SUBMITTED", participantId }]);
}

export function resolveTableChoices(state, commandId) {
  const check = begin(state, commandId, PHASES.TABLE_CHOICES);
  if (check.rejection || check.duplicate) return check.rejection || check.duplicate;
  if (state.participants.some((participant) => !state.tableSubmissions[participant.id])) return reject(state, "TABLE_CHOICES_INCOMPLETE");
  const next = cloneState(state);
  const events = [];
  for (const participant of next.participants) {
    const choice = next.tableSubmissions[participant.id];
    if (!choice.pass) { applyMark(next, participant.id, choice, PHASES.TABLE_CHOICES); events.push({ type: "TRAIL_MARKED", participantId: participant.id, trailId: choice.trailId }); }
  }
  if (!completeIfNeeded(next, "closedTrails")) next.phase = PHASES.KICK_CHOICE;
  return accept(state, next, commandId, events);
}

export function submitKickChoice(state, choice, commandId) {
  const check = begin(state, commandId, PHASES.KICK_CHOICE);
  if (check.rejection || check.duplicate) return check.rejection || check.duplicate;
  const participantId = currentParticipant(state).id;
  const candidates = getKickCandidates(state, participantId);
  if (choice !== null && !isCandidateMatch(candidates, choice)) return reject(state, "ILLEGAL_KICK_CHOICE");
  const next = cloneState(state);
  const events = [];
  if (choice !== null) {
    const selected = candidates.find((candidate) => candidate.trailId === choice.trailId && candidate.index === choice.index && candidate.tableDieIndex === choice.tableDieIndex);
    applyMark(next, participantId, selected, PHASES.KICK_CHOICE);
    next.kickMarkedThisTurn = true;
    events.push({ type: "TRAIL_MARKED", participantId, trailId: selected.trailId });
  }
  if (!completeIfNeeded(next, "closedTrails")) next.phase = PHASES.TURN_END;
  return accept(state, next, commandId, events);
}

export function finishTurn(state, commandId) {
  const check = begin(state, commandId, PHASES.TURN_END);
  if (check.rejection || check.duplicate) return check.rejection || check.duplicate;
  const next = cloneState(state);
  const active = currentParticipant(next);
  const tableChoice = next.tableSubmissions[active.id];
  const madeTableMark = tableChoice && !tableChoice.pass;
  if (!madeTableMark && !next.kickMarkedThisTurn) active.sheet.strikes += 1;
  if (!completeIfNeeded(next, "fourStrikes")) {
    next.currentSeat = (next.currentSeat + 1) % next.participants.length;
    next.turn += 1;
    next.phase = PHASES.AWAITING_ROLL;
    next.roll = null;
    next.tableSnapshot = null;
    next.tableSubmissions = {};
    next.kickMarkedThisTurn = false;
  }
  return accept(state, next, commandId, active.sheet.strikes > state.participants[state.currentSeat].sheet.strikes ? [{ type: "STRIKE_ADDED", participantId: active.id }] : []);
}

export function validateState(state) {
  const errors = [];
  if (!Object.values(PHASES).includes(state.phase)) errors.push("Unknown phase.");
  if (state.currentSeat < 0 || state.currentSeat >= state.participants.length) errors.push("Invalid current seat.");
  for (const participant of state.participants) {
    if (participant.sheet.strikes < 0 || participant.sheet.strikes > 4) errors.push(`${participant.id}: invalid strikes.`);
    for (const trailId of TRAIL_IDS) {
      const trail = participant.sheet.trails[trailId];
      if (trail.markedIndices.some((index, position) => position > 0 && index <= trail.markedIndices[position - 1])) errors.push(`${participant.id}/${trailId}: marks are not progressive.`);
      if (trail.seal && !trail.markedIndices.includes(10)) errors.push(`${participant.id}/${trailId}: seal without close mark.`);
    }
  }
  return { valid: errors.length === 0, errors };
}

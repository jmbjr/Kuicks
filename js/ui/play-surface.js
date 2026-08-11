import { chooseCpuAction } from "../cpu/choose-action.js";
import { PHASES, createGame, currentParticipant } from "../rules/model.js";
import { getKickCandidates, getTableCandidates } from "../rules/legal-actions.js";
import { finishTurn, resolveTableChoices, rollTurn, submitKickChoice, submitTableChoice } from "../rules/transition.js";

function command(demo, label) { return `ui-${demo.command++}-${label}`; }
function describe(name, action, phase) { return action ? `${name} marked ${action.trailId} ${action.value} for ${phase}.` : `${name} passed ${phase}.`; }

function view(demo, state, phase, log) {
  return { ...demo, state, phase, tableCandidates: phase === "table" ? getTableCandidates(state, "human") : [], kickCandidates: phase === "kick" ? getKickCandidates(state, "human") : [], log: log.slice(-16) };
}

function finishAndRoll(demo, state, log) {
  const active = currentParticipant(state);
  const strikesBefore = active.sheet.strikes;
  state = finishTurn(state, command(demo, "finish-turn")).state;
  const finishedPlayer = state.participants.find((participant) => participant.id === active.id);
  if (finishedPlayer.sheet.strikes > strikesBefore) log.push(`${active.name} received a strike.`);
  if (state.phase === PHASES.COMPLETED) return view(demo, state, "completed", log);
  state = rollTurn(state, command(demo, "roll")).state;
  log.push(`Turn ${state.turn}: ${currentParticipant(state).name} is active. Dice rolled.`);
  return view(demo, state, "table", log);
}

export function createPlaySurfaceDemo(humanName, cpuCount = 2, seed = 20260811) {
  if (!humanName?.trim()) throw new TypeError("A human name is required.");
  if (!Number.isInteger(cpuCount) || cpuCount < 1 || cpuCount > 4) throw new RangeError("CPU count must be 1–4.");
  const participants = [{ id: "human", name: humanName.trim(), type: "human" }, ...Array.from({ length: cpuCount }, (_, index) => ({ id: `cpu-${index + 1}`, name: `CPU ${index + 1}`, type: "cpu" }))];
  let state = createGame({ startingSeat: 0, gameId: `surface-${seed}` }, participants, seed);
  state = rollTurn(state, "ui-0-roll").state;
  return { state, phase: "table", tableCandidates: getTableCandidates(state, "human"), kickCandidates: [], log: [`Turn 1: ${currentParticipant(state).name} is active. Dice rolled.`], command: 1 };
}

export function chooseTable(demo, action) {
  if (demo.phase !== "table") throw new Error("The demo is not awaiting a Table choice.");
  let state = submitTableChoice(demo.state, "human", action, command(demo, "human-table")).state;
  const log = [...demo.log, describe("You", action, "Table")];
  for (const cpu of state.participants.slice(1)) {
    const decision = chooseCpuAction(state, cpu.id, getTableCandidates(state, cpu.id));
    state = submitTableChoice(state, cpu.id, decision.action, command(demo, `${cpu.id}-table`)).state;
    log.push(describe(cpu.name, decision.action, "Table"));
  }
  state = resolveTableChoices(state, command(demo, "resolve-table")).state;
  if (state.phase === PHASES.COMPLETED) return view(demo, state, "completed", log);
  const active = currentParticipant(state);
  if (active.id === "human") return view(demo, state, "kick", log);
  const decision = chooseCpuAction(state, active.id, getKickCandidates(state, active.id));
  state = submitKickChoice(state, decision.action, command(demo, `${active.id}-kick`)).state;
  log.push(describe(active.name, decision.action, "Kick"));
  if (state.phase === PHASES.COMPLETED) return view(demo, state, "completed", log);
  return finishAndRoll(demo, state, log);
}

export function chooseKick(demo, action) {
  if (demo.phase !== "kick") throw new Error("The demo is not awaiting a Kick choice.");
  const state = submitKickChoice(demo.state, action, command(demo, "human-kick")).state;
  const log = [...demo.log, describe("You", action, "Kick")];
  if (state.phase === PHASES.COMPLETED) return view(demo, state, "completed", log);
  return finishAndRoll(demo, state, log);
}

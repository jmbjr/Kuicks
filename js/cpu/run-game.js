import { chooseCpuAction, CPU_POLICY_VERSION } from "./choose-action.js";
import { PHASES, createGame } from "../rules/model.js";
import { getKickCandidates, getTableCandidates } from "../rules/legal-actions.js";
import { finishTurn, resolveTableChoices, rollTurn, submitKickChoice, submitTableChoice, validateState } from "../rules/transition.js";

export function runCpuGame(seed = 123, participantCount = 3) {
  const participants = Array.from({ length: participantCount }, (_, index) => ({
    id: `cpu-${index + 1}`,
    name: `CPU ${index + 1}`,
    type: "cpu"
  }));
  let state = createGame({ gameId: `cpu-demo-${seed}`, cpuPolicyVersion: CPU_POLICY_VERSION }, participants, seed);
  const decisions = [];
  let command = 0;

  while (state.phase !== PHASES.COMPLETED && state.turn <= 150) {
    state = rollTurn(state, `cpu-${command++}`).state;
    for (const participant of state.participants) {
      const decision = chooseCpuAction(state, participant.id, getTableCandidates(state, participant.id));
      decisions.push({ turn: state.turn, phase: "Table", participantId: participant.id, ...decision });
      state = submitTableChoice(state, participant.id, decision.action, `cpu-${command++}`).state;
    }
    state = resolveTableChoices(state, `cpu-${command++}`).state;
    if (state.phase === PHASES.COMPLETED) break;

    const active = state.participants[state.currentSeat];
    const decision = chooseCpuAction(state, active.id, getKickCandidates(state, active.id));
    decisions.push({ turn: state.turn, phase: "Kick", participantId: active.id, ...decision });
    state = submitKickChoice(state, decision.action, `cpu-${command++}`).state;
    if (state.phase === PHASES.COMPLETED) break;
    state = finishTurn(state, `cpu-${command++}`).state;
  }

  const validation = validateState(state);
  if (state.phase !== PHASES.COMPLETED) throw new Error("CPU game did not finish within 150 turns.");
  if (!validation.valid) throw new Error(validation.errors.join(" "));
  return { state, decisions };
}

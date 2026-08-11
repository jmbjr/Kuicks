import { chooseCpuAction, CPU_POLICY_VERSION } from "./cpu/choose-action.js";
import { runCpuGame } from "./cpu/run-game.js";
import { createGame } from "./rules/model.js";
import { getTableCandidates } from "./rules/legal-actions.js";
import { rollTurn } from "./rules/transition.js";

function check(name, run) {
  try { return { name, passed: true, detail: run() }; }
  catch (error) { return { name, passed: false, detail: error instanceof Error ? error.message : String(error) }; }
}
function expect(condition, message) { if (!condition) throw new Error(message); }

function decisionFixture() {
  let state = createGame({ startingSeat: 0 }, [
    { id: "cpu-a", name: "CPU A", type: "cpu" },
    { id: "cpu-b", name: "CPU B", type: "cpu" }
  ], 77);
  state.participants[0].sheet.trails.sun.markedIndices = [0, 1, 2, 3, 4];
  state = rollTurn(state, "fixture-roll", { table: [6, 6], trails: { sun: 1, spark: 1, wave: 1, leaf: 1 } }).state;
  return { state, actions: getTableCandidates(state, "cpu-a") };
}

export function runCpuChecks() {
  return [
    check("Chooses only legal actions", () => {
      const { state, actions } = decisionFixture();
      const decision = chooseCpuAction(state, "cpu-a", actions);
      expect(actions.includes(decision.action), "Selected action was not supplied by the rules engine.");
      return `${decision.reason} Selected from ${actions.length} legal choices.`;
    }),
    check("Prioritizes a legal closure", () => {
      const { state, actions } = decisionFixture();
      const decision = chooseCpuAction(state, "cpu-a", actions);
      expect(decision.action?.trailId === "sun" && decision.action.closesTrail, "CPU skipped an available closure.");
      return `${decision.reason} Explainable policy: ${CPU_POLICY_VERSION}.`;
    }),
    check("Replays the same seed", () => {
      const first = runCpuGame(20260811);
      const second = runCpuGame(20260811);
      expect(JSON.stringify(first) === JSON.stringify(second), "Identical seeds produced different games.");
      return `Seed 20260811 repeated ${first.decisions.length} identical decisions and the same final result.`;
    }),
    check("Completes a valid three-CPU game", () => {
      const { state, decisions } = runCpuGame(314159, 3);
      const passes = decisions.filter((decision) => decision.action === null).length;
      return `Three CPUs finished in ${state.turn} turns; ${decisions.length} decisions, ${passes} legal passes, ${state.result.winners.length} winner${state.result.winners.length === 1 ? "" : "s"}.`;
    })
  ];
}

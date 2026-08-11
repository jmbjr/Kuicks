export const CPU_POLICY_VERSION = "simple-progress-v1";

function rank(choice) {
  return [
    choice.closesTrail ? 1 : 0,
    choice.index,
    -choice.trailId.localeCompare("leaf")
  ];
}

function compare(left, right) {
  const leftRank = rank(left);
  const rightRank = rank(right);
  for (let index = 0; index < leftRank.length; index += 1) {
    if (leftRank[index] !== rightRank[index]) return rightRank[index] - leftRank[index];
  }
  return left.trailId.localeCompare(right.trailId)
    || (left.tableDieIndex ?? 0) - (right.tableDieIndex ?? 0);
}

export function chooseCpuAction(state, participantId, legalActions) {
  if (!state || !participantId || !Array.isArray(legalActions)) {
    throw new TypeError("CPU decisions require state, participant ID, and legal actions.");
  }
  if (!state.participants.some((participant) => participant.id === participantId)) {
    throw new RangeError("CPU participant is not in this game.");
  }
  if (legalActions.length === 0) {
    return { action: null, reason: "No legal mark; pass.", policyVersion: CPU_POLICY_VERSION };
  }

  const action = [...legalActions].sort(compare)[0];
  const reason = action.closesTrail
    ? `Close ${action.trailId} with ${action.value}.`
    : `Advance ${action.trailId} to ${action.value}.`;
  return { action, reason, policyVersion: CPU_POLICY_VERSION };
}

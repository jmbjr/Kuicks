import { PHASES, RULES, TRAILS, TRAIL_IDS, currentParticipant } from "./model.js";

function candidateForValue(state, participant, trailId, value, openTrails = null) {
  if (openTrails && !openTrails.includes(trailId)) return null;
  if (!openTrails && state.closedTrails[trailId]) return null;
  const definition = TRAILS[trailId];
  const index = definition.values.indexOf(value);
  if (index < 0) return null;
  const trail = participant.sheet.trails[trailId];
  const lastIndex = trail.markedIndices.at(-1) ?? -1;
  if (index <= lastIndex) return null;
  const isClose = index === definition.values.length - 1;
  if (isClose && trail.markedIndices.length < RULES.minimumMarksBeforeClose) return null;
  return { trailId, value, index, closesTrail: isClose };
}

export function getTableCandidates(state, participantId) {
  if (state.phase !== PHASES.TABLE_CHOICES || !state.roll) return [];
  const participant = state.participants.find((item) => item.id === participantId);
  if (!participant || state.tableSubmissions[participantId]) return [];
  const openTrails = state.tableSnapshot?.openTrails || TRAIL_IDS.filter((id) => !state.closedTrails[id]);
  const value = state.roll.table[0] + state.roll.table[1];
  return openTrails.map((trailId) => candidateForValue(state, participant, trailId, value, openTrails)).filter(Boolean)
    .map((candidate) => ({ type: "markTable", participantId, ...candidate }));
}

export function getKickCandidates(state, participantId = currentParticipant(state)?.id) {
  if (state.phase !== PHASES.KICK_CHOICE || !state.roll || participantId !== currentParticipant(state)?.id) return [];
  const participant = currentParticipant(state);
  const candidates = [];
  for (const trailId of TRAIL_IDS) {
    if (state.closedTrails[trailId] || state.roll.trails[trailId] == null) continue;
    state.roll.table.forEach((tableValue, tableDieIndex) => {
      const value = tableValue + state.roll.trails[trailId];
      const candidate = candidateForValue(state, participant, trailId, value);
      if (candidate) candidates.push({ type: "markKick", participantId, tableDieIndex, trailDie: trailId, ...candidate });
    });
  }
  return candidates;
}

export function isCandidateMatch(candidates, choice) {
  return candidates.some((candidate) => candidate.trailId === choice?.trailId
    && candidate.index === choice?.index
    && (candidate.type !== "markKick" || candidate.tableDieIndex === choice?.tableDieIndex));
}

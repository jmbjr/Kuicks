import { RULES, TRAIL_IDS } from "./model.js";

export function trailPoints(markCount) {
  if (!Number.isInteger(markCount) || markCount < 0 || markCount > 12) throw new RangeError("Invalid trail mark count.");
  return markCount * (markCount + 1) / 2;
}

export function scoreSheet(sheet) {
  const trails = Object.fromEntries(TRAIL_IDS.map((id) => {
    const trail = sheet.trails[id];
    const scoringMarks = trail.markedIndices.length + (trail.seal ? 1 : 0);
    return [id, { scoringMarks, points: trailPoints(scoringMarks) }];
  }));
  const trailTotal = Object.values(trails).reduce((total, trail) => total + trail.points, 0);
  const strikePoints = sheet.strikes * RULES.strikeValue;
  return { trails, trailTotal, strikePoints, total: trailTotal + strikePoints };
}

export function getWinners(state) {
  const scores = state.participants.map((participant) => ({ participantId: participant.id, ...scoreSheet(participant.sheet) }));
  const highScore = Math.max(...scores.map((score) => score.total));
  return scores.filter((score) => score.total === highScore).map((score) => score.participantId);
}

export function getFinalResult(state) {
  const scores = state.participants.map((participant) => ({ participantId: participant.id, ...scoreSheet(participant.sheet) }));
  const highScore = Math.max(...scores.map((score) => score.total));
  return { scores, highScore, winners: scores.filter((score) => score.total === highScore).map((score) => score.participantId) };
}

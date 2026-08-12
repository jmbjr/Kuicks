import { TRAIL_IDS } from "../rules/model.js";
import { scoreSheet } from "../rules/scoring.js";

export const SUMMARY_LAYOUTS = Object.freeze({ PLAYERS: "players", TRAILS: "trails" });

export function activeFirstParticipants(state) {
  return state.participants.map((_, offset) => state.participants[(state.currentSeat + offset) % state.participants.length]);
}

export function createSummaryModel(state, layout = SUMMARY_LAYOUTS.PLAYERS) {
  if (!Object.values(SUMMARY_LAYOUTS).includes(layout)) throw new TypeError("Unknown scorecard summary layout.");
  const activeId = state.participants[state.currentSeat].id;
  const decorate = (participant) => ({
    ...participant,
    active: participant.id === activeId,
    score: scoreSheet(participant.sheet),
  });
  const participants = state.participants.map(decorate);
  const activeFirst = activeFirstParticipants(state).map(decorate);
  return layout === SUMMARY_LAYOUTS.PLAYERS
    ? { layout, activeId, participants }
    : { layout, activeId, trails: TRAIL_IDS.map((trailId) => ({ trailId, participants: activeFirst })) };
}

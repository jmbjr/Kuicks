import { BUILD_ID } from "./config.js";
import { createPlaySurfaceDemo, chooseTable, chooseKick } from "./ui/play-surface.js";
import { TRAILS, TRAIL_IDS } from "./rules/model.js";

const $ = (selector) => document.querySelector(selector);
let demo = null;
const trailNames = { sun: "Sun", spark: "Spark", wave: "Wave", leaf: "Leaf" };

$("#build-id").textContent = `Build ${BUILD_ID}`;
function connection() { $("#connection-status").textContent = navigator.onLine ? "Ready" : "Offline"; }
addEventListener("online", connection); addEventListener("offline", connection); connection();

function die(value, label, trailId = "") {
  const item = document.createElement("span");
  item.className = `die ${trailId ? `die--${trailId}` : ""}`;
  item.textContent = value;
  item.setAttribute("aria-label", `${label} ${value}`);
  return item;
}

function renderDice() {
  const { roll } = demo.state;
  $("#table-dice").replaceChildren(...roll.table.map((value, index) => die(value, `Table die ${index + 1}`)));
  $("#trail-dice").replaceChildren(...TRAIL_IDS.filter((id) => Object.hasOwn(roll.trails, id)).map((id) => die(roll.trails[id], `${trailNames[id]} die`, id)));
}

function renderSheet() {
  const human = demo.state.participants[0];
  const legal = demo.phase === "table" ? demo.tableCandidates : demo.kickCandidates;
  $("#human-sheet").replaceChildren(...TRAIL_IDS.map((id) => {
    const row = document.createElement("div"); row.className = `trail-row trail-row--${id}`;
    const heading = document.createElement("div"); heading.className = "trail-heading";
    heading.innerHTML = `<strong>${trailNames[id]}</strong><span>${id === "sun" || id === "spark" ? "Rising" : "Falling"}</span>`;
    const cells = document.createElement("div"); cells.className = "trail-cells";
    const marked = human.sheet.trails[id].markedIndices;
    const furthestMarked = marked.at(-1) ?? -1;
    TRAILS[id].values.forEach((value, index) => {
      const button = document.createElement("button"); button.type = "button"; button.textContent = value;
      const candidates = legal.filter((candidate) => candidate.trailId === id && candidate.index === index);
      if (marked.includes(index)) {
        button.className = `cell cell--marked cell--trail-${id}`;
        button.textContent = "X";
        button.disabled = true;
        button.setAttribute("aria-label", `${trailNames[id]} ${value}, marked`);
      }
      else if (candidates.length) {
        button.className = `cell cell--legal cell--trail-${id}`;
        button.setAttribute("aria-label", `${trailNames[id]} ${value}, legal ${demo.phase} choice`);
        button.addEventListener("click", () => applyChoice(candidates[0]));
      } else if (index < furthestMarked) {
        button.className = "cell cell--skipped";
        button.disabled = true;
        button.setAttribute("aria-label", `${trailNames[id]} ${value}, no longer available`);
      } else {
        button.className = "cell";
        button.disabled = true;
        button.setAttribute("aria-label", `${trailNames[id]} ${value}, not currently available`);
      }
      cells.append(button);
    });
    row.append(heading, cells); return row;
  }));
  $("#progress").textContent = `${human.sheet.strikes} / 4 strikes`;
}

function renderOpponents() {
  $("#opponent-list").replaceChildren(...demo.state.participants.slice(1).map((cpu) => {
    const card = document.createElement("article"); card.className = "opponent-card";
    const marks = Object.values(cpu.sheet.trails).reduce((sum, trail) => sum + trail.markedIndices.length, 0);
    card.innerHTML = `<strong>${cpu.name}</strong><span>${marks} marks · ${cpu.sheet.strikes} strikes</span>`; return card;
  }));
}

function renderResults() {
  const results = $("#results");
  if (demo.phase !== "completed") { results.hidden = true; return; }
  const winners = new Set(demo.state.result.winners);
  const byId = new Map(demo.state.participants.map((participant) => [participant.id, participant]));
  $("#result-list").replaceChildren(...[...demo.state.result.scores].sort((a, b) => b.total - a.total).map((score) => {
    const row = document.createElement("div");
    row.className = `result-row${winners.has(score.participantId) ? " result-row--winner" : ""}`;
    const suffix = winners.has(score.participantId) ? (winners.size > 1 ? " — tied winner" : " — winner") : "";
    row.innerHTML = `<span>${byId.get(score.participantId).name}${suffix}</span><strong>${score.total}</strong>`;
    return row;
  }));
  results.hidden = false;
}

function renderActions() {
  const actions = $("#actions"); actions.replaceChildren();
  const pass = document.createElement("button"); pass.type = "button"; pass.className = "secondary";
  pass.textContent = demo.phase === "table" ? "Pass Table choice" : "Pass Kick choice";
  pass.addEventListener("click", () => applyChoice(null)); actions.append(pass);
}

function renderLog() { $("#activity-log").replaceChildren(...[...demo.log].reverse().map((text) => { const li = document.createElement("li"); li.textContent = text; return li; })); }

function render() {
  renderDice(); renderSheet(); renderOpponents(); renderLog(); renderResults();
  const table = demo.state.roll.table; const total = table[0] + table[1];
  if (demo.phase === "table") {
    $("#phase-label").textContent = "Table choice"; $("#turn-title").textContent = "Choose a shared total";
    $("#instruction").textContent = `${table[0]} + ${table[1]} = ${total}. Tap any outlined ${total}, or pass.`; renderActions();
  } else if (demo.phase === "kick") {
    $("#phase-label").textContent = "Kick choice"; $("#turn-title").textContent = "Choose a dice combination";
    $("#instruction").textContent = "Tap any outlined destination created by one Table die plus its trail die, or pass."; renderActions();
  } else {
    const winnerNames = demo.state.result.winners.map((id) => demo.state.participants.find((participant) => participant.id === id).name);
    $("#phase-label").textContent = "Game complete"; $("#turn-title").textContent = winnerNames.length > 1 ? "Tie game" : `${winnerNames[0]} wins!`;
    $("#instruction").textContent = `Game ended by ${demo.state.result.cause === "fourStrikes" ? "four strikes" : "two closed trails"}. Final scores are below.`;
    $("#actions").replaceChildren(); $("#restart-demo").hidden = false;
  }
}

function applyChoice(choice) {
  demo = demo.phase === "table" ? chooseTable(demo, choice) : chooseKick(demo, choice);
  render();
}

$("#setup-form").addEventListener("submit", (event) => {
  event.preventDefault(); const name = $("#player-name").value.trim();
  if (!name) { $("#setup-error").textContent = "Enter your name to start."; return; }
  demo = createPlaySurfaceDemo(name, Number($("#cpu-count").value), 20260811);
  $("#setup-view").hidden = true; $("#game-view").hidden = false; render();
});
$("#restart-demo").addEventListener("click", () => location.reload());

if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js"));

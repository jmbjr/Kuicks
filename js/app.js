import { BUILD_ID } from "./config.js";
import { runCpuChecks } from "./cpu-lab.js";

const buildLabel = document.querySelector("#build-id");
const connectionLabel = document.querySelector("#connection-status");
const runButton = document.querySelector("#run-checks");
const runSummary = document.querySelector("#run-summary");
const resultsList = document.querySelector("#check-results");

buildLabel.textContent = `Build ${BUILD_ID}`;

function renderConnectionStatus() {
  connectionLabel.textContent = navigator.onLine ? "Ready" : "Offline shell";
}

window.addEventListener("online", renderConnectionStatus);
window.addEventListener("offline", renderConnectionStatus);
renderConnectionStatus();

function renderResults(results) {
  resultsList.replaceChildren(...results.map((result) => {
    const item = document.createElement("li");
    item.className = `check-result check-result--${result.passed ? "pass" : "fail"}`;
    const heading = document.createElement("strong");
    heading.textContent = `${result.passed ? "PASS" : "FAIL"} — ${result.name}`;
    const detail = document.createElement("span");
    detail.textContent = result.detail;
    item.append(heading, detail);
    return item;
  }));
}

runButton.addEventListener("click", () => {
  runButton.disabled = true;
  runSummary.textContent = "Running checks…";
  const results = runCpuChecks();
  renderResults(results);
  const passed = results.filter((result) => result.passed).length;
  runSummary.textContent = passed === results.length
    ? `All ${passed} checks passed. Phase 3 verified in this browser.`
    : `${passed} of ${results.length} checks passed. Phase 3 is not accepted.`;
  runSummary.dataset.outcome = passed === results.length ? "pass" : "fail";
  runButton.textContent = "Run checks again";
  runButton.disabled = false;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      connectionLabel.textContent = "Ready — offline setup pending";
    });
  });
}

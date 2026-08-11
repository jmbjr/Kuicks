import { BUILD_ID } from "./config.js";

const buildLabel = document.querySelector("#build-id");
const connectionLabel = document.querySelector("#connection-status");

buildLabel.textContent = `Build ${BUILD_ID}`;

function renderConnectionStatus() {
  connectionLabel.textContent = navigator.onLine ? "Ready" : "Offline shell";
}

window.addEventListener("online", renderConnectionStatus);
window.addEventListener("offline", renderConnectionStatus);
renderConnectionStatus();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      connectionLabel.textContent = "Ready — offline setup pending";
    });
  });
}

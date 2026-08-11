import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("scorecard cell states have one authoritative, cache-versioned stylesheet", async () => {
  const [html, css, serviceWorker] = await Promise.all([
    read("index.html"),
    read("css/app.css"),
    read("service-worker.js"),
  ]);

  assert.match(html, /css\/app\.css\?v=9/);
  assert.doesNotMatch(html, /trail-progress\.css/);
  assert.match(serviceWorker, /css\/app\.css\?v=9/);

  assert.match(css, /\.cell\{[^}]*background:#d8dde3/);
  assert.match(css, /\.cell\.cell--trail-sun\{background:var\(--sun\)\}/);
  assert.match(css, /\.cell\.cell--trail-spark\{background:var\(--coral\)\}/);
  assert.match(css, /\.cell\.cell--trail-wave\{background:var\(--sky\)\}/);
  assert.match(css, /\.cell\.cell--trail-leaf\{background:var\(--mint\)\}/);
  assert.match(css, /\.cell--marked\{color:#000/);
  assert.match(css, /\.cell\.cell--skipped\{[^}]*background:#343b45/);
});

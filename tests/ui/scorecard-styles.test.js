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

  assert.match(html, /css\/app\.css\?v=13/);
  assert.doesNotMatch(html, /trail-progress\.css/);
  assert.match(serviceWorker, /css\/app\.css\?v=13/);

  assert.match(css, /\.trail-row--sun\s*\{[^}]*background:\s*var\(--sun\)/);
  assert.match(css, /\.trail-row--spark\s*\{[^}]*background:\s*var\(--coral\)/);
  assert.match(css, /\.trail-row--wave\s*\{[^}]*background:\s*var\(--sky\)/);
  assert.match(css, /\.trail-row--leaf\s*\{[^}]*background:\s*var\(--mint\)/);
  assert.doesNotMatch(css, /\.trail-row\s*\{[^}]*border-left/);

  assert.match(css, /\.cell\s*\{[^}]*background:\s*#d8dde3/);
  assert.match(css, /\.cell\.cell--future\.cell--trail-sun\s*\{[^}]*background:\s*#ded8c7/);
  assert.match(css, /\.cell\.cell--future\.cell--trail-spark\s*\{[^}]*background:\s*#ddc9c9/);
  assert.match(css, /\.cell\.cell--future\.cell--trail-wave\s*\{[^}]*background:\s*#cad8df/);
  assert.match(css, /\.cell\.cell--future\.cell--trail-leaf\s*\{[^}]*background:\s*#cbdad4/);
  assert.match(css, /\.cell\.cell--marked\.cell--trail-sun\s*\{[^}]*background:\s*var\(--sun\)/);
  assert.match(css, /\.cell\.cell--marked\.cell--trail-spark\s*\{[^}]*background:\s*var\(--coral\)/);
  assert.match(css, /\.cell\.cell--marked\.cell--trail-wave\s*\{[^}]*background:\s*var\(--sky\)/);
  assert.match(css, /\.cell\.cell--marked\.cell--trail-leaf\s*\{[^}]*background:\s*var\(--mint\)/);
  assert.match(css, /\.cell--legal\s*\{[^}]*background:\s*#fff[^}]*border-width:\s*3px/);
  assert.match(css, /\.cell--marked\s*\{[^}]*color:\s*#000/);
  assert.match(css, /\.cell\.cell--skipped\s*\{[^}]*background:\s*#343b45/);
});

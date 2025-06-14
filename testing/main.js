"use strict";

const wasm = require("../wasm");
const wasmSync = require("../wasm-sync");
const jsSimple = require("../collections/js-simple");
const jsFast = require("../collections/js");
const wsm = require("../index");
// test
const test = require("node:test");
const ws = require("./_test/ws");
const runTests = require("./_test/test");

test.describe("main", async () => {
  await wasm.initialize();

  for (const { f, n } of [
    {
      f: wasm,
      n: "wasm",
    },
    {
      f: wasmSync,
      n: "wasm-sync",
    },
    {
      f: jsSimple,
      n: "js-simple",
    },
    {
      f: jsFast,
      n: "js",
    },
    {
      f: wsm,
      n: "index",
    },
  ]) {
    ws(f);
    runTests(f, n);
  }
});

"use strict";

const { mask } = require("../collections/js");
const wasm = require("../wasm");
const wasmSync = require("../wasm-sync");
const js = require("../index");
const zeroPool = require("../collections/zero-pool");
const test = require("node:test");
const equal = require("./_util/equal");
const assert = require("./_util/assert");
const ws = require("./ws");

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
      f: js,
      n: "js",
    },
    {
      f: zeroPool,
      n: "zero-pool",
    },
  ]) {
    test.it(`fuzz (${n})`, () => {
      const source = new Uint8Array([1, 2, 3, 4]);
      const length = source.length;
      const u8MaskKey = new Uint8Array(4);
      const u32MaskKey = new Uint32Array(u8MaskKey.buffer);
      const aOutput = new Uint8Array(length);
      const bOutput = new Uint8Array(length);
      for (let i = 0; i <= 20000; ++i) {
        u32MaskKey[0] = Math.floor(Math.random() * 0xffffffff);
        mask(source, u8MaskKey, aOutput, 0, length);
        f.mask(source, u8MaskKey, bOutput, 0, length);
        assert(equal.buffer(aOutput, bOutput));
      }
    });

    ws(f);
  }
});

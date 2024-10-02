//@ts-check

import { randomBytes } from "node:crypto";
import bufferutil from "bufferutil";
import { bench, group, run } from "mitata";
import jsSingle from "../collections/js-single.js";
import fJs from "../collections/js.js";
import limited from "../collections/limited.js";
import js from "../js.js";
import wsm from "../wasm-sync.js";
import zeroPool from "../zero-pool.js";
// import wsmUBI from "../collections/initialize-ubigint.js";
// const wsmUBigint = wsmUBI.initialize();

const settings = {
  "32b": 32,
  "64b": 64,
  "16Kib": 16 * 1024,
  "64Kib": 64 * 1024,
  "128Kib": 128 * 1024,
  "256Kib": 256 * 1024,
  "1MiB": 1024 * 1024,
  "16Mib": 16 * 1024 * 1024,
  "32Mib": 32 * 1024 * 1024,
  "64Mib": 64 * 1024 * 1024,
  "128Mib": 128 * 1024 * 1024,
};

const mask = randomBytes(4);

for (const [name, length] of Object.entries(settings)) {
  const buffer = randomBytes(length);
  const p = new Uint8Array(buffer);
  group(`mask - ${name}`, () => {
    bench("wsm - wasm-simd", () => {
      return wsm.unmask(p, mask);
    });
    bench("wsm - js", () => {
      return js.unmask(p, mask);
    });
    bench("wsm - fallback", () => {
      return fJs.unmask(p, mask);
    });
    bench("wsm - zero-pool", () => {
      return zeroPool.unmask(p, mask);
    });
    bench("js - single", () => {
      return jsSingle.unmask(p, mask);
    });
    bench("bufferutil", () => {
      return bufferutil.unmask(p, mask);
    });
    bench("fast", () => {
      return limited.unmask(p, mask);
    });
  });
}

await run();

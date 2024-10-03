//@ts-check

import { randomBytes } from "node:crypto";
import bufferutil from "bufferutil";
import { bench, group, run } from "mitata";
import fJsLegacy from "../collections/js-legacy.js";
import jsSingleOptimized from "../collections/js-single-optimized.js";
import jsSingle from "../collections/js-single.js";
import fJs from "../collections/js.js";
import zeroPool from "../collections/zero-pool.js";
import js from "../index.js";
import wsm from "../wasm-sync.js";
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

const pool = new Uint8Array(
  Buffer.allocUnsafeSlow(Math.max(...Object.values(settings))).buffer,
);

for (const [name, length] of Object.entries(settings)) {
  const buffer = randomBytes(length);
  group(`mask - ${name}`, () => {
    bench("wsm - wasm-simd", () => {
      return wsm.mask(buffer, mask, pool, 0, length);
    });
    bench("wsm - js", () => {
      return js.mask(buffer, mask, pool, 0, length);
    });
    bench("wsm - fallback", () => {
      return fJs.mask(buffer, mask, pool, 0, length);
    });
    bench("wsm - fallback legacy", () => {
      return fJsLegacy.mask(buffer, mask, pool, 0, length);
    });
    bench("wsm - zero-pool", () => {
      return zeroPool.mask(buffer, mask, pool, 0, length);
    });
    bench("js - single", () => {
      return jsSingle.mask(buffer, mask, pool, 0, length);
    });
    bench("js - single-optimized", () => {
      return jsSingleOptimized.mask(buffer, mask, pool, 0, length);
    });
    bench("bufferutil", () => {
      return bufferutil.mask(buffer, mask, pool, 0, length);
    });
  });
}

await run();

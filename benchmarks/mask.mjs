//@ts-check

import { randomBytes } from "node:crypto";
import bufferutil from "bufferutil";
import { bench, group, run } from "mitata";
import wsmjl from "../collections/initialize.js";
import jsSimple from "../collections/js-simple.js";
import js from "../collections/js.js";
import zeroPool from "../collections/zero-pool.js";
import wsm from "../wasm-sync.js";
const wsmj = wsmjl.initialize();

const settings = {
  "4b": 4, // overhead
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
  "256Mib": 256 * 1024 * 1024,
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
    bench("wsm - zero-pool", () => {
      return zeroPool.mask(buffer, mask, pool, 0, length);
    });
    bench("wsm - js", () => {
      return wsmj.mask(buffer, mask, pool, 0, length);
    });
    bench("js - simple", () => {
      return jsSimple.mask(buffer, mask, pool, 0, length);
    });
    bench("js", () => {
      return js.mask(buffer, mask, pool, 0, length);
    });
    bench("bufferutil", () => {
      return bufferutil.mask(buffer, mask, pool, 0, length);
    });
  });
}

await run();

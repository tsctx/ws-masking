//@ts-check

import { randomBytes } from "node:crypto";
import bufferutil from "bufferutil";
import { bench, group, run } from "mitata";
import jsSimple from "../collections/js-simple.js";
import jsFast from "../collections/js.js";
import wsm from "../index.js";
import wasm from "../wasm-sync.js";

const settings = {
  "4b": 4, // overhead
  "32b": 32,
  "64b": 64,
  "16Kib": 16 * 1024,
  "64Kib": 64 * 1024,
  "128Kib": 128 * 1024,
  "256Kib": 256 * 1024,
  "1MiB": 1024 * 1024,
  "8MiB": 8 * 1024 * 1024,
  "16Mib": 16 * 1024 * 1024,
  "32Mib": 32 * 1024 * 1024,
  "64Mib": 64 * 1024 * 1024,
  "128Mib": 128 * 1024 * 1024,
  "256Mib": 256 * 1024 * 1024,
  "512Mib": 512 * 1024 * 1024,
  "1Gib": 1024 * 1024 * 1024,
};

const mask = randomBytes(4);

const pool = new Uint8Array(
  Buffer.allocUnsafeSlow(Math.max(...Object.values(settings))).buffer,
);

for (const [name, length] of Object.entries(settings)) {
  const buffer = randomBytes(length);

  group(`mask - ${name}`, () => {
    bench("wsm - wasm-simd", () => {
      return wasm.mask(buffer, mask, pool, 0, length);
    });
    bench("wsm", () => {
      return wsm.mask(buffer, mask, pool, 0, length);
    });
    bench("js - simple", () => {
      return jsSimple.mask(buffer, mask, pool, 0, length);
    });
    bench("js", () => {
      return jsFast.mask(buffer, mask, pool, 0, length);
    });
    bench("bufferutil", () => {
      return bufferutil.mask(buffer, mask, pool, 0, length);
    });
  });
}

await run();

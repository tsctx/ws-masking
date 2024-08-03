//@ts-check

import { randomBytes } from "node:crypto";
import bufferutil from "bufferutil";
import { bench, group, run } from "mitata";
import js from "../js.js";
import wsm from "../wasm-sync.js";

/**
 * @param {Uint8Array} source
 * @param {Uint8Array | number[]} mask
 * @param {Uint8Array} output
 * @param {number} offset
 * @param {number} length
 * @returns {Uint8Array}
 */
function maskJs(source, mask, output, offset, length) {
  for (let i = 0; i < length; ++i) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
  return output;
}

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
    bench("ws-masking - wasm (simd)", () => {
      return wsm.mask(buffer, mask, pool, 0, length);
    });
    bench("ws-masking - js", () => {
      return js.mask(buffer, mask, pool, 0, length);
    });
    if (length < 1024 * 1024) {
      bench("js", () => {
        return maskJs(buffer, mask, pool, 0, length);
      });
    }
    bench("bufferutil", () => {
      return bufferutil.mask(buffer, mask, pool, 0, length);
    });
  });
}

await run();

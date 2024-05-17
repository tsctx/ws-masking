//@ts-check

import { randomBytes } from "node:crypto";
import bufferutil from "bufferutil";
import { bench, group, run } from "mitata";
import wsm from "../index.js";

await wsm.initialize();

/**
 * @param {Uint8Array} source
 * @param {Uint8Array} mask
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
  "128Mib": 128 * 1024 * 1024,
  "256Mib": 256 * 1024 * 1024,
};

const mask = randomBytes(4);

for (const [name, length] of Object.entries(settings)) {
  const buffer = randomBytes(length);
  const pool = Buffer.allocUnsafe(length);
  group(`mask - ${name}`, () => {
    bench("ws-masking", () => {
      return wsm.mask(buffer, mask, pool, 0, length);
    });
    bench("wsm.js", () => {
      return wsm.js.mask(buffer, mask, pool, 0, length);
    });
    bench("js", () => {
      return maskJs(buffer, mask, pool, 0, length);
    });
    bench("bufferutil", () => {
      return bufferutil.mask(buffer, mask, pool, 0, length);
    });
  });
}

await run();

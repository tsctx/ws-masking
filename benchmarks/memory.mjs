//@ts-check

import { randomBytes } from "node:crypto";
import bufferutil from "bufferutil";
import { bench, group, run } from "mitata";
import { initialize } from "../initialize-wasm-sync.js";

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

const wsm64Kib = initialize({ memory: 1 });
const wsm1Mib = initialize({ memory: 16 });

const pool = new Uint8Array(
  Buffer.allocUnsafeSlow(Math.max(...Object.values(settings))).buffer,
);

for (const [name, length] of Object.entries(settings)) {
  const buffer = randomBytes(length);
  group(`mask - ${name}`, () => {
    bench("ws-masking1 64Kib", () => {
      return wsm64Kib.mask(buffer, mask, pool, 0, length);
    });
    bench("ws-masking 1Mib", () => {
      return wsm1Mib.mask(buffer, mask, pool, 0, length);
    });
    bench("bufferutil", () => {
      return bufferutil.mask(buffer, mask, pool, 0, length);
    });
  });
}

await run();

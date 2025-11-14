//@ts-check

import { randomBytes } from "node:crypto";
import bufferutil from "bufferutil";
import { bench, group, run, summary } from "mitata-v1";
import jsFast from "../collections/js.js";
import jsSimple from "../collections/js-simple.js";
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
  "16Mib": 16 * 1024 * 1024,
  "32Mib": 32 * 1024 * 1024,
  "64Mib": 64 * 1024 * 1024,
  "128Mib": 128 * 1024 * 1024,
  "256Mib": 256 * 1024 * 1024,
};

const mask = randomBytes(4);

for (const [name, length] of Object.entries(settings)) {
  const buffer = randomBytes(length);
  const p = new Uint8Array(buffer);
  group(`unmask - ${name}`, () => {
    summary(() => {
      bench("wsm - wasm-simd", () => {
        return wasm.unmask(p, mask);
      });
      bench("wsm", () => {
        return wsm.unmask(p, mask);
      });
      bench("js - simple", () => {
        return jsSimple.unmask(p, mask);
      });
      bench("js", () => {
        return jsFast.unmask(p, mask);
      });
      bench("bufferutil", () => {
        return bufferutil.unmask(p, mask);
      });
    });
  });
}

await run();

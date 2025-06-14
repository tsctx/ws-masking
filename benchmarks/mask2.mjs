//@ts-check

import { randomBytes } from "node:crypto";
import bufferutil from "bufferutil";
import { bench, lineplot, run, summary } from "mitata-v1";
import wsm from "../index.js";
import wasm from "../wasm-sync.js";

const mask = randomBytes(4);

const pool = new Uint8Array(Buffer.allocUnsafeSlow(1024 * 1024 * 256).buffer);

lineplot(() => {
  summary(() => {
    bench("wsm - wasm-simd", function* (state) {
      const size = state.get("size");
      const buffer = randomBytes(size);

      yield () => wasm.mask(buffer, mask, pool, 0, size);
    })
      .range("size", 256, 1024 * 1024 * 256, 16)
      .gc("inner");
    bench("wsm", function* (state) {
      const size = state.get("size");
      const buffer = randomBytes(size);

      yield () => wsm.mask(buffer, mask, pool, 0, size);
    })
      .range("size", 256, 1024 * 1024 * 256, 16)
      .gc("inner");
    bench("bufferutil", function* (state) {
      const size = state.get("size");
      const buffer = randomBytes(size);

      yield () => bufferutil.mask(buffer, mask, pool, 0, size);
    })
      .range("size", 256, 1024 * 1024 * 256, 16)
      .gc("inner");
  });
});

await run();

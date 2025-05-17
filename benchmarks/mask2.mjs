//@ts-check

import { randomBytes } from "node:crypto";
import bufferutil from "bufferutil";
import { bench, lineplot, run, summary } from "mitata-v1";
import wsmjl from "../collections/initialize.js";
import zeroPool from "../collections/zero-pool.js";
import wsm from "../wasm-sync.js";

const wsmj = wsmjl.initialize();

const mask = randomBytes(4);

const pool = new Uint8Array(Buffer.allocUnsafeSlow(1024 * 1024 * 256).buffer);

lineplot(() => {
  summary(() => {
    bench("wsm - wasm-simd", function* (state) {
      const size = state.get("size");
      const buffer = randomBytes(size);

      yield () => wsm.mask(buffer, mask, pool, 0, size);
    })
      .range("size", 256, 1024 * 1024 * 256, 32)
      .gc("inner");
    bench("wsm - zero-pool", function* (state) {
      const size = state.get("size");
      const buffer = randomBytes(size);

      yield () => zeroPool.mask(buffer, mask, pool, 0, size);
    })
      .range("size", 256, 1024 * 1024 * 256, 16)
      .gc("inner");
    bench("wsm - js", function* (state) {
      const size = state.get("size");
      const buffer = randomBytes(size);

      yield () => wsmj.mask(buffer, mask, pool, 0, size);
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

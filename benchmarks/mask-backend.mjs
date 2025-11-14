import crypto from "node:crypto";
import bufferutil from "bufferutil";
import { bench, group, run, summary } from "mitata-v1";
import jsFast from "../collections/js.js";
import jsSimple from "../collections/js-simple.js";
import wsm from "../index.js";
import wasm from "../wasm-sync.js";

/**@type {{ CONTINUATION: 0; TEXT: 1; BINARY: 2; CLOSE: 8; PING: 9; PONG: 10; }} */
const opcodes = Object.setPrototypeOf(
  {
    CONTINUATION: 0x0,
    TEXT: 0x1,
    BINARY: 0x2,
    CLOSE: 0x8,
    PING: 0x9,
    PONG: 0xa,
  },
  null,
);

const BUFFER_SIZE = 8 * 1024;
let buffer = null;
let bufIdx = BUFFER_SIZE;

/**
 * @returns {number[]}
 */
function generateMask() {
  if (bufIdx >= BUFFER_SIZE) {
    bufIdx = 0;
    buffer ??= Buffer.allocUnsafeSlow(BUFFER_SIZE);
    crypto.randomFillSync(buffer, 0, BUFFER_SIZE);
  }
  return [
    buffer[bufIdx++],
    buffer[bufIdx++],
    buffer[bufIdx++],
    buffer[bufIdx++],
  ];
}

class WebSocketFrame {
  constructor() {
    throw new TypeError("Illegal constructor");
  }

  /**
   * @param {Uint8Array} buffer
   * @param {number} opcode
   * @param {number} flags
   * @param {(source: Uint8Array, mask: Uint8Array | number[], output: Uint8Array, offset: number, length: number) => void} mask
   */
  static createFrame(buffer, opcode, flags, mask) {
    const length = buffer.length;
    let offset = 0;
    if (length < 126) {
      offset += 2;
    } else if (length >= 126 && length <= 0xffff) {
      offset += 4;
    } else {
      offset += 10;
    }
    if ((flags & WebSocketFrame.MASK) !== 0) {
      offset += 4;
    }
    const frame = Buffer.allocUnsafeSlow(offset + length);

    frame[0] = frame[1] = 0;

    if ((flags & WebSocketFrame.FIN) !== 0) {
      // fin
      frame[0] |= 0x80;
    }
    if ((flags & WebSocketFrame.RSV1) !== 0) {
      // rsv1
      frame[0] |= 0x40;
    }
    if ((flags & WebSocketFrame.RSV2) !== 0) {
      // rsv2
      frame[0] |= 0x20;
    }
    if ((flags & WebSocketFrame.RSV3) !== 0) {
      // rsv3
      frame[0] |= 0x10;
    }

    // opcode
    frame[0] &= 0xf0;
    frame[0] |= opcode & 0xf;

    if ((flags & WebSocketFrame.MASK) !== 0) {
      // mask
      frame[1] |= 0x80;
    }

    if (length < 126) {
      frame[1] |= length & 0xff;
    } else if (length <= 0xffff) {
      frame[1] = (frame[1] & 0x80) | 126;
      frame[2] = (length >> 8) & 0xff;
      frame[3] = length & 0xff;
    } else {
      if (length > 0x7fffffff) {
        throw new Error("Array buffer allocation failed");
      }
      frame[1] = (frame[1] & 0x80) | 127;
      frame[2] = 0; // (length >> 56) & 0xff;
      frame[3] = 0; // (length >> 48) & 0xff;
      frame[4] = 0; // (length >> 40) & 0xff;
      frame[5] = 0; // (length >> 32) & 0xff;
      frame[6] = (length >> 24) & 0xff;
      frame[7] = (length >> 16) & 0xff;
      frame[8] = (length >> 8) & 0xff;
      frame[9] = (length >> 0) & 0xff;
    }

    if ((flags & WebSocketFrame.MASK) !== 0) {
      const maskKey = generateMask();
      // mask
      frame[offset - 4] = maskKey[0] >> 0;
      frame[offset - 3] = maskKey[1] >> 0;
      frame[offset - 2] = maskKey[2] >> 0;
      frame[offset - 1] = maskKey[3] >> 0;

      if (length !== 0) {
        mask(buffer, new Uint8Array(maskKey), frame, offset, length);
      }
    } else if (length !== 0) {
      frame.set(buffer, offset);
    }

    return frame;
  }

  static FIN = 1 << 1;
  static MASK = 1 << 2;
  static RSV1 = 1 << 3;
  static RSV2 = 1 << 4;
  static RSV3 = 1 << 5;
}

const settings = {
  "4b": 4, // overhead
  "64b": 64,
  "16Kib": 16 * 1024,
  "64Kib": 64 * 1024,
  "128Kib": 128 * 1024,
  "256Kib": 256 * 1024,
  "16Mib": 16 * 1024 * 1024,
  "32Mib": 32 * 1024 * 1024,
  "64Mib": 64 * 1024 * 1024,
  "128Mib": 128 * 1024 * 1024,
  "256Mib": 256 * 1024 * 1024,
};

for (const [name, len] of Object.entries(settings)) {
  const bytes = crypto.randomBytes(len);
  group(name, () => {
    summary(() => {
      bench("wasm-simd", () => {
        return WebSocketFrame.createFrame(
          bytes,
          opcodes.BINARY,
          WebSocketFrame.MASK,
          wasm.mask,
        );
      }).gc("inner");
      bench("wsm", () => {
        return WebSocketFrame.createFrame(
          bytes,
          opcodes.BINARY,
          WebSocketFrame.MASK,
          wsm.mask,
        );
      }).gc("inner");
      bench("js - simple", () => {
        return WebSocketFrame.createFrame(
          bytes,
          opcodes.BINARY,
          WebSocketFrame.MASK,
          jsSimple.mask,
        );
      }).gc("inner");
      bench("js", () => {
        return WebSocketFrame.createFrame(
          bytes,
          opcodes.BINARY,
          WebSocketFrame.MASK,
          jsFast.mask,
        );
      }).gc("inner");
      bench("bufferutil", () => {
        return WebSocketFrame.createFrame(
          bytes,
          opcodes.BINARY,
          WebSocketFrame.MASK,
          bufferutil.mask,
        );
      }).gc("inner");
      bench("no mask", () => {
        return WebSocketFrame.createFrame(bytes, opcodes.BINARY, 0, () => {});
      }).gc("inner");
    });
  });
}

await run();
